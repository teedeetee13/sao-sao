// Khởi tạo dữ liệu nhiệm vụ và thành viên
const tasks = [];

const members = [
  { id: "member1", name: "Alice", points: 0 },
  { id: "member2", name: "Bob", points: 0 },
  { id: "member3", name: "Charlie", points: 0 },
  { id: "member4", name: "Diana", points: 0 },
];

const taskBoard = document.getElementById("task-board");

// Xử lý form để thêm công việc mới
document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const taskInput = document.getElementById("task-input");
  const taskValue = parseInt(document.getElementById("task-value").value);
  addTask(taskInput.value, taskValue); // Gọi hàm thêm công việc với giá trị sao
  taskInput.value = "";
  document.getElementById("task-value").value = "";
});

// Hàm hiển thị nhiệm vụ
function renderTasks() {
  taskBoard.innerHTML = ""; // Xóa tất cả nhiệm vụ hiện tại
  tasks.forEach(task => renderTask(task));
}

// Hàm hiển thị một nhiệm vụ
function renderTask(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task", "col-12");

  taskElement.innerHTML = `
    <div class="task-header">
      <h5>${task.name} (Giá trị: ${task.value} sao)</h5>
      <div class="ticks" id="ticks-${task.id}"></div>
    </div>
  `;

  const ticksContainer = taskElement.querySelector(".ticks");

  members.forEach(member => {
    const tick = document.createElement("div");
    tick.classList.add("tick");
    tick.dataset.member = member.id;
    tick.title = member.name; // Thêm title để hiển thị tên khi hover

    if (task.completedBy.includes(member.id)) {
      tick.classList.add("completed");
    }

    tick.addEventListener("click", () => toggleCompletion(task.id, member.id, tick, task.value));
    ticksContainer.appendChild(tick);
  });

  taskBoard.appendChild(taskElement);
  renderPoints();
}

// Hàm thay đổi trạng thái hoàn thành của thành viên
function toggleCompletion(taskId, memberId, tickElement, taskValue) {
  const task = tasks.find(t => t.id === taskId);
  const member = members.find(m => m.id === memberId);
  
  if (task.completedBy.includes(memberId)) {
    task.completedBy = task.completedBy.filter(id => id !== memberId);
    member.points -= taskValue; // Giảm điểm theo giá trị sao khi bỏ dấu tích
    tickElement.classList.remove("completed");
  } else {
    task.completedBy.push(memberId);
    member.points += taskValue; // Tăng điểm theo giá trị sao khi hoàn thành công việc
    tickElement.classList.add("completed");
  }
  renderPoints();
}

// Hàm thêm công việc mới
function addTask(taskName, taskValue) {
  const newTask = {
    id: tasks.length + 1,
    name: taskName,
    value: taskValue, // Lưu giá trị sao của công việc
    completedBy: []
  };
  tasks.push(newTask);
  renderTask(newTask);
}

// Hàm hiển thị điểm (sao) cho từng thành viên
function renderPoints() {
  const pointsContainer = document.getElementById("points-container");
  pointsContainer.innerHTML = ""; // Xóa nội dung cũ

  members.forEach(member => {
    const memberElement = document.createElement("div");
    memberElement.classList.add("member");

    memberElement.innerHTML = `
      <strong>${member.name}:</strong> 
      ${'★'.repeat(member.points)} <span>(${member.points} điểm)</span>
    `;
    pointsContainer.appendChild(memberElement);
  });
}
