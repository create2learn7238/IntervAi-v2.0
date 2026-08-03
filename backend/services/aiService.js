const { sendMessage } = require('../utils/gemini');

exports.generatePracticeQuestions = async () => {
    const prompt = `Act as a senior HR recruiter. Generate 5 UNIQUE, RANDOMIZED behavioral and situational interview questions with structured STAR method advice in JSON format.
Vary the questions across leadership, conflict resolution, time management, failure, and adaptability.

Return ONLY a valid JSON array exactly matching this structure:
[
  {"q": "The behavioral question here", "a": "Specific advice on how to structure the answer using the STAR method", "category": "Short Category Name"}
]
Do not include any explanation or markdown wrapping, only the raw JSON array.`;

    const result = await sendMessage(prompt);
    const text = result.response.text();
    let cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const startIndex = cleanedText.indexOf('[');
    const endIndex = cleanedText.lastIndexOf(']');
    
    if (startIndex !== -1 && endIndex !== -1) {
      cleanedText = cleanedText.substring(startIndex, endIndex + 1);
    }
    return JSON.parse(cleanedText);
};

exports.generateInterviewQuestions = async (jobposition, effectiveJobDesc, jobexp, difficulty) => {
    const topics = ['System Design', 'Debugging', 'Security', 'Performance Optimization', 'Concurrency', 'Data Structures', 'Testing', 'API Design', 'Database Modeling', 'Error Handling'];
    const shuffledTopics = topics.sort(() => 0.5 - Math.random()).slice(0, 5).join(', ');

    const randomSeed = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const prompt = `Role Title: "${jobposition}"
Role Requirements / Tech Stack: "${effectiveJobDesc}"
Years of Experience: ${jobexp || '1'}
Difficulty Level: ${difficulty || 'Intermediate'}
Randomization Seed: ${randomSeed}

CRITICAL INSTRUCTION: You MUST generate 5 completely UNPREDICTABLE, non-standard interview questions. 
Do NOT ask typical "top 10" questions.
Instead, you MUST strictly base your 5 questions on the following 5 distinct topics, applying them to the Tech Stack: [${shuffledTopics}].
CRITICAL FORMATTING: Keep each question EXTREMELY short and direct (maximum 15 words). DO NOT write long paragraphs or lengthy scenarios. Be concise.

For each question, provide an "answer" field containing a brief, conceptual ideal technical response. We will use this to evaluate the candidate's actual response.

Return ONLY a valid JSON array exactly matching this structure:
[
  {"question": "Highly specific, scenario-based or deeply technical question here...", "answer": "Brief conceptual technical response here..."}
]
Do not include any explanation or markdown wrapping, only the raw JSON array.`;

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
};
