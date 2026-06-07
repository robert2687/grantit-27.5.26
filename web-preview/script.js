const grants = [
  {
    id: "1",
    name: "Horizon Europe: AI Innovation",
    amount: "€2,500,000",
    deadline: "Oct 15, 2026"
  },
  {
    id: "2",
    name: "Digital Europe: Cloud Infrastructure",
    amount: "€1,200,000",
    deadline: "Nov 01, 2026"
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
  const cards = container.querySelector("#grantCards");
  grants.forEach((grant) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${grant.name}</h3>
      <p>Funding: ${grant.amount} | Deadline: ${grant.deadline}</p>
      <button type="button">Send to Evaluation Agent</button>
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
  const text = container.querySelector("#selectedGrantText");
  text.textContent = state.selectedGrantId
    ? `Selected Grant ID: ${state.selectedGrantId}`
    : "No grant selected.";
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
