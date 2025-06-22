const url = new URL(window.location.href);
const surveyId = url.searchParams.get("id");

// Partie création du sondage (index.html)
if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
  const form = document.getElementById("createForm");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const theme = document.getElementById("theme").value;
    const res = await fetch("/create", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme })
    });
    const data = await res.json();

    // Afficher le lien du sondage
    const link = `${window.location.origin}/survey.html?id=${data.id}`;
    document.getElementById("linkBox").classList.remove("d-none");
    document.getElementById("surveyLink").value = link;
    document.getElementById("copyBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(link);
      alert("Lien copié !");
    });
  });
}

// Partie répondre au sondage (survey.html)
if (window.location.pathname.includes("survey.html") && surveyId) {
  fetch(`/survey/${surveyId}`).then(res => res.json()).then(data => {
    const form = document.getElementById("surveyForm");
    data.questions.forEach((q, idx) => {
      const div = document.createElement("div");
      div.className = "mb-3";
      div.innerHTML = `<label>Q${idx + 1}: ${q}</label>
        <select class="form-select" name="q${idx}" required>
          <option value="">Choisir</option>
          <option value="Oui">Oui</option>
          <option value="Non">Non</option>`;
      form.appendChild(div);
    });
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.className = "btn btn-success w-100";
    btn.textContent = "Soumettre";
    form.appendChild(btn);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const answers = Array.from(form.querySelectorAll("select")).map(s => s.value);
      await fetch(`/survey/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      alert("Merci pour votre participation !");
      window.location.href = "/";
    });
  });
}

// Partie résultats (results.html)
async function initResults() {
  const url = new URL(window.location.href);
  const surveyId = url.searchParams.get("id");
  const response = await fetch(`/survey/${surveyId}/results`);
  const data = await response.json();

  const chartsDiv = document.getElementById("charts");

  // Vérifie s'il y a des réponses
  if (!data.counts || data.counts.length === 0 || data.counts[0].Oui + data.counts[0].Non === 0) {
    chartsDiv.innerHTML = "<div class='alert alert-warning'>Aucune réponse enregistrée pour ce sondage pour l’instant.</div>";
    return;
  }

  // Générer les graphiques
  data.questions.forEach((q, idx) => {
    const count = data.counts[idx];
    const canvas = document.createElement("canvas");
    chartsDiv.appendChild(canvas);
    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Oui', 'Non'],
        datasets: [{ data: [count.Oui, count.Non], backgroundColor: ['#4CAF50', '#F44336'] }]
      },
      options: {
        plugins: { title: { display: true, text: q } }
      }
    });
  });
}