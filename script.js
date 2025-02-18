/*****************************************************
 * Configuration Firebase : à remplacer par tes infos
 *****************************************************/
const firebaseConfig = {
    apiKey: "AIzaSyAmVSJwvMama0h79rPHiUvPKRgZnfjymXA",
    authDomain: "agenda-bed4f.firebaseapp.com",
    projectId: "agenda-bed4f",
    storageBucket: "agenda-bed4f.firebasestorage.app",
    messagingSenderId: "993980335293",
    appId: "1:993980335293:web:90aa697c134c89e8b5e3d4"
  };
  
// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

/*****************************************************
 * Variables et sélecteurs HTML
 *****************************************************/
const weekButton = document.getElementById("week-button");
const weekList = document.getElementById("week-list");
const currentWeekSpan = document.getElementById("current-week");
const weekDates = document.getElementById("week-dates");

const mainContent = document.getElementById("main-content");

// Écrans
const addTaskScreen = document.getElementById("add-task-screen");
const taskDetailsScreen = document.getElementById("task-details-screen");
const libraryScreen = document.getElementById("library-screen");

// Boutons / Inputs (ajout d'un devoir)
const cancelAddTaskBtn = document.getElementById("cancel-add-task");
const confirmAddTaskBtn = document.getElementById("confirm-add-task");
const taskTitleInput = document.getElementById("task-title-input");
const attachmentInput = document.getElementById("attachment-input");

// Sélection de branche (container)
const branchSelectionContainer = document.querySelector(".branch-selection");
// Boutons du type de devoir
const typeDevoirBtn = document.getElementById("type-devoir");
const typeTaBtn = document.getElementById("type-ta");
const typeTsBtn = document.getElementById("type-ts");

// Détails devoir
const backToMainBtn = document.getElementById("back-to-main");
const detailsTaskTitle = document.getElementById("details-task-title");
const attachmentsList = document.getElementById("attachments-list");
const toggleEditBtn = document.getElementById("toggle-edit");
const validateChangesBtn = document.getElementById("validate-changes");
const editTaskTitleInput = document.getElementById("edit-task-title");
const editAttachmentInput = document.getElementById("edit-attachment-input");
const deleteTaskBtn = document.getElementById("delete-task");

// Modale de mot de passe pour suppression
const passwordModal = document.getElementById("password-modal");
const deletePasswordInput = document.getElementById("delete-password");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const confirmDeleteBtn = document.getElementById("confirm-delete");

// Bibliothèque
const libraryButton = document.getElementById("library-button");
const closeLibraryBtn = document.getElementById("close-library");
const libraryBranchesContainer = document.getElementById("library-branches");
const manualsListContainer = document.getElementById("manuals-list-container");
const manualsList = document.getElementById("manuals-list");
const selectedBranchTitle = document.getElementById("selected-branch-title");
const addManualButton = document.getElementById("add-manual-button");

// Modale pour ajouter un manuel
const addManualModal = document.getElementById("add-manual-modal");
const manualFileInput = document.getElementById("manual-file-input");
const cancelAddManualBtn = document.getElementById("cancel-add-manual");
const confirmAddManualBtn = document.getElementById("confirm-add-manual");

// Variables en mémoire
let selectedBranch = null;        // Pour la bibliothèque
let currentWeek = 1;
let currentDayClicked = null;     // Jour cliqué pour ajouter un devoir
let selectedTaskId = null;        // ID de la tâche sélectionnée pour détails
let selectedTaskData = null;      // Données de la tâche
let selectedTaskType = null;      // "Devoir", "TA", "TS"
let selectedTaskBranch = null;    // "All", "Fra", etc.
let selectedFiles = [];
let editSelectedFiles = [];

/*****************************************************
 * Liste des branches et leurs codes/couleurs
 *****************************************************/
const branches = [
  { code: "All", color: "#ffc107" },
  { code: "Fra", color: "#e91e63" },
  { code: "Math", color: "#ff9800" },
  { code: "His", color: "#9c27b0" },
  { code: "Géo", color: "#75e378" },
  { code: "Ang", color: "#00bcd4" },
  { code: "Scn", color: "#9e9d24" },
  { code: "Mus", color: "#e164b1" },
  { code: "AVI", color: "#795548" },
  { code: "Forgen", color: "#009688" },
  { code: "Autre", color: "#ffffff" }
];

