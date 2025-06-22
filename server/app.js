const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const surveyStore = require('./surveyStore');
const generateQuestions = require('./openaiRouter');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Génération automatique des questions avec IA
app.post('/create', async (req, res) => {
  const theme = req.body.theme;
  const questions = await generateQuestions(theme);
  const id = surveyStore.createSurvey(questions);
  res.json({ id });
});

app.get('/survey/:id', (req, res) => {
  const survey = surveyStore.getSurvey(req.params.id);
  if (!survey) return res.status(404).json({ error: 'Not found' });
  res.json(survey);
});

app.post('/survey/:id/submit', (req, res) => {
  surveyStore.submitSurvey(req.params.id, req.body.answers);
  res.json({ success: true });
});

app.get('/survey/:id/results', (req, res) => {
  const results = surveyStore.getResults(req.params.id);
  if (!results) return res.status(404).json({ error: 'Not found' });
  res.json(results);
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));