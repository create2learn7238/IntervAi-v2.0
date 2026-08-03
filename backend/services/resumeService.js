const fs = require('fs');
const pdfParse = require('pdf-parse');

const processPdfText = (resumeText, jobTitle) => {
    // Very basic mock keyword dictionary for ATS scoring
    const techKeywords = ['react', 'javascript', 'node.js', 'rest api', 'git', 'problem solving', 'docker', 'aws', 'python', 'java', 'sql', 'mongodb', 'agile', 'css', 'html', 'typescript'];
    
    let foundKeywords = [];
    let missingKeywords = [];

        techKeywords.forEach(keyword => {
            if (resumeText.includes(keyword)) {
                foundKeywords.push(keyword);
            } else {
                missingKeywords.push(keyword);
            }
        });

        const totalKeywords = techKeywords.length;
        const matchScore = Math.round((foundKeywords.length / totalKeywords) * 100);

        // Simple recommendations based on score
        const recommendations = [];
        if (matchScore < 50) {
            recommendations.push(`Consider adding more relevant keywords like ${missingKeywords.slice(0, 3).join(', ')}.`);
        } else {
            recommendations.push('Your keyword density is good, but ensure your bullet points contain quantifiable metrics.');
        }

    return {
        matchScore,
        summary: `Analyzed resume against general tech requirements for a ${jobTitle || 'Software Engineer'} role.`,
        keywordsFound: foundKeywords,
        missingKeywords,
        atsFormattingScore: matchScore > 70 ? 95 : 75,
        recommendations
    };
};

exports.analyzeResume = async (filePath, jobTitle) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return processPdfText(data.text.toLowerCase(), jobTitle);
    } catch (error) {
        console.error('Error parsing PDF from file:', error);
        return {
            matchScore: 0,
            summary: "Failed to parse resume.",
            keywordsFound: [],
            missingKeywords: [],
            atsFormattingScore: 0,
            recommendations: ['Ensure your resume is a standard, text-searchable PDF.']
        };
    }
};

exports.analyzeResumeBuffer = async (buffer, jobTitle) => {
    try {
        const data = await pdfParse(buffer);
        return processPdfText(data.text.toLowerCase(), jobTitle);
    } catch (error) {
        console.error('Error parsing PDF from buffer:', error);
        return {
            matchScore: 0,
            summary: "Failed to parse resume from cloud.",
            keywordsFound: [],
            missingKeywords: [],
            atsFormattingScore: 0,
            recommendations: ['Ensure your resume is a standard, text-searchable PDF.']
        };
    }
};
