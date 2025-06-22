const url = new URL(window.location.href);
const surveyId = url.searchParams.get("id");
if (window.location.pathname.includes("survey.html") && surveyId) {
  fetch(`/survey/${surveyId}`).then(res => res.json()).then(data => {
    const form = document.getElementById("surveyForm");
    data.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "mb-3";
      div.innerHTML = `<label>Q${idx + 1}: ${q}</label>
        <select class="form-select" name="q${idx}" required>
          <option value="">Choisir</option><option value="Oui">Oui</option><option value="Non">Non</option></select>`;
      form.appendChild(div);
    });
    const btn = document.createElement("button");
    btn.type = "submit"; btn.className = "btn btn-success w-100"; btn.textContent = "Soumettre"; form.appendChild(btn);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const answers = Array.from(form.querySelectorAll("select")).map(s => s.value);
      await fetch(`/survey/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      alert("Merci pour votre participation!");
      window.location.href = "/";
    });
  });
}
if (window.location.pathname.includes("results.html") && surveyId) {
  fetch(`/survey/${surveyId}/results`).then(res => res.json()).then(data => {
    const chartsDiv = document.getElementById("charts");
    data.questions.forEach((q, idx) => {
      const count = data.counts[idx];
      const canvas = document.createElement("canvas");
      chartsDiv.appendChild(canvas);
      new Chart(canvas, {
        type: 'pie',
        data: {labels: ['Oui', 'Non'],datasets: [{ data: [count.Oui, count.Non], backgroundColor: ['#4CAF50', '#F44336'] }]},
        options: { plugins: { title: { display: true, text: q } } }
      });
    });
  });
}
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const form = document.getElementById("createForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const questions = Array.from(form.querySelectorAll("input[name='question']")).map(input => input.value);
    const res = await fetch("/create", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questions })
    });
    const data = await res.json();
    alert("Sondage créé ! Partagez ce lien : " + window.location.origin + "/survey.html?id=" + data.id);
  });
}