/*****************************************************
 * Initialisation
 *****************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // Crée la liste des semaines 1 à 39
  for (let i = 1; i <= 39; i++) {
    const div = document.createElement("div");
    div.textContent = "S. " + i;
    div.addEventListener("click", () => {
      selectWeek(i);
      toggleWeekList(false);
    });
    weekList.appendChild(div);
  }

  // Sélection de la semaine initiale
  selectWeek(1);

  // Génère les 5 jours à l'écran principal
  generateDays();

  // Génère les boutons de branches pour l'ajout d'un devoir
  generateBranchSelection();

  // Génère les boutons de branches pour la bibliothèque
  generateLibraryBranches();

  // Chargement initial des tâches
  loadTasksForWeek(currentWeek);
});

/*****************************************************
 * Fonctions de gestion de la semaine
 *****************************************************/
weekButton.addEventListener("click", () => {
  toggleWeekList();
});

function toggleWeekList(forceHide = null) {
  if (forceHide === true) {
    weekList.classList.add("hidden");
    return;
  }
  weekList.classList.toggle("hidden");
}

function selectWeek(week) {
    currentWeek = week;
    currentWeekSpan.textContent = week;
    // Ici, nous définissons un affichage personnalisé des dates pour la semaine.
    // Vous pouvez remplacer les dates par un calcul réel selon votre calendrier.
    // Par exemple, pour la semaine 1, afficher "04 - 08 octobre"
    let datesAffichage = "";
    if (week === 1) {
      datesAffichage = "04 - 08 octobre";
    } else if (week === 2) {
      datesAffichage = "11 - 15 octobre";
    } else {
      // Vous pouvez ajouter d'autres cas ou calculer dynamiquement.
      datesAffichage = `Semaine ${week}`;
    }
    weekDates.textContent = datesAffichage;
    loadTasksForWeek(week);
  }

/*****************************************************
 * Génération de l'affichage des jours (lundi->vendredi)
 *****************************************************/
function generateDays() {
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  mainContent.innerHTML = "";
  days.forEach((day) => {
    const dayContainer = document.createElement("div");
    dayContainer.classList.add("day-container");

    // Exemple date fictive
    const randomDate = "04.10";

    const dayTitle = document.createElement("h3");
    dayTitle.textContent = `${day} ${randomDate}`;
    dayTitle.addEventListener("click", () => {
      // Ouvrir l'écran d'ajout de devoir pour ce jour
      currentDayClicked = day;
      openAddTaskScreen();
    });

    dayContainer.appendChild(dayTitle);

    // Liste de tâches
    const tasksList = document.createElement("div");
    tasksList.classList.add("tasks-list");
    tasksList.id = `tasks-${day}`;
    dayContainer.appendChild(tasksList);

    mainContent.appendChild(dayContainer);
  });
}

/*****************************************************
 * Chargement des devoirs depuis Firestore
 *****************************************************/
function loadTasksForWeek(week) {
  // On vide l'affichage
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  days.forEach(day => {
    const tasksList = document.getElementById(`tasks-${day}`);
    if (tasksList) tasksList.innerHTML = "";
  });

  db.collection("tasks")
    .where("week", "==", week)
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const taskData = doc.data();
        displayTask(doc.id, taskData)
      });
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des tâches:", error);
    });
}

/*****************************************************
 * Affichage d'un devoir dans la liste
 *****************************************************/
