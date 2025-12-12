const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const STRESS_CATEGORIES = [
  'academic_stress',
  'career_job_stress',
  'relationship_stress',
  'friendship_social_stress',
  'family_stress',
  'financial_stress',
  'self_esteem_confidence_stress',
  'emotional_mental_overload',
  'health_physical_wellbeing_stress',
  'loneliness_isolation_stress'
];

async function classifyStress(issueDescription) {
  try {
    const prompt = `You are a stress category classifier. Analyze the following user's life problem and classify it into ONE category.

Available categories:
- academic_stress: School, college, exams, grades, coursework
- career_job_stress: Job search, work pressure, career decisions
- relationship_stress: Romantic relationships, dating, breakups
- friendship_social_stress: Friends, social life, peer pressure
- family_stress: Family conflicts, parents, siblings
- financial_stress: Money problems, debt, expenses
- self_esteem_confidence_stress: Self-worth, confidence, identity
- emotional_mental_overload: Anxiety, depression, overwhelming feelings
- health_physical_wellbeing_stress: Physical health, fitness, medical issues
- loneliness_isolation_stress: Feeling alone, disconnected, isolated

User's problem: "${issueDescription}"

Respond with ONLY a JSON object: {"category": "one_of_the_categories"}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 100
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      return { category: 'emotional_mental_overload' };
    }

    const result = JSON.parse(jsonMatch[0]);
    
    if (!STRESS_CATEGORIES.includes(result.category)) {
      return { category: 'emotional_mental_overload' };
    }

    return result;
  } catch (error) {
    console.error('Error classifying stress:', error);
    return { category: 'emotional_mental_overload' };
  }
}

module.exports = { classifyStress, STRESS_CATEGORIES };
