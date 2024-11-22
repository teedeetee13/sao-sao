// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, collection, setDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkc_omaw5z-4ezryZfZzhSJE1F7wYGY7k",
  authDomain: "sao-46955.firebaseapp.com",
  projectId: "sao-46955",
  storageBucket: "sao-46955.appspot.com",
  messagingSenderId: "348995735858",
  appId: "1:348995735858:web:f5d4df69f3dc929ec7872b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      currentUser = result.user;
      initApp();
    })
    .catch((error) => {
      console.error("Error during login:", error);
    });
});

// Monitor Auth State
onAuthStateChanged(auth, (user) => {
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
  const tasksRef = collection(db, "users", currentUser.uid, "tasks");

  onSnapshot(tasksRef, (snapshot) => {
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
  const userRef = doc(db, "users", currentUser.uid);

  onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
      renderPoints(userData.points || 0);
    } else {
      setDoc(userRef, { points: 0 });
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
  const userRef = doc(db, "users", currentUser.uid);

  updateDoc(userRef, {
    points: task.value
  });
  deleteDoc(doc(db, "users", currentUser.uid, "tasks", task.id));
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
    const tasksRef = collection(db, "users", currentUser.uid, "tasks");
    setDoc(doc(tasksRef), {
      name: taskName,
      value: taskValue
    });
    taskForm.reset();
  }
});
