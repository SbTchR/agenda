/*******************************************************
 * Configuration de base
 *******************************************************/

// Nombre total de semaines
const TOTAL_WEEKS = 39;

// Branches disponibles
const BRANCHES = [
  "All", "Fra", "Math", "His", "Géo", "Ang", "Scn", "Mus", "AVI", "Forgen", "Autre"
];

// Mot de passe pour supprimer un devoir
const DELETE_PASSWORD = "XXX";

/*******************************************************
 * Éléments du DOM
 *******************************************************/
const weekSelectorBtn = document.getElementById("weekSelectorBtn");
const weekList = document.getElementById("weekList");
const currentWeekDisplay = document.getElementById("currentWeekDisplay");
const weekDates = document.getElementById("weekDates");

const daysContainer = document.getElementById("daysContainer");

// Overlays
const addHomeworkScreen = document.getElementById("addHomeworkScreen");
const detailsScreen = document.getElementById("detailsScreen");
const deleteModal = document.getElementById("deleteModal");
const libraryScreen = document.getElementById("libraryScreen");
const branchLibraryScreen = document.getElementById("branchLibraryScreen");
const addManualScreen = document.getElementById("addManualScreen");

// Boutons / inputs
const closeAddBtn = document.getElementById("closeAddBtn");
const createHomeworkBtn = document.getElementById("createHomeworkBtn");
const homeworkTitleInput = document.getElementById("homeworkTitle");
const attachmentInput = document.getElementById("attachmentInput");
const addAttachmentBtn = document.getElementById("addAttachmentBtn");

const detailsBackBtn = document.getElementById("detailsBackBtn");
const detailsTitle = document.getElementById("detailsTitle");
const detailsAttachments = document.getElementById("detailsAttachments");
const modifyBtn = document.getElementById("modifyBtn");
const validateBtn = document.getElementById("validateBtn");
const deleteBtn = document.getElementById("deleteBtn");

const deletePasswordInput = document.getElementById("deletePassword");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const openLibraryBtn = document.getElementById("openLibraryBtn");
const closeLibraryBtn = document.getElementById("closeLibraryBtn");

const libraryMain = document.getElementById("libraryMain");
const branchLibraryTitle = document.getElementById("branchLibraryTitle");
const manualsList = document.getElementById("manualsList");
const backToLibraryBtn = document.getElementById("backToLibraryBtn");
const addManualBtn = document.getElementById("addManualBtn");
const closeAddManualBtn = document.getElementById("closeAddManualBtn");
const createManualBtn = document.getElementById("createManualBtn");
const manualTitleInput = document.getElementById("manualTitleInput");
const manualLinkInput = document.getElementById("manualLinkInput");

// Type de devoir
let selectedType = null;

// Branche sélectionnée
let selectedBranch = null;

// Jour actuel sur lequel on ajoute un devoir
let currentDayForAdd = null;

// Devoir actuellement en cours de visualisation
let currentHomeworkId = null;

// Semaine sélectionnée
let currentWeek = 1;

// Structure des données
// homeworkData = [
//   {
//     id: "someUniqueId",
//     week: 1,
//     day: "Lundi",
//     branch: "All",
//     type: "devoir" / "ta" / "ts",
//     title: "nom du devoir",
//     attachments: [ ...paths ou URLs ou base64 ... ]
//   },
//   ...
// ]
let homeworkData = [];

// manuels = {
//   "All": [ { title: "...", link: "..." }, ... ],
//   "Fra": [],
//   ...
// }
let manuels = {
  All: [],
  Fra: [],
  Math: [],
  His: [],
  Géo: [],
  Ang: [],
  Scn: [],
  Mus: [],
  AVI: [],
  Forgen: [],
  Autre: []
};

/*******************************************************
 * Initialisation
 *******************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Charger localStorage si besoin
  loadDataFromLocalStorage();

  // Initialiser la liste de semaines
  renderWeekList();

  // Initialiser la semaine par défaut
  setWeek(currentWeek);

  // Générer l’affichage principal
  renderDays();

  // Générer la liste de branches sur l'écran d'ajout de devoir
  renderBranchButtons();

  // Générer la bibliothèque principale
  renderLibraryMain();

  // Events
  setEventListeners();
});

/*******************************************************
 * Gestion des événements
 *******************************************************/
