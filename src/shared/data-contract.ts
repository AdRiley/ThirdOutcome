export interface AppInfo {
  name: string;
  runtime: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

export interface SchemaColumn {
  tableName: string;
  columnName: string;
  dataType: string;
}

export interface CsvImportResult {
  filePath: string;
  tableName: string;
  rowCount: number;
}

export interface DesktopApi {
  getAppInfo: () => AppInfo;
  getSchema: () => Promise<SchemaColumn[]>;
  querySql: (sql: string) => Promise<QueryResult>;
  chooseCsvFile: () => Promise<CsvImportResult | null>;
}
