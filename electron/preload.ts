import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("desktop", {
  getAppInfo: () => ({
    name: "ThirdOutcome",
    runtime: "electron"
  })
});