function setEventListeners() {
  // Ouvrir/fermer la liste des semaines
  weekSelectorBtn.addEventListener("click", () => {
    toggleWeekList();
  });

  // Bouton pour fermer l’écran d’ajout
  closeAddBtn.addEventListener("click", closeAddHomeworkScreen);

  // Création du devoir
  createHomeworkBtn.addEventListener("click", createHomework);

  // Bouton ajout d'attachement
  addAttachmentBtn.addEventListener("click", () => {
    attachmentInput.click();
  });

  // Retour depuis détails
  detailsBackBtn.addEventListener("click", () => {
    detailsScreen.classList.add("hidden");
  });

  // Modifier un devoir
  modifyBtn.addEventListener("click", enableHomeworkEditing);

  // Valider la modification
  validateBtn.addEventListener("click", validateHomeworkEditing);

  // Supprimer un devoir (ouvrir le modal)
  deleteBtn.addEventListener("click", () => {
    deleteModal.classList.remove("hidden");
    deletePasswordInput.value = "";
  });

  // Confirm / cancel delete
  confirmDeleteBtn.addEventListener("click", confirmDelete);
  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
  });

  // Ouvrir la bibliothèque
  openLibraryBtn.addEventListener("click", () => {
    libraryScreen.classList.remove("hidden");
  });
  // Fermer la bibliothèque
  closeLibraryBtn.addEventListener("click", () => {
    libraryScreen.classList.add("hidden");
  });

  // Retour à la bibliothèque principale
  backToLibraryBtn.addEventListener("click", () => {
    branchLibraryScreen.classList.add("hidden");
  });

  // Bouton + pour ajouter un manuel
  addManualBtn.addEventListener("click", () => {
    addManualScreen.classList.remove("hidden");
  });
  closeAddManualBtn.addEventListener("click", () => {
    addManualScreen.classList.add("hidden");
  });
  createManualBtn.addEventListener("click", createManual);
}

/*******************************************************
 * Gestion de la liste des semaines
 *******************************************************/
function renderWeekList() {
  weekList.innerHTML = "";
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    const li = document.createElement("li");
    li.textContent = "S. " + i;
    li.addEventListener("click", () => setWeek(i));
    weekList.appendChild(li);
  }
}

function toggleWeekList() {
  if (weekList.classList.contains("hidden")) {
    weekList.classList.remove("hidden");
    // Calculer la hauteur max pour animer
    weekList.style.maxHeight = `${weekList.scrollHeight}px`;
  } else {
    weekList.classList.add("hidden");
    weekList.style.maxHeight = "0";
  }
}

function setWeek(week) {
  currentWeek = week;
  currentWeekDisplay.textContent = "S. " + week;
  // Mettre à jour les dates (ici en démo, on ne calcule pas vraiment)
  weekDates.textContent = `Dates semaine ${week}`;
  // Actualiser l'affichage
  renderDays();
  // Fermer la liste
  weekList.classList.add("hidden");
  weekList.style.maxHeight = "0";
}

/*******************************************************
 * Affichage des jours
 *******************************************************/
function renderDays() {
  daysContainer.innerHTML = "";
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

  days.forEach(day => {
    const dayBlock = document.createElement("div");
    dayBlock.className = "day-block";
    dayBlock.innerHTML = `<h3>${day}</h3>`;
    dayBlock.addEventListener("click", () => openAddHomeworkScreen(day));

    // Ajouter les devoirs existants
    const filteredHomework = homeworkData.filter(
      hw => hw.week === currentWeek && hw.day === day
    );

    filteredHomework.forEach(hw => {
      const hwDiv = document.createElement("div");
      hwDiv.classList.add("homework-item");
      hwDiv.classList.add(`hw-${hw.type}`);
      hwDiv.innerHTML = `
        <span class="branch-${hw.branch.toLowerCase()}">${hw.branch}</span> : ${hw.title}
      `;
      hwDiv.addEventListener("click", (e) => {
        // Empêcher d'ouvrir l'écran d'ajout en même temps
        e.stopPropagation();
        openHomeworkDetails(hw.id);
      });
      dayBlock.appendChild(hwDiv);
    });

    daysContainer.appendChild(dayBlock);
  });
}

