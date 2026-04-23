import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";
import type { CsvImportResult, QueryResult, SchemaColumn } from "../../shared/data-contract";

export interface DuckDbServiceOptions {
  databasePath?: string;
}

export class DuckDbService {
  static readonly importedTableName = "current_csv";
  private readonly databasePath: string;
  private instancePromise: Promise<DuckDBInstance> | null = null;
  private connectionPromise: Promise<DuckDBConnection> | null = null;

  constructor(options: DuckDbServiceOptions = {}) {
    this.databasePath = options.databasePath ?? ":memory:";
  }

  async initialize(): Promise<void> {
    await this.getConnection();
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    const trimmedSql = sql.trim();

    if (!trimmedSql) {
      throw new Error("Enter a SQL statement before running the query.");
    }

    const connection = await this.getConnection();
    const reader = await connection.runAndReadAll(trimmedSql);
    const columns = Object.keys(reader.getColumnsObjectJson());
    const rows = reader.getRowObjectsJson() as Record<string, unknown>[];

    return {
      columns,
      rows,
      rowCount: rows.length
    };
  }

  async getSchema(): Promise<SchemaColumn[]> {
    const connection = await this.getConnection();
    const reader = await connection.runAndReadAll(`
      SELECT
        table_name AS tableName,
        column_name AS columnName,
        data_type AS dataType
      FROM information_schema.columns
      WHERE table_schema = 'main'
      ORDER BY table_name, ordinal_position
    `);

    return reader.getRowObjectsJson() as unknown as SchemaColumn[];
  }

  async importCsv(filePath: string): Promise<CsvImportResult> {
    const trimmedPath = filePath.trim();

    if (!trimmedPath) {
      throw new Error("Choose a CSV file before importing.");
    }

    const connection = await this.getConnection();
    const escapedPath = trimmedPath.replace(/'/g, "''");
    const tableName = DuckDbService.importedTableName;

    await connection.run(`
      CREATE OR REPLACE TABLE ${tableName} AS
      SELECT *
      FROM read_csv_auto('${escapedPath}', HEADER = true)
    `);

    const reader = await connection.runAndReadAll(`
      SELECT COUNT(*) AS rowCount
      FROM ${tableName}
    `);
    const rows = reader.getRowObjectsJson() as Array<{ rowCount: string | number }>;
    const rowCount = Number(rows[0]?.rowCount ?? 0);

    return {
      filePath: trimmedPath,
      tableName,
      rowCount
    };
  }

  private async getInstance(): Promise<DuckDBInstance> {
    if (!this.instancePromise) {
      this.instancePromise = DuckDBInstance.create(this.databasePath);
    }

    return this.instancePromise;
  }

  private async getConnection(): Promise<DuckDBConnection> {
    if (!this.connectionPromise) {
      this.connectionPromise = (async () => {
        const instance = await this.getInstance();
        const connection = await instance.connect();
        await this.seedSampleData(connection);
        return connection;
      })();
    }

    return this.connectionPromise;
  }

  private async seedSampleData(connection: DuckDBConnection): Promise<void> {
    await connection.run(`
      CREATE OR REPLACE TABLE sample_sales AS
      SELECT *
      FROM (
        VALUES
          (1, 'Avery', 'North', 1250.50, DATE '2026-01-04'),
          (2, 'Jordan', 'South', 840.00, DATE '2026-01-08'),
          (3, 'Avery', 'North', 1990.10, DATE '2026-01-12'),
          (4, 'Morgan', 'West', 430.25, DATE '2026-01-13'),
          (5, 'Jordan', 'South', 1225.90, DATE '2026-01-15'),
          (6, 'Casey', 'East', 1575.00, DATE '2026-01-18'),
          (7, 'Morgan', 'West', 910.00, DATE '2026-01-19'),
          (8, 'Casey', 'East', 2140.40, DATE '2026-01-22')
      ) AS source(order_id, rep, region, revenue, sold_at)
    `);
  }
}
