const OpenAI = require('openai').default;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"

});

// Generate interview questions using AI
exports.generateInterviewQuestions = async (role, experience, topics = [], count = 5) => {
  try {
    const topicsStr = topics.length > 0 ? topics.join(', ') : 'general';
    
    const prompt = `Generate ${count} interview questions for a ${experience}-level ${role} position.
    Focus on these topics: ${topicsStr}.
    
    Return the response in this JSON format:
    {
      "questions": [
        {
          "question": "The interview question",
          "category": "technical" | "behavioral" | "system-design",
          "difficulty": "easy" | "medium" | "hard",
          "expectedAnswer": "A brief outline of what a good answer should include"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer with years of experience in software engineering hiring.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0].message.content;
    
    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (parseError) {
      // Fallback: return raw text
      return {
        questions: [{
          question: responseText,
          category: 'technical',
          difficulty: 'medium',
          expectedAnswer: null
        }]
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate interview questions');
  }
};

// Generate detailed answer/explanation
exports.generateExplanation = async (question, context = '') => {
  try {
    const prompt = `Provide a detailed, educational explanation for the following interview question:
    
    Question: ${question}
    ${context ? `Context: ${context}` : ''}
    
    Include:
    1. A clear, concise answer
    2. Key concepts explained
    3. Code examples where applicable
    4. Common pitfalls to avoid
    5. Follow-up questions the interviewer might ask`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert software engineering educator who explains complex concepts clearly.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return {
      explanation: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate explanation');
  }
};

// Chat with AI interviewer
exports.chatWithAI = async (messages, role = 'general') => {
  try {
    const systemPrompt = `You are an expert technical interviewer and career coach helping a candidate prepare for a ${role} position. 
    Provide helpful, constructive feedback and guidance. Be encouraging but honest about areas for improvement.
    
    You can:
    - Answer questions about technical topics
    - Provide interview tips and strategies
    - Conduct mock interviews
    - Review and provide feedback on answers
    - Suggest resources for further learning`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content
      }))
    ];

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: formattedMessages,
      temperature: 0.8,
      max_tokens: 1500
    });

    return {
      response: completion.choices[0].message.content,
      tokens: completion.usage?.total_tokens
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

// Generate college exam questions
exports.generateCollegeQuestions = async (subject, topic, difficulty = 'medium', count = 5) => {
  try {
    const prompt = `Generate ${count} ${difficulty}-level exam questions for ${subject} on the topic of ${topic}.
    
    Return the response in this JSON format:
    {
      "questions": [
        {
          "type": "mcq" | "qa",
          "question": "The question text",
          "options": ["option1", "option2", "option3", "option4"], // for MCQ only
          "correctAnswer": 0, // index of correct option for MCQ
          "answer": "The detailed answer",
          "explanation": "Why this is the correct answer"
        }
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert computer science professor creating exam questions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response');
    } catch (parseError) {
      return {
        questions: [{
          type: 'qa',
          question: responseText,
          answer: 'See explanation above',
          explanation: null
        }]
      };
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate college questions');
  }
};

// Evaluate user's answer
exports.evaluateAnswer = async (question, userAnswer, correctAnswer = '') => {
  try {
    const prompt = `Evaluate the following answer to an interview question:
    
    Question: ${question}
    ${correctAnswer ? `Expected Answer: ${correctAnswer}` : ''}
    User's Answer: ${userAnswer}
    
    Provide:
    1. A score from 1-10
    2. What was good about the answer
    3. What could be improved
    4. A model answer
    
    Return in JSON format:
    {
      "score": 7,
      "feedback": "Detailed feedback",
      "improvements": ["improvement1", "improvement2"],
      "modelAnswer": "A better way to answer"
    }`;

    const completion = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interviewer providing constructive feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content;
    
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Return raw feedback
    }
    
    return {
      score: null,
      feedback: responseText,
      improvements: [],
      modelAnswer: null
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to evaluate answer');
  }
};