/*******************************************************
 * Ouverture/fermeture de l'écran d'ajout
 *******************************************************/
function openAddHomeworkScreen(day) {
  currentDayForAdd = day;
  selectedType = null;
  selectedBranch = null;
  homeworkTitleInput.value = "";
  addHomeworkScreen.classList.remove("hidden");
}

function closeAddHomeworkScreen() {
  addHomeworkScreen.classList.add("hidden");
}

/*******************************************************
 * Affichage des boutons de branches (ajout d’un devoir)
 *******************************************************/
function renderBranchButtons() {
  const container = document.querySelector(".branch-container");
  container.innerHTML = "";

  BRANCHES.forEach(branch => {
    const btn = document.createElement("button");
    btn.classList.add("branch-btn");
    btn.dataset.branch = branch;
    btn.textContent = branch;
    btn.addEventListener("click", () => {
      selectedBranch = branch;
      // Visuel : mettre en évidence la sélection
      highlightSelectedBranchButton(branch);
    });
    container.appendChild(btn);
  });
}

function highlightSelectedBranchButton(branch) {
  const container = document.querySelector(".branch-container");
  const buttons = container.querySelectorAll(".branch-btn");
  buttons.forEach(btn => {
    btn.style.outline = "none";
  });
  const selectedBtn = container.querySelector(`[data-branch="${branch}"]`);
  if (selectedBtn) {
    selectedBtn.style.outline = "2px solid #fff";
  }
}

/*******************************************************
 * Création du devoir
 *******************************************************/
function createHomework() {
  if (!selectedBranch || !selectedType || !homeworkTitleInput.value.trim()) {
    alert("Veuillez sélectionner une branche, un type de devoir et saisir un titre.");
    return;
  }

  // Créer un ID unique
  const hwId = Date.now().toString();

  // Gestion des pièces jointes
  const files = attachmentInput.files;
  const attachmentsArray = [];
  if (files.length > 0) {
    // Pour simplifier, on ne fait pas de conversion, juste on enregistre les noms
    for (let i = 0; i < files.length; i++) {
      attachmentsArray.push(files[i].name);
    }
  }

  const newHomework = {
    id: hwId,
    week: currentWeek,
    day: currentDayForAdd,
    branch: selectedBranch,
    type: selectedType,
    title: homeworkTitleInput.value.trim(),
    attachments: attachmentsArray
  };

  homeworkData.push(newHomework);

  // Remise à zéro de l'input file
  attachmentInput.value = "";
  // Réinitialiser la sélection
  selectedBranch = null;
  highlightSelectedBranchButton(null);
  selectedType = null;
  resetTypeButtons();
  homeworkTitleInput.value = "";

  // Mettre à jour l’affichage
  renderDays();
  closeAddHomeworkScreen();

  // Sauvegarder
  saveDataToLocalStorage();
}

function resetTypeButtons() {
  const typeButtons = document.querySelectorAll(".type-btn");
  typeButtons.forEach(btn => {
    btn.style.outline = "none";
  });
}

/*******************************************************
 * Sélection du type de devoir
 *******************************************************/
const typeBtns = document.querySelectorAll(".type-btn");
typeBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = btn.getAttribute("data-type");
    resetTypeButtons();
    btn.style.outline = "2px solid #fff";
  });
});

/*******************************************************
 * Voir les détails d'un devoir
 *******************************************************/
function openHomeworkDetails(hwId) {
  currentHomeworkId = hwId;
  const hw = homeworkData.find(item => item.id === hwId);
  if (!hw) return;

  detailsTitle.textContent = `${hw.branch} : ${hw.title}`;
  renderAttachments(hw.attachments);

  // Mode lecture seule par défaut
  homeworkTitleInput.disabled = true;

  detailsScreen.classList.remove("hidden");
}

function renderAttachments(attachmentsArr) {
  detailsAttachments.innerHTML = "";
  attachmentsArr.forEach(att => {
    const li = document.createElement("li");
    li.textContent = att;
    detailsAttachments.appendChild(li);
  });
}

/*******************************************************
 * Modifier un devoir
 *******************************************************/
