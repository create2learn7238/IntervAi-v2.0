const { sendMessage } = require('../utils/gemini');
const AIRequestLog = require('../models/AIRequestLog');

async function withRetryAndLogging(requestType, provider, userId, operation) {
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const startTime = Date.now();
    try {
      const result = await operation();
      
      // Log success
      await AIRequestLog.create({
        userId,
        requestType,
        provider,
        success: true,
        responseTime: Date.now() - startTime
      }).catch(err => console.error('Failed to log AI request:', err));
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Log failure
      await AIRequestLog.create({
        userId,
        requestType,
        provider,
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      }).catch(err => console.error('Failed to log AI error:', err));
      
      if (attempt < maxRetries) {
        console.warn(`AI request failed (attempt ${attempt}/${maxRetries}). Retrying in 1s...`);
        await new Promise(res => setTimeout(res, 1000));
      }
    }
  }
  throw new Error(`AI Request Failed after ${maxRetries} attempts: ${lastError.message}`);
}


exports.generateInterviewQuestions = async (jobposition, effectiveJobDesc, jobexp, difficulty, aiPersona, userId = null) => {
    const topics = ['System Design', 'Debugging', 'Security', 'Performance Optimization', 'Concurrency', 'Data Structures', 'Testing', 'API Design', 'Database Modeling', 'Error Handling'];
    const shuffledTopics = topics.sort(() => 0.5 - Math.random()).slice(0, 5).join(', ');

    const randomSeed = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const prompt = `Role Title: <role_title>${jobposition}</role_title>
Role Requirements / Tech Stack: <job_desc>${effectiveJobDesc}</job_desc>
Years of Experience: ${jobexp || '1'}
Difficulty Level: ${difficulty || 'Intermediate'}
AI Interviewer Persona: ${aiPersona}
Randomization Seed: ${randomSeed}

CRITICAL INSTRUCTION: You MUST generate 5 completely UNPREDICTABLE, non-standard interview questions. 
Do NOT ask typical "top 10" questions.
Instead, you MUST strictly base your 5 questions on the following 5 distinct topics, applying them to the Tech Stack: [${shuffledTopics}].
Ensure the tone and difficulty of the questions perfectly matches the AI Interviewer Persona (${aiPersona}).
CRITICAL FORMATTING: Keep each question EXTREMELY short and direct (maximum 15 words). DO NOT write long paragraphs or lengthy scenarios. Be concise.

For each question, provide an "answer" field containing a brief, conceptual ideal technical response. We will use this to evaluate the candidate's actual response.

Return ONLY a valid JSON array exactly matching this structure:
[
  {"question": "Highly specific, scenario-based or deeply technical question here...", "answer": "Brief conceptual technical response here..."}
]
Do not include any explanation or markdown wrapping, only the raw JSON array.`;

    return withRetryAndLogging('GENERATE_INTERVIEW_QUESTIONS', 'gemini', userId, async () => {
      const result = await sendMessage(prompt);
      const text = result.response.text();
      
      let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanedText.indexOf('[');
      const endIndex = cleanedText.lastIndexOf(']');
      
      if (startIndex !== -1 && endIndex !== -1) {
        cleanedText = cleanedText.substring(startIndex, endIndex + 1);
      }
      
      const parsed = JSON.parse(cleanedText);
      return JSON.stringify(parsed);
    });
};

exports.generateCandidateInsights = async (aiScore, trustScore, skills, userId = null) => {
    const prompt = `Act as an expert technical recruiter. Based on the following candidate metrics, generate a JSON profile for the candidate.
Metrics:
- AI Interview Score: ${aiScore}/10
- Proctoring Trust Score: ${trustScore}/100
- Self-Reported Skills: <skills>${skills && skills.length > 0 ? skills.join(', ') : 'None'}</skills>

Return ONLY a valid JSON object matching this structure:
{
  "summary": "2-3 sentences summarizing the candidate's performance and potential.",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
  "recommendedRoles": ["Role 1", "Role 2"]
}
Do not include any explanation or markdown wrapping, only the raw JSON object.`;

    return withRetryAndLogging('GENERATE_CANDIDATE_INSIGHTS', 'gemini', userId, async () => {
      const result = await sendMessage(prompt);
      const text = result.response.text();
      
      let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const startIndex = cleanedText.indexOf('{');
      const endIndex = cleanedText.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1) {
        cleanedText = cleanedText.substring(startIndex, endIndex + 1);
      }
      
      return JSON.parse(cleanedText);
    });
};
