import path from "node:path";
import { app, BrowserWindow, ipcMain } from "electron";
import { executeQuery, getSchema, initializeDuckDb } from "./duckdb";

const isMac = process.platform === "darwin";

function createWindow(): BrowserWindow {
  const window = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#f4f1e8",
    title: "ThirdOutcome",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const rendererUrl = process.env.VITE_DEV_SERVER_URL;

  if (rendererUrl) {
    void window.loadURL(rendererUrl);
    window.webContents.openDevTools({ mode: "detach" });
  } else {
    void window.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  return window;
}

app.whenReady().then(async () => {
  await initializeDuckDb();

  ipcMain.handle("duckdb:query", async (_event, sql: string) => executeQuery(sql));
  ipcMain.handle("duckdb:schema", async () => getSchema());

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