function enableHomeworkEditing() {
  const hw = homeworkData.find(item => item.id === currentHomeworkId);
  if (!hw) return;

  // Permettre de changer le titre
  const newTitle = prompt("Modifiez le titre du devoir :", hw.title);
  if (newTitle !== null) {
    hw.title = newTitle.trim() || hw.title;
  }

  // Permettre d’ajouter de nouvelles pièces jointes
  const newFiles = prompt("Ajouter des noms de fichiers séparés par des virgules (ou laisser vide) :");
  if (newFiles && newFiles.trim().length > 0) {
    hw.attachments = hw.attachments.concat(newFiles.split(",").map(f => f.trim()));
  }

  detailsTitle.textContent = `${hw.branch} : ${hw.title}`;
  renderAttachments(hw.attachments);
}

/*******************************************************
 * Valider la modification
 *******************************************************/
function validateHomeworkEditing() {
  detailsScreen.classList.add("hidden");
  saveDataToLocalStorage();
  renderDays();
}

/*******************************************************
 * Suppression du devoir
 *******************************************************/
function confirmDelete() {
  if (deletePasswordInput.value !== DELETE_PASSWORD) {
    alert("Mot de passe incorrect.");
    return;
  }

  homeworkData = homeworkData.filter(item => item.id !== currentHomeworkId);
  deleteModal.classList.add("hidden");
  detailsScreen.classList.add("hidden");
  saveDataToLocalStorage();
  renderDays();
}

/*******************************************************
 * Bibliothèque
 *******************************************************/
function renderLibraryMain() {
  libraryMain.innerHTML = "";
  BRANCHES.forEach(branch => {
    const btn = document.createElement("button");
    btn.classList.add("library-btn");
    btn.style.backgroundColor = getBranchColor(branch);
    btn.textContent = branch;
    btn.addEventListener("click", () => openBranchLibrary(branch));
    libraryMain.appendChild(btn);
  });
}

function openBranchLibrary(branch) {
  branchLibraryTitle.textContent = "Manuels " + branch;
  renderBranchManuals(branch);
  branchLibraryScreen.classList.remove("hidden");
}

function renderBranchManuals(branch) {
  manualsList.innerHTML = "";
  manuels[branch].forEach((manual, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${manual.link}" target="_blank">${manual.title}</a>`;
    manualsList.appendChild(li);
  });
  // Retenir la branche en cours pour ajouter un manuel
  branchLibraryScreen.dataset.currentBranch = branch;
}

function createManual() {
  const branch = branchLibraryScreen.dataset.currentBranch;
  const title = manualTitleInput.value.trim();
  const link = manualLinkInput.value.trim();
  if (!title || !link) {
    alert("Veuillez renseigner un titre et un lien PDF.");
    return;
  }
  manuels[branch].push({ title, link });
  manualTitleInput.value = "";
  manualLinkInput.value = "";
  renderBranchManuals(branch);
  saveDataToLocalStorage();
  addManualScreen.classList.add("hidden");
}

/*******************************************************
 * Couleurs associées à chaque branche
 *******************************************************/
function getBranchColor(branch) {
  switch(branch) {
    case "All":    return "#8e44ad";
    case "Fra":    return "#2c3e50";
    case "Math":   return "#e67e22";
    case "His":    return "#b71c1c";
    case "Géo":    return "#00695c";
    case "Ang":    return "#1e88e5";
    case "Scn":    return "#43a047";
    case "Mus":    return "#e91e63";
    case "AVI":    return "#9c27b0";
    case "Forgen": return "#37474f";
    case "Autre":  return "#757575";
    default:       return "#ccc";
  }
}

/*******************************************************
 * Sauvegarde / Chargement (LocalStorage)
 * Remarque : cette approche ne permet pas le partage
 *            entre plusieurs utilisateurs en ligne.
 *******************************************************/
function saveDataToLocalStorage() {
  localStorage.setItem("homeworkData", JSON.stringify(homeworkData));
  localStorage.setItem("manuels", JSON.stringify(manuels));
}

function loadDataFromLocalStorage() {
  const hwData = localStorage.getItem("homeworkData");
  if (hwData) {
    homeworkData = JSON.parse(hwData);
  }

  const manualsData = localStorage.getItem("manuels");
  if (manualsData) {
    manuels = JSON.parse(manualsData);
  }
}