function displayTask(taskId, taskData) {
    const tasksList = document.getElementById(`tasks-${taskData.day}`);
    if (!tasksList) return; // Si "day" n'est pas un des 5 jours, on ignore
  
    // Vérifier si la tâche est déjà affichée
    if (tasksList.querySelector(`[data-task-id="${taskId}"]`)) {
      return; // Si oui, ne pas ajouter une nouvelle instance
    }
  
    const taskItem = document.createElement("div");
    taskItem.setAttribute("data-task-id", taskId);
    taskItem.classList.add("task-item");
  
    // Appliquer le style selon le type de devoir
    if (taskData.type === "Devoir") {
      taskItem.classList.add("devoir");
    } else if (taskData.type === "TA") {
      taskItem.classList.add("ta");
    } else if (taskData.type === "TS") {
      taskItem.classList.add("ts");
    }
  
    // Appliquer le style selon la branche
    if (taskData.branch) {
      taskItem.classList.add(taskData.branch.toLowerCase());
    }
  
    taskItem.textContent = `${taskData.branch} : ${taskData.title}`;
  
    taskItem.addEventListener("click", () => {
      openTaskDetailsScreen(taskId, taskData);
    });
  
    tasksList.appendChild(taskItem);
  }

/*****************************************************
 * Ouverture de l'écran d'ajout de devoir
 *****************************************************/
function openAddTaskScreen() {
  addTaskScreen.classList.remove("hidden");
  clearAddTaskForm();
}

function clearAddTaskForm() {
  selectedTaskBranch = null;
  selectedTaskType = null;
  taskTitleInput.value = "";
  attachmentInput.value = "";

  // Retire la sélection visuelle sur les branch-button
  document.querySelectorAll(".branch-button").forEach(btn => {
    btn.classList.remove("selected-branch");
  });
  // Retire la sélection visuelle sur type de devoir
  [typeDevoirBtn, typeTaBtn, typeTsBtn].forEach(btn => {
    btn.classList.remove("selected-type");
  });
}

/*****************************************************
 * Fermeture de l'écran d'ajout de devoir
 *****************************************************/
cancelAddTaskBtn.addEventListener("click", () => {
  addTaskScreen.classList.add("hidden");
});

/*****************************************************
 * Génération de la liste de branches (ajout de devoir)
 *****************************************************/
function generateBranchSelection() {
  branches.forEach((branch) => {
    const btn = document.createElement("button");
    btn.classList.add("branch-button");
    btn.style.backgroundColor = branch.color;
    btn.textContent = branch.code;

    btn.addEventListener("click", () => {
      // Retire la sélection sur tous
      document.querySelectorAll(".branch-button").forEach(b => {
        b.classList.remove("selected-branch");
      });
      // Applique sur celui cliqué
      btn.classList.add("selected-branch");
      selectedTaskBranch = branch.code;
    });

    branchSelectionContainer.appendChild(btn);
  });
}

/*****************************************************
 * Sélection du type de devoir
 *****************************************************/
[typeDevoirBtn, typeTaBtn, typeTsBtn].forEach(button => {
  button.addEventListener("click", () => {
    [typeDevoirBtn, typeTaBtn, typeTsBtn].forEach(b => {
      b.classList.remove("selected-type");
    });
    button.classList.add("selected-type");
    selectedTaskType = button.dataset.type;
  });
});

/*****************************************************
 * Ajout du devoir en base + upload pièces jointes
 *****************************************************/
