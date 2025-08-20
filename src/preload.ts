import { contextBridge, ipcRenderer } from "electron";
console.log("Preload läuft!");
contextBridge.exposeInMainWorld("todoAPI", {
    addTask: (text: string) => ipcRenderer.invoke("add-task", text),
    deleteTask: (id: number) => ipcRenderer.invoke("delete-task", id),
    getTasks: () => ipcRenderer.invoke("get-tasks"),
    toggleTaskDone: (id: number, done: boolean) => ipcRenderer.invoke("toggle-task-done", id, done),
});