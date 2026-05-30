// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());

        // Enter key to add task
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Clear completed button
        document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportTasks());
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const category = document.getElementById('categorySelect');
        const taskText = input.value.trim();

        if (!taskText) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            category: category.value,
            createdAt: new Date().toISOString(),
        };

        this.tasks.push(task);
        this.saveTasks();
        input.value = '';
        this.renderTasks();
        this.updateStats();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter((task) => task.id !== id);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
    }

    toggleTask(id) {
        const task = this.tasks.find((t) => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        this.renderTasks();
    }

    getFilteredTasks() {
        const tasks = this.tasks;

        switch (this.currentFilter) {
            case 'active':
                return tasks.filter((t) => !t.completed);
            case 'completed':
                return tasks.filter((t) => t.completed);
            case 'work':
            case 'personal':
            case 'health':
            case 'shopping':
            case 'other':
                return tasks.filter((t) => t.category === this.currentFilter);
            default:
                return tasks;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        tasksList.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        filteredTasks.forEach((task) => {
            const taskElement = document.createElement('div');
            taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskElement.innerHTML = `
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="taskManager.toggleTask(${task.id})"
                />
                <div class="task-content">
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="task-category ${task.category}">${task.category}</span>
                </div>
                <button class="task-delete" onclick="taskManager.deleteTask(${task.id})">Delete</button>
            `;
            tasksList.appendChild(taskElement);
        });
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter((t) => t.completed).length;
        const remaining = total - completed;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('remainingTasks').textContent = remaining;
        document.getElementById('progressPercent').textContent = progress + '%';
    }

    clearCompleted() {
        if (this.tasks.filter((t) => t.completed).length === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        if (confirm('Are you sure you want to delete all completed tasks?')) {
            this.tasks = this.tasks.filter((t) => !t.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    exportTasks() {
        const tasksToExport = this.tasks.map((task) => ({
            text: task.text,
            category: task.category,
            completed: task.completed,
            createdAt: new Date(task.createdAt).toLocaleString(),
        }));

        const dataStr = JSON.stringify(tasksToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('tasks');
        return stored ? JSON.parse(stored) : [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});
