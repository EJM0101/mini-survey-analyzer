const surveys = {};
exports.createSurvey = function (questions) {
  const id = Math.random().toString(36).substr(2, 9);
  surveys[id] = { questions, answers: [] };
  return id;
};
exports.getSurvey = function (id) {
  return surveys[id] || null;
};
exports.submitSurvey = function (id, answers) {
  if (surveys[id]) {
    surveys[id].answers.push(answers);
  }
};
exports.getResults = function (id) {
  const survey = surveys[id];
  if (!survey) return null;
  const counts = survey.questions.map((q, idx) => {
    const total = { Oui: 0, Non: 0 };
    survey.answers.forEach(a => { const ans = a[idx]; if (ans === "Oui" || ans === "Non") total[ans]++; });
    return total;
  });
  return { questions: survey.questions, counts };
};