confirmAddTaskBtn.addEventListener("click", async () => {
  // Vérifie que la branche et le type ont été sélectionnés
  if (!selectedTaskBranch || !selectedTaskType) {
    alert("Merci de sélectionner une branche et un type de devoir (Devoir, TA ou TS).");
    return;
  }
  
  const title = taskTitleInput.value.trim();
  if (!title) {
    alert("Merci d'indiquer un titre de devoir.");
    return;
  }
  
  // Utilise le tableau selectedFiles au lieu de attachmentInput.files
  const attachments = selectedFiles;
  
  try {
    // Crée le document Firestore pour le devoir sans pièces jointes
    const docRef = await db.collection("tasks").add({
      branch: selectedTaskBranch,
      type: selectedTaskType,
      title: title,
      day: currentDayClicked,
      week: currentWeek,
      attachments: []
    });
    
    // Prépare le conteneur et la barre de progression (vous avez déjà du CSS pour #upload-progress-container et #upload-progress-bar)
    const progressContainer = document.getElementById("upload-progress-container");
    const progressBar = document.getElementById("upload-progress-bar");
    
    // Affiche la barre de progression
    progressContainer.classList.remove("hidden");
    
    const attachmentURLs = [];
    
    // Pour chaque fichier dans selectedFiles, effectue l'upload
    for (let i = 0; i < attachments.length; i++) {
      const file = attachments[i];
      const storageRef = storage.ref(`attachments/${docRef.id}/${file.name}`);
      const uploadTask = storageRef.put(file);
      
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + "%";
          },
          (error) => {
            console.error("Erreur d'upload :", error);
            reject(error);
          },
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            attachmentURLs.push({ name: file.name, url });
            resolve();
          }
        );
      });
    }
    
    // Cache la barre de progression
    progressContainer.classList.add("hidden");
    progressBar.style.width = "0%";
    
    // Met à jour le document Firestore avec les URL des pièces jointes
    if (attachmentURLs.length > 0) {
      await db.collection("tasks").doc(docRef.id).update({
        attachments: attachmentURLs
      });
    }
    
    // Réinitialise le tableau selectedFiles
    selectedFiles = [];
    updateAttachmentPreview();
    
    // Recharge la liste des tâches et ferme l'écran d'ajout
    loadTasksForWeek(currentWeek);
    addTaskScreen.classList.add("hidden");
  } catch (err) {
    console.error("Erreur lors de l'ajout du devoir :", err);
    alert("Une erreur s'est produite lors de l'ajout du devoir.");
  }
});

/*****************************************************
 * Affichage des détails d'un devoir
 *****************************************************/
function openTaskDetailsScreen(taskId, taskData) {
  selectedTaskId = taskId;
  selectedTaskData = taskData;
  taskDetailsScreen.classList.remove("hidden");

  detailsTaskTitle.textContent = `${taskData.branch} : ${taskData.title}`;
  attachmentsList.innerHTML = "";

  // Déterminez si nous sommes en mode édition :
  const isEditing = !document.getElementById("edit-mode").classList.contains("hidden");

  if (taskData.attachments && taskData.attachments.length > 0) {
    // Vérifie si "edit-mode" est visible ou non
    const isEditing = !document.getElementById("edit-mode").classList.contains("hidden");
  
    taskData.attachments.forEach((att, index) => {
      const previewContainer = document.createElement("div");
      previewContainer.classList.add("attachment-preview");
      previewContainer.style.display = "inline-block";
      previewContainer.style.margin = "5px";
      previewContainer.style.textAlign = "center";
      previewContainer.style.position = "relative";
  
      const previewImg = document.createElement("img");
      if (att.name.toLowerCase().endsWith(".pdf")) {
        previewImg.src = "pdf-icon.png";
      } else {
        previewImg.src = att.url;
      }
      previewImg.alt = att.name;
      previewImg.style.maxWidth = "100px";
      previewImg.style.display = "block";
      previewImg.style.margin = "0 auto";
      previewContainer.appendChild(previewImg);
  
      // Nom du fichier en dessous
      const caption = document.createElement("div");
      caption.textContent = att.name;
      caption.classList.add("attachment-caption");
      caption.style.fontSize = "12px";
      caption.style.marginTop = "5px";
      previewContainer.appendChild(caption);
  
      // N’ajouter la croix que si on est en mode édition
      if (isEditing) {
        const deleteIcon = document.createElement("span");
        deleteIcon.textContent = "✖";
        deleteIcon.classList.add("delete-icon");
        deleteIcon.style.position = "absolute";
        deleteIcon.style.top = "0px";
        deleteIcon.style.right = "0px";
        deleteIcon.addEventListener("click", (event) => {
          event.stopPropagation();
          const code = prompt("Entrez le code pour supprimer cette pièce jointe:");
          if (code !== "xxx") {
            alert("Code incorrect.");
            return;
          }
          const updatedAttachments = taskData.attachments.filter((_, i) => i !== index);
          db.collection("tasks").doc(taskId).update({
            attachments: updatedAttachments
          }).then(() => {
            db.collection("tasks").doc(taskId).get().then(doc => {
              if (doc.exists) {
                openTaskDetailsScreen(taskId, doc.data());
              }
            });
          }).catch(err => {
            console.error("Erreur lors de la suppression de la pièce jointe:", err);
          });
        });
        previewContainer.appendChild(deleteIcon);
      }
  
      // Clic pour ouvrir le fichier
      previewContainer.addEventListener("click", () => {
        window.open(att.url, "_blank");
      });
  
      attachmentsList.appendChild(previewContainer);
    });
  }
}

