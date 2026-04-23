import { dialog, ipcMain } from "electron";
import type { DuckDbService } from "../../src/backend/duckdb/duckdb-service";

export function registerDataHandlers(service: DuckDbService): void {
  ipcMain.handle("duckdb:query", async (_event, sql: string) => service.executeQuery(sql));
  ipcMain.handle("duckdb:schema", async () => service.getSchema());
  ipcMain.handle("duckdb:choose-csv", async () => {
    const result = await dialog.showOpenDialog({
      title: "Choose a CSV file",
      properties: ["openFile"],
      filters: [
        { name: "CSV Files", extensions: ["csv"] },
        { name: "All Files", extensions: ["*"] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return service.importCsv(result.filePaths[0]);
  });
}
