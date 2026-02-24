const form = document.getElementById("form");
const list = document.getElementById("list");

let profiles = JSON.parse(localStorage.getItem("profiles") || "[]");

function render() {
  list.innerHTML = "";
  profiles.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} — ${p.role}`;
    list.appendChild(li);
  });
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const profile = {
    name: document.getElementById("name").value,
    role: document.getElementById("role").value
  };

  profiles.push(profile);
  localStorage.setItem("profiles", JSON.stringify(profiles));

  form.reset();
  render();
});

render();
