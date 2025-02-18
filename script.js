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

/*****************************************************
 * Liste des branches et leurs codes/couleurs
 *****************************************************/
const branches = [
  { code: "All", color: "#ffc107" },
  { code: "Fra", color: "#e91e63" },
  { code: "Math", color: "#ff9800" },
  { code: "His", color: "#9c27b0" },
  { code: "Géo", color: "#4caf50" },
  { code: "Ang", color: "#00bcd4" },
  { code: "Scn", color: "#9e9d24" },
  { code: "Mus", color: "#f44336" },
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
  // Juste un affichage simplifié, dans la réalité on calculerait la vraie date
  weekDates.textContent = `Semaine ${week}`;

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

  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item");

  // Couleur et style selon le type
  if (taskData.type === "Devoir") {
    taskItem.classList.add("devoir");
  } else if (taskData.type === "TA") {
    taskItem.classList.add("ta");
  } else if (taskData.type === "TS") {
    taskItem.classList.add("ts");
  }

  // Couleur par branche (ex: .all, .fra, etc.)
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
confirmAddTaskBtn.addEventListener("click", () => {
    // Demande de mot de passe
    const userInput = prompt("Mot de passe pour ajouter un devoir ?");
    if (userInput !== "9vg1") {
      alert("Mot de passe incorrect.");
      return; // On arrête l'exécution
    }
  
    if (!selectedTaskBranch || !selectedTaskType) {
      alert("Merci de sélectionner une branche et un type de devoir.");
      return;
    }
  
    const title = taskTitleInput.value.trim();
    if (!title) {
      alert("Merci d'indiquer un titre de devoir.");
      return;
    }
  
    // Création du document Firestore avec un tableau d'attachements vide
    db.collection("tasks")
      .add({
        branch: selectedTaskBranch,
        type: selectedTaskType,
        title: title,
        day: currentDayClicked,
        week: currentWeek,
        attachments: []
      })
      .then(async (docRef) => {
        // On gère l'upload des pièces jointes s'il y en a
        const files = attachmentInput.files;
        let attachmentURLs = [];
  
        if (files.length > 0) {
          // On rend visible la barre de progression
          const progressContainer = document.getElementById("upload-progress-container");
          const progressBar = document.getElementById("upload-progress-bar");
          progressContainer.classList.remove("hidden");
  
          // On va uploader chaque fichier en série
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = storage.ref(`attachments/${docRef.id}/${file.name}`);
            const uploadTask = storageRef.put(file);
  
            // On attend la fin de l'upload pour passer au suivant
            await new Promise((resolve, reject) => {
              uploadTask.on(
                'state_changed',
                (snapshot) => {
                  // Progression
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  progressBar.style.width = progress + "%";
                },
                (error) => {
                  console.error("Erreur upload:", error);
                  reject(error);
                },
                async () => {
                  // Upload terminé
                  const url = await uploadTask.snapshot.ref.getDownloadURL();
                  attachmentURLs.push({ name: file.name, url });
                  resolve();
                }
              );
            });
          }
  
          // On masque la barre de progression
          progressContainer.classList.add("hidden");
          progressBar.style.width = "0%";
        }
  
        // Mise à jour du doc Firestore avec les URLs si on a des fichiers
        if (attachmentURLs.length > 0) {
          await db.collection("tasks").doc(docRef.id).update({
            attachments: attachmentURLs
          });
        }
  
        // On recharge la liste (une seule fois)
        loadTasksForWeek(currentWeek);
  
        // On ferme l'écran d'ajout
        addTaskScreen.classList.add("hidden");
      })
      .catch(err => {
        console.error("Erreur lors de l'ajout de devoir:", err);
      });
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

  if (taskData.attachments && taskData.attachments.length > 0) {
    taskData.attachments.forEach((att) => {
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
});

function disableEditMode() {
  document.getElementById("edit-mode").classList.add("hidden");
  validateChangesBtn.classList.add("hidden");
  toggleEditBtn.textContent = "Modifier";
}

/*****************************************************
 * Validation des modifications du devoir
 *****************************************************/
validateChangesBtn.addEventListener("click", async () => {
  const newTitle = editTaskTitleInput.value.trim();
  const newAttachments = editAttachmentInput.files; // Pièces jointes supplémentaires
  const updates = {};

  if (newTitle && newTitle !== selectedTaskData.title) {
    updates.title = newTitle;
  }

  if (newAttachments.length > 0) {
    // On part de l'existant, ou []
    const existingAtt = selectedTaskData.attachments ? [...selectedTaskData.attachments] : [];
    for (let i = 0; i < newAttachments.length; i++) {
      const file = newAttachments[i];
      const storageRef = storage.ref(`attachments/${selectedTaskId}/${file.name}`);
      const snapshot = await storageRef.put(file);
      const url = await snapshot.ref.getDownloadURL();
      existingAtt.push({ name: file.name, url });
    }
    updates.attachments = existingAtt;
  }

  try {
    if (Object.keys(updates).length > 0) {
      await db.collection("tasks").doc(selectedTaskId).update(updates);
    }
    // Recharge le doc
    const docSnap = await db.collection("tasks").doc(selectedTaskId).get();
    if (docSnap.exists) {
      selectedTaskData = docSnap.data();
      detailsTaskTitle.textContent = `${selectedTaskData.branch} : ${selectedTaskData.title}`;
      attachmentsList.innerHTML = "";
      if (selectedTaskData.attachments) {
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
    disableEditMode();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du devoir:", error);
  }
});

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
        const li = document.createElement("li");
        // Le titre est tiré du champ "title"
        // Ici on suppose qu'on met le nom du PDF comme "title", si on veut
        // un champ "title" plus humain, on peut parse le nom du fichier
        // ou demander un input. A toi de voir. 
        const spanTitle = document.createElement("span");
        spanTitle.textContent = data.title || "Manuel PDF";
        spanTitle.classList.add("manual-title");
        spanTitle.addEventListener("click", () => {
          window.open(data.pdfUrl, "_blank");
        });
        li.appendChild(spanTitle);

        // Bouton de suppression du manuel
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "X";
        deleteBtn.style.marginLeft = "1rem";
        deleteBtn.addEventListener("click", () => {
          askDeleteManual(doc.id);
        });
        li.appendChild(deleteBtn);

        manualsList.appendChild(li);
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

/*****************************************************
 * Ajout d'un manuel (avec barre de progression)
 *****************************************************/
confirmAddManualBtn.addEventListener("click", async () => {
    const userInput = prompt("Mot de passe pour ajouter un manuel ?");
    if (userInput !== "9vg1") {
      alert("Mot de passe incorrect.");
      return;
    }
  
    if (!selectedBranch) {
      alert("Aucune branche sélectionnée.");
      return;
    }
  
    const file = manualFileInput.files[0];
    if (!file) {
      alert("Veuillez sélectionner un fichier PDF à téléverser.");
      return;
    }
  
    try {
      // Barre de progression
      const progressContainer = document.getElementById("manual-progress-container");
      const progressBar = document.getElementById("manual-progress-bar");
      if (progressContainer && progressBar) {
        progressContainer.classList.remove("hidden");
      }
  
      const storageRef = storage.ref(`manuals/${selectedBranch}/${file.name}`);
      const uploadTask = storageRef.put(file);
  
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progression
            if (progressBar) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              progressBar.style.width = progress + "%";
            }
          },
          (error) => {
            console.error("Erreur lors de l'upload du manuel:", error);
            reject(error);
          },
          async () => {
            // Terminé
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            // On enregistre ensuite dans Firestore
            await db.collection("manuals").add({
              branch: selectedBranch,
              title: file.name,
              pdfUrl: url
            });
            resolve();
          }
        );
      });
  
      // Masquer la barre de progression
      if (progressContainer && progressBar) {
        progressContainer.classList.add("hidden");
        progressBar.style.width = "0%";
      }
  
      // On ferme la modale
      addManualModal.classList.add("hidden");
      // On recharge la liste pour voir le nouveau manuel
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

/*****************************************************
 * Prévisualisation du fichier avant de valider
 *****************************************************/
attachmentInput.addEventListener("change", () => {
    const previewContainer = document.getElementById("attachment-preview");
    if (!previewContainer) return; // au cas où tu n'as pas créé la div
  
    // On vide l'aperçu précédent
    previewContainer.innerHTML = "";
  
    // Pour chaque fichier sélectionné :
    for (let file of attachmentInput.files) {
      if (file.type.startsWith("image/")) {
        // On crée un <img>
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.style.width = "100px";
        img.style.marginRight = "10px";
        previewContainer.appendChild(img);
      } else {
        // Pour un PDF ou autre type
        const div = document.createElement("div");
        div.textContent = `Fichier : ${file.name}`;
        previewContainer.appendChild(div);
      }
    }
  });