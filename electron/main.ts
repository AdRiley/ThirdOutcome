import path from "node:path";
import { app, BrowserWindow } from "electron";
import { DuckDbService } from "../src/backend/duckdb/duckdb-service";
import { registerDataHandlers } from "./ipc/register-data-handlers";

const isMac = process.platform === "darwin";
const duckDbService = new DuckDbService();

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
  await duckDbService.initialize();
  registerDataHandlers(duckDbService);

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
