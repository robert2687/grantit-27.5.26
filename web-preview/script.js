const grants = [
  {
    id: "1",
    name: "Horizon Europe: AI Innovation",
    amount: "€2,500,000",
    deadline: "Oct 15, 2026",
    score: 91,
    theme: "Responsible AI tooling for public benefit"
  },
  {
    id: "2",
    name: "Digital Europe: Cloud Infrastructure",
    amount: "€1,200,000",
    deadline: "Nov 01, 2026",
    score: 84,
    theme: "Secure shared cloud capacity"
  },
  {
    id: "3",
    name: "EIC Accelerator: GovTech Pilots",
    amount: "€1,200,000",
    deadline: "Dec 08, 2026",
    score: 78,
    theme: "Pilot-ready civic technology deployments"
  }
];

const state = {
  route: "search",
  selectedGrantId: null,
  sidebarVisible: true
};

const sidebar = document.getElementById("sidebar");
const workspace = document.getElementById("workspace");
const nav = document.getElementById("nav");
const menuFab = document.getElementById("menuFab");
const menuToggle = document.getElementById("menuToggle");

function render() {
  renderSidebar();
  renderScreen();
}

function getSelectedGrant() {
  return grants.find((grant) => grant.id === state.selectedGrantId);
}

function renderSidebar() {
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  if (isMobile) {
    sidebar.classList.add("expanded");
    sidebar.classList.toggle("mobile-open", state.sidebarVisible);
  } else {
    sidebar.classList.remove("mobile-open");
    sidebar.classList.toggle("collapsed", !state.sidebarVisible);
    sidebar.classList.toggle("expanded", state.sidebarVisible);
  }

  menuToggle.textContent = state.sidebarVisible ? "Hide Menu" : "Show Menu";

  nav.querySelectorAll(".nav-item").forEach((btn) => {
    const isActive = btn.dataset.route === state.route;
    btn.classList.toggle("active", isActive);

    btn.onclick = () => {
      state.route = btn.dataset.route;
      render();
      if (isMobile) {
        state.sidebarVisible = false;
        renderSidebar();
      }
    };
  });
}

function cloneTemplate(id) {
  const tpl = document.getElementById(id);
  return tpl.content.cloneNode(true);
}

function renderSearch(container) {
  container.querySelector("#openGrantCount").textContent = grants.length;
  const cards = container.querySelector("#grantCards");

  grants.forEach((grant) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div>
        <h3>${grant.name}</h3>
        <p>${grant.theme}</p>
        <p>Funding: ${grant.amount} · Deadline: ${grant.deadline} · Fit: ${grant.score}%</p>
      </div>
      <button type="button">Send to Evaluation</button>
    `;

    card.querySelector("button").onclick = () => {
      state.selectedGrantId = grant.id;
      state.route = "evaluation";
      render();
    };

    cards.appendChild(card);
  });
}

function renderEvaluation(container) {
  const selectedGrant = getSelectedGrant();
  const badge = container.querySelector("#selectedGrantBadge");
  const text = container.querySelector("#selectedGrantText");
  const fitScore = container.querySelector("#fitScore");
  const fitSummary = container.querySelector("#fitSummary");

  if (!selectedGrant) {
    badge.textContent = "No grant selected";
    text.textContent = "No grant selected. Select an opportunity from Grant Search to preview the evaluation handoff.";
    return;
  }

  badge.textContent = `Grant ${selectedGrant.id}`;
  text.textContent = `${selectedGrant.name} is ready for evaluator review with a ${selectedGrant.score}% strategic fit.`;
  fitScore.textContent = `${selectedGrant.score}`;
  fitSummary.textContent = `${selectedGrant.theme}. Funding request ${selectedGrant.amount}; next deadline ${selectedGrant.deadline}.`;
}

function renderScreen() {
  workspace.innerHTML = "";

  let content;
  switch (state.route) {
    case "search":
      content = cloneTemplate("search-template");
      renderSearch(content);
      break;
    case "evaluation":
      content = cloneTemplate("evaluation-template");
      renderEvaluation(content);
      break;
    case "copywriter":
      content = cloneTemplate("copywriter-template");
      break;
    case "administration":
      content = cloneTemplate("administration-template");
      break;
    case "settings":
      content = cloneTemplate("settings-template");
      break;
    default:
      content = cloneTemplate("search-template");
      renderSearch(content);
      break;
  }

  workspace.appendChild(content);
}

menuFab.addEventListener("click", () => {
  state.sidebarVisible = !state.sidebarVisible;
  renderSidebar();
});

menuToggle.addEventListener("click", () => {
  state.sidebarVisible = !state.sidebarVisible;
  renderSidebar();
});

window.addEventListener("resize", renderSidebar);

render();