/*****************************************************
 * Retour à l'écran principal sans modifier
 *****************************************************/
backToMainBtn.addEventListener("click", () => {
  taskDetailsScreen.classList.add("hidden");
  disableEditMode();
});

/*****************************************************
 * Basculer en mode édition
 *****************************************************/
toggleEditBtn.addEventListener("click", () => {
  const editModeContainer = document.getElementById("edit-mode");
  editModeContainer.classList.toggle("hidden");
  validateChangesBtn.classList.toggle("hidden");

  if (!editModeContainer.classList.contains("hidden")) {
    // On active l'édition
    toggleEditBtn.textContent = "Annuler";
    // Pré-remplit le champ
    editTaskTitleInput.value = selectedTaskData.title;
  } else {
    // On annule
    toggleEditBtn.textContent = "Modifier";
  }
  openTaskDetailsScreen(selectedTaskId, selectedTaskData);
});

function disableEditMode() {
  document.getElementById("edit-mode").classList.add("hidden");
  validateChangesBtn.classList.add("hidden");
  toggleEditBtn.textContent = "Modifier";
}

/*****************************************************
 * Validation des modifications du devoir (mise à jour)
 * avec barre de progression pour l'ajout de nouvelles pièces jointes
 *****************************************************/
validateChangesBtn.addEventListener("click", async () => {
  const newTitle = editTaskTitleInput.value.trim();
  const newAttachments = editSelectedFiles; // On utilise le tableau global
  const updates = {};

  // Mise à jour du titre si modifié
  if (newTitle && newTitle !== selectedTaskData.title) {
    updates.title = newTitle;
  }

  // S'il y a de nouveaux fichiers à uploader
  if (newAttachments.length > 0) {
    const progressContainer = document.getElementById("edit-upload-progress-container");
    const progressBar = document.getElementById("edit-upload-progress-bar");
    progressContainer.classList.remove("hidden");

    let updatedAttachments = selectedTaskData.attachments ? [...selectedTaskData.attachments] : [];

    for (let i = 0; i < newAttachments.length; i++) {
      const file = newAttachments[i];
      const storageRef = storage.ref(`attachments/${selectedTaskId}/${file.name}`);
      const uploadTask = storageRef.put(file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            progressBar.style.width = progress + "%";
          },
          (error) => {
            console.error("Erreur d'upload du fichier lors de la modification :", error);
            reject(error);
          },
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            updatedAttachments.push({ name: file.name, url });
            resolve();
          }
        );
      });
    }

    // Cache la barre de progression
    progressContainer.classList.add("hidden");
    progressBar.style.width = "0%";

    // Met à jour la liste d'attachements
    updates.attachments = updatedAttachments;
  }

  try {
    // Appliquer les mises à jour dans Firestore (titre et/ou attachments)
    if (Object.keys(updates).length > 0) {
      await db.collection("tasks").doc(selectedTaskId).update(updates);
    }

    // Recharger les dernières données depuis Firestore
    const docSnap = await db.collection("tasks").doc(selectedTaskId).get();
    if (docSnap.exists) {
      selectedTaskData = docSnap.data();
      // Si tu veux réafficher immédiatement dans l'écran detailsTaskTitle, ok :
      detailsTaskTitle.textContent = `${selectedTaskData.branch} : ${selectedTaskData.title}`;
      attachmentsList.innerHTML = "";
      if (selectedTaskData.attachments) {
        // On peut réafficher rapidement la liste, ou juste se fier au reload plus bas
        selectedTaskData.attachments.forEach(att => {
          const attItem = document.createElement("div");
          attItem.classList.add("attachment-item");
          attItem.textContent = att.name;
          attItem.addEventListener("click", () => {
            window.open(att.url, "_blank");
          });
          attachmentsList.appendChild(attItem);
        });
      }
    }

    // On désactive le mode édition
    disableEditMode();

    // On ferme la fenêtre de détails
    taskDetailsScreen.classList.add("hidden");

    // On recharge la vue de la semaine pour refléter les changements
    loadTasksForWeek(currentWeek);

    // Enfin, on réinitialise editSelectedFiles et l'aperçu
    editSelectedFiles = [];
    const previewContainer = document.getElementById("edit-attachment-preview");
    if (previewContainer) previewContainer.innerHTML = "";

  } catch (error) {
    console.error("Erreur lors de la mise à jour du devoir:", error);
  }
});

  editSelectedFiles = [];
