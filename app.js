const form = document.getElementById("form");
const list = document.getElementById("list");
const clientPick = document.getElementById("clientPick");
const matchBtn = document.getElementById("matchBtn");
const matchesEl = document.getElementById("matches");
const pairingsEl = document.getElementById("pairings");

let profiles = JSON.parse(localStorage.getItem("profiles") || "[]");
let pairings = JSON.parse(localStorage.getItem("pairings") || "[]");

const goalLabel = (g) => ({
  weight_loss: "Weight loss",
  muscle_gain: "Muscle gain",
  endurance: "Endurance",
  mobility: "Mobility",
  general: "General fitness"
}[g] || g);

function save() {
  localStorage.setItem("profiles", JSON.stringify(profiles));
  localStorage.setItem("pairings", JSON.stringify(pairings));
}

function renderProfiles() {
  list.innerHTML = "";
  profiles.forEach((p, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `${p.name} — ${p.role} <span class="pill">${goalLabel(p.goal)}</span>`;
    list.appendChild(li);
  });
}

function renderClientPicker() {
  clientPick.innerHTML = "";
  const clients = profiles.filter(p => p.role === "client");

  if (clients.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No clients yet (add one above)";
    clientPick.appendChild(opt);
    clientPick.disabled = true;
    matchBtn.disabled = true;
    return;
  }

  clientPick.disabled = false;
  matchBtn.disabled = false;

  clients.forEach((c, idx) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${goalLabel(c.goal)})`;
    clientPick.appendChild(opt);
  });
}

function renderPairings() {
  pairingsEl.innerHTML = "";

  if (pairings.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No pairings yet.";
    pairingsEl.appendChild(li);
    return;
  }

  pairings.forEach(pr => {
    const client = profiles.find(p => p.id === pr.clientId);
    const coach = profiles.find(p => p.id === pr.coachId);

    const li = document.createElement("li");
    li.innerHTML = `✅ ${client?.name || "Client"} paired with ${coach?.name || "Coach"}
      <span class="pill">${goalLabel(pr.goal)}</span>`;
    pairingsEl.appendChild(li);
  });
}

function render() {
  renderProfiles();
  renderClientPicker();
  renderPairings();
}

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

// Matching logic: same goal = best match
function findCoachMatches(client) {
  const coaches = profiles.filter(p => p.role === "coach");

  const ranked = coaches.map(coach => {
    let score = 0;
    if (coach.goal === client.goal) score += 100;  // perfect
    else if (coach.goal === "general") score += 60; // flexible coach
    else score += 20;

    return { coach, score };
  }).sort((a, b) => b.score - a.score);

  return ranked;
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const profile = {
    id: uuid(),
    name: document.getElementById("name").value.trim(),
    role: document.getElementById("role").value,
    goal: document.getElementById("goal").value
  };

  profiles.push(profile);
  save();
  form.reset();
  render();

  matchesEl.innerHTML = ""; // clear old matches
});

matchBtn.addEventListener("click", () => {
  matchesEl.innerHTML = "";

  const clientId = clientPick.value;
  const client = profiles.find(p => p.id === clientId);

  if (!client) {
    const li = document.createElement("li");
    li.textContent = "Pick a client first.";
    matchesEl.appendChild(li);
    return;
  }

  const results = findCoachMatches(client);

  if (results.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No coaches yet. Add a coach profile first.";
    matchesEl.appendChild(li);
    return;
  }

  results.slice(0, 5).forEach(({ coach, score }) => {
    const li = document.createElement("li");
    li.innerHTML = `${coach.name} <span class="pill">${goalLabel(coach.goal)}</span> — Score: ${score}
      <button class="smallBtn" data-coach="${coach.id}" data-client="${client.id}">Pair</button>`;
    matchesEl.appendChild(li);
  });

  // Pair buttons
  matchesEl.querySelectorAll("button[data-coach]").forEach(btn => {
    btn.addEventListener("click", () => {
      const coachId = btn.getAttribute("data-coach");
      const clientId2 = btn.getAttribute("data-client");

      const client2 = profiles.find(p => p.id === clientId2);
      const coach2 = profiles.find(p => p.id === coachId);

      if (!client2 || !coach2) return;

      // prevent duplicates
      const exists = pairings.some(p => p.clientId === client2.id && p.coachId === coach2.id);
      if (exists) {
        alert("They are already paired!");
        return;
      }

      pairings.push({
        id: uuid(),
        clientId: client2.id,
        coachId: coach2.id,
        goal: client2.goal,
        createdAt: new Date().toISOString()
      });

      save();
      renderPairings();
      alert("Paired!");
    });
  });
});

render();
