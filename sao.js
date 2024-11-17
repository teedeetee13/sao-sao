// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginButton = document.getElementById("login-button");
const loginContainer = document.getElementById("login-container");
const mainContent = document.getElementById("main-content");
const taskForm = document.getElementById("task-form");
const taskBoard = document.getElementById("task-board");
const pointsContainer = document.getElementById("points-container");

let currentUser = null;

// Login Function
loginButton.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      currentUser = result.user;
      initApp();
    })
    .catch((error) => {
      console.error("Error during login:", error);
    });
});

// Monitor Auth State
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    initApp();
  } else {
    currentUser = null;
    loginContainer.style.display = "block";
    mainContent.style.display = "none";
  }
});

// Initialize App After Login
function initApp() {
  loginContainer.style.display = "none";
  mainContent.style.display = "block";
  loadTasks();
  loadPoints();
}

// Load Tasks from Firestore
function loadTasks() {
  const tasksRef = db.collection("users").doc(currentUser.uid).collection("tasks");

  tasksRef.onSnapshot((snapshot) => {
    taskBoard.innerHTML = "";
    snapshot.forEach((doc) => {
      const task = doc.data();
      task.id = doc.id;
      renderTask(task);
    });
  });
}

// Load Points from Firestore
function loadPoints() {
  const userRef = db.collection("users").doc(currentUser.uid);

  userRef.onSnapshot((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      renderPoints(userData.points || 0);
    } else {
      userRef.set({ points: 0 });
    }
  });
}

// Render Task
function renderTask(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task", "col-12");

  taskElement.innerHTML = `
    <div class="task-header">
      <h5>${task.name} (Giá trị: ${task.value} sao)</h5>
      <button class="btn btn-sm btn-success complete-btn">Hoàn thành</button>
    </div>
  `;

  taskElement.querySelector(".complete-btn").addEventListener("click", () => {
    completeTask(task);
  });

  taskBoard.appendChild(taskElement);
}

// Complete Task
function completeTask(task) {
  const userRef = db.collection("users").doc(currentUser.uid);

  userRef.update({
    points: firebase.firestore.FieldValue.increment(task.value)
  });
  db.collection("users").doc(currentUser.uid).collection("tasks").doc(task.id).delete();
}

// Render Points
function renderPoints(points) {
  pointsContainer.innerHTML = `<strong>Điểm của bạn:</strong> ${"★".repeat(points)} <span>(${points} điểm)</span>`;
}

// Add Task Form Submission
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskName = document.getElementById("task-input").value;
  const taskValue = parseInt(document.getElementById("task-value").value);

  if (taskName && taskValue > 0) {
    db.collection("users").doc(currentUser.uid).collection("tasks").add({
      name: taskName,
      value: taskValue
    });
    taskForm.reset();
  }
});