const previewContainer = document.getElementById("edit-attachment-preview");
if (previewContainer) previewContainer.innerHTML = "";

/*****************************************************
 * Suppression du devoir (demande mot de passe)
 *****************************************************/
deleteTaskBtn.addEventListener("click", () => {
  passwordModal.classList.remove("hidden");
  deletePasswordInput.value = "";
});

cancelDeleteBtn.addEventListener("click", () => {
  passwordModal.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", () => {
  const pwd = deletePasswordInput.value;
  if (pwd !== "xxx") {
    alert("Mot de passe incorrect.");
    return;
  }
  // Supprimer le document
  db.collection("tasks").doc(selectedTaskId).delete().then(() => {
    passwordModal.classList.add("hidden");
    taskDetailsScreen.classList.add("hidden");
    loadTasksForWeek(currentWeek);
  }).catch(err => {
    console.error("Erreur lors de la suppression:", err);
  });
});

/*****************************************************
 * Bibliothèque
 *****************************************************/
libraryButton.addEventListener("click", () => {
  libraryScreen.classList.remove("hidden");
});
closeLibraryBtn.addEventListener("click", () => {
  libraryScreen.classList.add("hidden");
  manualsListContainer.classList.add("hidden");
  // Retire la sélection lib-branch
  document.querySelectorAll(".library-branch-button").forEach(b => {
    b.classList.remove("selected-lib-branch");
  });
});

/* Génère les boutons de branches pour la bibliothèque */
function generateLibraryBranches() {
  branches.forEach((branch) => {
    const btn = document.createElement("button");
    btn.classList.add("library-branch-button");
    btn.style.backgroundColor = branch.color;
    btn.textContent = branch.code;

    btn.addEventListener("click", () => {
      // Retire la sélection sur toutes
      document.querySelectorAll(".library-branch-button").forEach(b => {
        b.classList.remove("selected-lib-branch");
      });
      btn.classList.add("selected-lib-branch");

      selectedBranch = branch.code;
      selectedBranchTitle.textContent = `Manuels pour ${branch.code}`;
      manualsList.innerHTML = "";
      manualsListContainer.classList.remove("hidden");

      loadManualsForBranch(branch.code);
    });

    libraryBranchesContainer.appendChild(btn);
  });
}

