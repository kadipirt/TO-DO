document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('taskForm');
    const taskInput = document.getElementById('taskInput');
    const priorityInput = document.getElementById('priorityInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const dueTimeInput = document.getElementById('dueTimeInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const todoList = document.getElementById('todoList');

    loadTasks();

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const task = taskInput.value.trim();
        const priority = priorityInput.value;
        const dueDate = dueDateInput.value;
        const dueTime = dueTimeInput.value;
        const description = descriptionInput.value.trim();

        if (task) {
            const taskItem = createTaskElement(task, priority, dueDate, dueTime, description, 'active');
            todoList.appendChild(taskItem);
            saveTasks();

            taskInput.value = '';
            priorityInput.value = 'low';
            dueDateInput.value = '';
            dueTimeInput.value = '';
            descriptionInput.value = '';
        }
    });

    todoList.addEventListener('click', (e) => {
        if (e.target.classList.contains('complete-btn')) {
            const taskItem = e.target.parentElement;
            taskItem.dataset.status = 'completed';
            e.target.remove();
            saveTasks();
        } else if (e.target.classList.contains('delete-btn')) {
            const taskItem = e.target.parentElement;
            taskItem.remove();
            saveTasks();
        }
    });

    statusFilter.addEventListener('change', filterTasks);
    priorityFilter.addEventListener('change', filterTasks);

    function filterTasks() {
        const status = statusFilter.value;
        const priority = priorityFilter.value;
        const tasks = todoList.getElementsByClassName('task-item');

        Array.from(tasks).forEach(task => {
            const taskStatus = task.dataset.status;
            const taskPriority = task.dataset.priority;

            if ((status === 'all' || taskStatus === status) &&
                (priority === 'all' || taskPriority === priority)) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    }

    function createTaskElement(task, priority, dueDate, dueTime, description, status) {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.dataset.status = status;
        taskItem.dataset.priority = priority;
        taskItem.innerHTML = `
            <p>Task: ${task}</p>
            <p>Priority: ${priority}</p>
            <p>Due Date: ${dueDate}</p>
            <p>Due Time: ${dueTime}</p>
            <p>Description: ${description}</p>
            ${status === 'active' ? '<button class="complete-btn">Complete</button>' : ''}
            <button class="delete-btn">Delete</button>
        `;
        return taskItem;
    }

    function saveTasks() {
        const tasks = [];
        const taskItems = todoList.getElementsByClassName('task-item');
        Array.from(taskItems).forEach(taskItem => {
            tasks.push({
                task: taskItem.querySelector('p:nth-child(1)').textContent.replace('Task: ', ''),
                priority: taskItem.dataset.priority,
                dueDate: taskItem.querySelector('p:nth-child(3)').textContent.replace('Due Date: ', ''),
                dueTime: taskItem.querySelector('p:nth-child(4)').textContent.replace('Due Time: ', ''),
                description: taskItem.querySelector('p:nth-child(5)').textContent.replace('Description: ', ''),
                status: taskItem.dataset.status
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            const taskItem = createTaskElement(task.task, task.priority, task.dueDate, task.dueTime, task.description, task.status);
            todoList.appendChild(taskItem);
        });
    }
});