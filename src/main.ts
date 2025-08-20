import {app, BrowserWindow, ipcMain} from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises'

const filePath = path.join(app.getPath("userData"), "tasks.json");

// Add task
ipcMain.handle("add-task", (event, text: string) => {
    return readTasks()
        .then(tasks => {
            const newTask = { id: Date.now(), text, done: false };
            tasks.push(newTask);
            return saveTasks(tasks).then(() => newTask);
        });
});

// Delete task
ipcMain.handle("delete-task", (event, id: number) => {
    return readTasks()
        .then(tasks => {
            const updated = tasks.filter((task: { id: number; }) => task.id !== id);
            return saveTasks(updated).then(() => true);
        });
});

// Get tasks
ipcMain.handle("get-tasks", async => {
    return readTasks();
})

// Toggle checkbox
ipcMain.handle("toggle-task-done", async (event, id: number, done: boolean) => {
    const tasks = await readTasks();
    const updatedTasks = tasks.map((task: { id: number; }) =>
        task.id === id ? {...task, done} : task
    );
    await saveTasks(updatedTasks);
    return true;
});


// Create window
function createWindow() {
    const win = new BrowserWindow({
        width: 470,
        height: 550,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        },
        resizable: false,
    });

    win.loadFile(path.join(__dirname, '../index.html'));
}

app.whenReady().then(createWindow);

// Read .json
function readTasks() {
    return fs.readFile(filePath, "utf-8")
        .then(data => JSON.parse(data))
        .catch(err => {
            if (err.code === "ENOENT") return [];
            throw err;
        });
}

// Save .json file
function saveTasks(tasks: any[]) {
    return fs.writeFile(filePath, JSON.stringify(tasks, null, 2));
}