/* Charger la liste des manuels pour une branche */
function loadManualsForBranch(branchCode) {
    db.collection("manuals")
      .where("branch", "==", branchCode)
      .get()
      .then((snapshot) => {
        manualsList.innerHTML = "";
        snapshot.forEach(doc => {
          const data = doc.data();
          // Créer un conteneur pour l'aperçu du manuel
          const previewContainer = document.createElement("div");
          previewContainer.classList.add("manual-preview");
          previewContainer.style.display = "inline-block";
          previewContainer.style.margin = "5px";
          previewContainer.style.textAlign = "center";
          previewContainer.style.position = "relative";
    
          // Pour les manuels, on suppose qu'il s'agit de PDF, donc on affiche une icône PDF
          const previewImg = document.createElement("img");
          previewImg.src = "pdf-icon.png";  // Assurez-vous d'avoir un fichier pdf-icon.png dans votre projet
          previewImg.alt = data.title;
          previewImg.style.maxWidth = "100px";
          previewImg.style.display = "block";
          previewImg.style.margin = "0 auto";
          previewContainer.appendChild(previewImg);
    
          // Ajouter le nom du manuel en dessous
          const caption = document.createElement("div");
          caption.textContent = data.title || "Manuel PDF";
          caption.style.fontSize = "12px";
          caption.style.marginTop = "5px";
          previewContainer.appendChild(caption);
    
          // Permettre d'ouvrir le PDF en cliquant sur l'aperçu
          previewContainer.addEventListener("click", () => {
            window.open(data.pdfUrl, "_blank");
          });
    
          // Bouton de suppression pour le manuel
          const deleteBtn = document.createElement("span");
          deleteBtn.textContent = "✖";
          deleteBtn.style.position = "absolute";
          deleteBtn.style.top = "0px";
          deleteBtn.style.right = "0px";
          deleteBtn.style.background = "rgba(255,255,255,0.8)";
          deleteBtn.style.borderRadius = "50%";
          deleteBtn.style.padding = "2px 5px";
          deleteBtn.style.cursor = "pointer";
          deleteBtn.style.fontSize = "14px";
          deleteBtn.style.color = "#f44336";
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const code = prompt("Entrez le code pour supprimer ce manuel:");
            if (code !== "xxx") {
              alert("Code incorrect.");
              return;
            }
            db.collection("manuals").doc(doc.id).delete()
              .then(() => {
                loadManualsForBranch(selectedBranch);
              })
              .catch(err => console.error("Erreur lors de la suppression du manuel:", err));
          });
          previewContainer.appendChild(deleteBtn);
    
          manualsList.appendChild(previewContainer);
        });
      })
      .catch(err => console.error("Erreur lors du chargement des manuels:", err));
  }

/*****************************************************
 * Ajouter un manuel (upload PDF)
 *****************************************************/
addManualButton.addEventListener("click", () => {
  if (!selectedBranch) {
    alert("Veuillez d'abord sélectionner une branche.");
    return;
  }
  addManualModal.classList.remove("hidden");
  manualFileInput.value = "";
});

cancelAddManualBtn.addEventListener("click", () => {
  addManualModal.classList.add("hidden");
  manualFileInput.value = "";
});

confirmAddManualBtn.addEventListener("click", async () => {
    const file = manualFileInput.files[0];
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF à téléverser.");
      return;
    }
    if (!selectedBranch) {
      alert("Aucune branche sélectionnée.");
      return;
    }
    try {
      // Afficher la barre de progression pour le manuel
      const manualProgressContainer = document.getElementById("manual-progress-container");
      const manualProgressBar = document.getElementById("manual-progress-bar");
      manualProgressContainer.classList.remove("hidden");
  
      // Créer une référence dans Storage pour le manuel
      const storageRef = storage.ref(`manuals/${selectedBranch}/${file.name}`);
      const uploadTask = storageRef.put(file);
  
      // Suivre la progression de l'upload avec une Promise
      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Calcul de la progression
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            manualProgressBar.style.width = progress + "%";
          },
          (error) => {
            console.error("Erreur d'upload du manuel :", error);
            reject(error);
          },
          () => {
            resolve();
          }
        );
      });
  
      // Une fois l'upload terminé, récupérer l'URL du PDF
      const url = await storageRef.getDownloadURL();
  
      // Enregistrer le manuel dans Firestore
      await db.collection("manuals").add({
        branch: selectedBranch,
        title: file.name,
        pdfUrl: url
      });
  
      // Cacher la barre de progression et réinitialiser sa largeur
      manualProgressContainer.classList.add("hidden");
      manualProgressBar.style.width = "0%";
  
      // Fermer la modale d'ajout et recharger la liste des manuels
      addManualModal.classList.add("hidden");
      loadManualsForBranch(selectedBranch);
    } catch (error) {
      console.error("Erreur lors de l'ajout du manuel:", error);
      alert("Une erreur est survenue lors de l'upload du PDF.");
    }
  });

/*****************************************************
 * Suppression d'un manuel (demande mot de passe)
 *****************************************************/
