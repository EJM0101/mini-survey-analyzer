const fetch = require('node-fetch');

module.exports = async function generateQuestions(theme) {
  const prompt = `
Tu es un expert en méthodologie de recherche quantitative.
Génère un questionnaire de 3 questions fermées adaptées au sujet suivant : "${theme}".
Les questions doivent porter sur des faits mesurables, et chaque question doit avoir les options Oui/Non ou des choix simples.
Réponds uniquement au format suivant :

Q1 : [question 1] (Oui/Non)
Q2 : [question 2] (Oui/Non)
Q3 : [question 3] (Oui/Non)
`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5
    })
  });

  const data = await response.json();
  if (data.choices && data.choices[0]) {
    const raw = data.choices[0].message.content;
    const questions = raw.split('\n').map(line => line.replace(/^Q[0-9]+ : /, '').split('(')[0].trim()).filter(q => q);
    return questions;
  } else {
    throw new Error("Erreur génération GPT");
  }
};