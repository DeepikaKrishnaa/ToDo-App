const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});

taskInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && taskInput.value.trim() !== "") {
    addTask(taskInput.value.trim());
    taskInput.value = "";
  }
});

function addTaskUI(text, taskId, completed = 0) {
  emptyState.style.display = "none";

  const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = taskId;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  const span = document.createElement("span");
  span.textContent = text;

  if (completed) {
    checkbox.checked = true;
    span.classList.add("completed");
  }

  checkbox.onclick = () => {
    const isCompleted = checkbox.checked;
    span.classList.toggle("completed", isCompleted);

    fetch(`https://my-todo-app-backend.up.railway.app/api/tasks/${li.dataset.id}/completed`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: isCompleted })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert("Failed to update task status");
      }
    })
    .catch(() => {
      alert("Server error while updating task");
    });
  };

  const editBtn = document.createElement("button");
  editBtn.textContent = "✏️";

  let isEditing = false;

  editBtn.onclick = () => {
    if (!isEditing) {
      isEditing = true;
      span.contentEditable = true;
      span.focus();
      editBtn.textContent = "✅";
    } else {
      isEditing = false;
      span.contentEditable = false;
      editBtn.textContent = "✏️";

      fetch(`https://my-todo-app-backend.up.railway.app/api/tasks/${li.dataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: span.textContent })
      });
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.onclick = () => {
    const userId = localStorage.getItem("userId");
    fetch(`https://my-todo-app-backend.up.railway.app/api/tasks/${li.dataset.id}?userId=${userId}`, {
      method: "DELETE",
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        li.remove();
        checkEmpty();
      } else {
        alert("data.message");
      }
    })
    .catch(() => {
      alert("Server error while deleting task");
    });
  };

  li.append(checkbox, span, editBtn, deleteBtn);
  taskList.appendChild(li);
}

function addTask(text) {
  const userId = Number(localStorage.getItem("userId"));

  if (!text || !userId) return;

  fetch("https://my-todo-app-backend.up.railway.app/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId: userId,
      title: text
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        addTaskUI(text, data.taskId, 0);
      } else {
        alert("Failed to save task");
      }
    })
    .catch(() => {
      alert("Server error while saving task");
    });
}

function checkEmpty() {
  if (taskList.children.length === 0) {
    emptyState.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  fetch(`https://my-todo-app-backend.up.railway.app/api/tasks/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success && data.tasks.length > 0) {
        emptyState.style.display = "none";
        data.tasks.forEach(task => {
          addTaskUI(task.title, task.id, task.completed);
        });
      }
    })
    .catch(err => {
      console.error("LOAD TASKS ERROR", err);
    });
}