function askDeleteManual(manualId) {
  passwordModal.classList.remove("hidden");
  deletePasswordInput.value = "";

  confirmDeleteBtn.onclick = () => {
    const pwd = deletePasswordInput.value;
    if (pwd !== "xxx") {
      alert("Mot de passe incorrect.");
      return;
    }
    // Supprime le doc Firestore
    db.collection("manuals").doc(manualId).delete()
      .then(() => {
        passwordModal.classList.add("hidden");
        loadManualsForBranch(selectedBranch);
      })
      .catch(err => console.error("Erreur lors de la suppression du manuel:", err));
  };
}

// Lorsque l'utilisateur sélectionne des fichiers dans l'input
attachmentInput.addEventListener("change", () => {
  // Convertit le FileList en tableau et ajoute-le au tableau global
  const filesArray = Array.from(attachmentInput.files);
  selectedFiles = selectedFiles.concat(filesArray);
  
  // Met à jour l'aperçu des fichiers
  updateAttachmentPreview();
  
  // Réinitialise l'input pour pouvoir sélectionner à nouveau les mêmes fichiers si besoin
  attachmentInput.value = "";
});

function updateAttachmentPreview() {
  const previewContainer = document.getElementById("attachment-preview");
  previewContainer.innerHTML = ""; // Efface l'aperçu précédent
  
  // Pour chaque fichier dans selectedFiles, créez un aperçu
  selectedFiles.forEach((file, index) => {
    const previewDiv = document.createElement("div");
    previewDiv.style.display = "inline-block";
    previewDiv.style.position = "relative";
    previewDiv.style.marginRight = "10px";
    
    if (file.type.startsWith("image/")) {
      // Si c'est une image, afficher l'image
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = "200px";
      img.style.display = "block";
      previewDiv.appendChild(img);
    } else {
      // Pour un PDF ou autre, afficher le nom du fichier
      const p = document.createElement("p");
      p.textContent = file.name;
      previewDiv.appendChild(p);
    }
    
    // Ajouter la petite croix pour supprimer cette pièce jointe
    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "✖";
    deleteIcon.classList.add("delete-icon"); // Votre CSS pour .delete-icon s'appliquera
    // Positionnez-la en haut à droite
    deleteIcon.style.position = "absolute";
    deleteIcon.style.top = "0";
    deleteIcon.style.right = "0";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.addEventListener("click", () => {
      // Supprime ce fichier du tableau selectedFiles
      selectedFiles.splice(index, 1);
      updateAttachmentPreview();
    });
    previewDiv.appendChild(deleteIcon);
    
    previewContainer.appendChild(previewDiv);
  });
}

editAttachmentInput.addEventListener("change", () => {
  const previewContainer = document.getElementById("edit-attachment-preview");
  if (!previewContainer) return;
  const filesArray = Array.from(editAttachmentInput.files);
  editSelectedFiles = editSelectedFiles.concat(filesArray);
  updateEditAttachmentPreview();
  // Réinitialiser l'input pour permettre de re-sélectionner
  editAttachmentInput.value = "";
});

function updateEditAttachmentPreview() {
  const previewContainer = document.getElementById("edit-attachment-preview");
  previewContainer.innerHTML = "";
  editSelectedFiles.forEach((file, index) => {
    const previewDiv = document.createElement("div");
    previewDiv.style.display = "inline-block";
    previewDiv.style.position = "relative";
    previewDiv.style.marginRight = "10px";
    
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.maxWidth = "200px";
      img.style.display = "block";
      previewDiv.appendChild(img);
    } else {
      const p = document.createElement("p");
      p.textContent = file.name;
      previewDiv.appendChild(p);
    }
    
    const deleteIcon = document.createElement("span");
    deleteIcon.textContent = "✖";
    deleteIcon.classList.add("delete-icon");
    deleteIcon.style.position = "absolute";
    deleteIcon.style.top = "0";
    deleteIcon.style.right = "0";
    deleteIcon.style.cursor = "pointer";
    deleteIcon.addEventListener("click", () => {
      editSelectedFiles.splice(index, 1);
      updateEditAttachmentPreview();
    });
    previewDiv.appendChild(deleteIcon);
    
    previewContainer.appendChild(previewDiv);
  });
}