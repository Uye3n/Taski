console.log("renderer.ts läuft!");
let weekday: HTMLElement;
let day: HTMLElement;
let month: HTMLElement;
let addButton: HTMLButtonElement;
let input: HTMLInputElement;
let taskContainer: HTMLElement;
let taskAmount = 0;
let tasksChecked = 0;
let tasksDone: HTMLElement;
let totalTasks: HTMLElement;
let themeButton: HTMLButtonElement;
let themeMenu: HTMLElement;

// Display current date
window.addEventListener('DOMContentLoaded', () => {
    weekday = document.getElementById('weekday') as HTMLElement;
    day = document.getElementById('day') as HTMLElement;
    month = document.getElementById('month') as HTMLElement;
    addButton = document.getElementById('add-task-button') as HTMLButtonElement;
    input = document.getElementById('task-input') as HTMLInputElement;
    taskContainer = document.getElementById('task-container') as HTMLElement;
    tasksDone = document.getElementById('done-tasks') as HTMLElement;
    totalTasks = document.getElementById('total-tasks') as HTMLElement;
    themeButton = document.getElementById('theme') as HTMLButtonElement;
    themeMenu = document.getElementById('theme-menu') as HTMLDivElement;

    // Display saved theme at beginning
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme != null) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // Display selection menu
    themeButton.addEventListener("click", () => toggleMenu());

    // Select theme
    themeMenu.addEventListener("click", (e) => {
        const btn = (e.target as HTMLElement).closest("button[data-theme]") as HTMLButtonElement | null;
        if(!btn) return;
        const theme = btn.dataset.theme!;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        toggleMenu(false);
    });

    // Close menu if clicked outside
    document.addEventListener("click", (e) => {
        if (!themeMenu.hasAttribute("hidden")) {
            const clickInside = (e.target as Node).isSameNode(themeMenu)
                || themeMenu.contains(e.target as Node) || e.target === themeButton;
            if (!clickInside) toggleMenu(false);
        }
    });

    // Close when esc pressed
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") toggleMenu(false);
    });

    // Display current date
    const currentDay = new Date();

    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September",
                            "October", "November", "December"];

    if (weekday) {
        weekday.textContent = weekdays[currentDay.getDay()];
    }
    if (day) {
        day.textContent = currentDay.getDate().toString();
    }
    if (month) {
        month.textContent = months[currentDay.getMonth()];
    }

    // Load existing tasks
    (window as any).todoAPI.getTasks()
        .then((tasks: any[]) => {
            taskAmount = tasks.length;
            tasksChecked = tasks.filter(t => t.done).length;

            updateProgress();

            tasks.forEach(task => renderTask(task));
        });

    input.addEventListener("keydown", (event) => {
        if(event.key === "Enter") {
            addTask();
        }
    })

    // Add new task
    addButton.addEventListener("click" , () => {
        addTask();
    });
});

// Add task
function addTask() {
    const inputValue = input.value.trim();

    if (!inputValue) {
        console.log("No input value found");
        return;
    }

    (window as any).todoAPI.addTask(inputValue)
        .then((newTask: any) => {
            input.value = "";
            renderTask(newTask);

            taskAmount++;
            updateProgress();
        });
}


// Render tasks
function renderTask(task: any) {
    const lowerContainer = document.getElementById("lower-container");

    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    taskContainer.style.display = "block";

    const uniqueId = "task-" + task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = uniqueId;
    checkbox.name = "task";
    checkbox.checked = task.done;

    // Checkbox handling
    checkbox.addEventListener("change", () => {
        const checked = checkbox.checked;

        (window as any).todoAPI.toggleTaskDone(task.id, checked)
            .then(() => {
                console.log(`Task ${task.id} updated to done: ${checked}`);
                if(checked) {
                    tasksChecked++;
                } else {
                    tasksChecked--;
                }
                updateProgress();
            });
    });

    const label = document.createElement("label");
    label.htmlFor = uniqueId;
    label.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "clear-task-button";
    deleteButton.textContent = "x";
    deleteButton.addEventListener("click", () => {
        (window as any).todoAPI.deleteTask(task.id)
            .then(() => {
                taskContainer.remove();
                taskAmount--;
                if(checkbox.checked) {
                    tasksChecked--;
                }
                updateProgress();
            });
    });

    taskContainer.appendChild(checkbox);
    taskContainer.appendChild(label);
    taskContainer.appendChild(deleteButton);

    lowerContainer?.appendChild(taskContainer);
}

// Updates progress and progress bar
function updateProgress() {
    tasksDone.textContent = tasksChecked.toString();
    totalTasks.textContent = taskAmount.toString();

    const fill = document.querySelector(".progress-fill") as HTMLElement | null;
    if (fill) {
        const pct = taskAmount === 0 ? 0 : Math.round((tasksChecked / taskAmount) * 100);
        fill.style.width = `${pct}%`;
    }
}

// Display theme selection menu
function toggleMenu(show?: boolean) {
    const willShow = show ?? themeMenu.hasAttribute("hidden");
    if (willShow) {
        themeMenu.removeAttribute("hidden");
        themeButton.setAttribute("aria-expanded", "true");
    } else {
        themeMenu.setAttribute("hidden", "");
        themeButton.setAttribute("aria-expanded", "false");
    }
}