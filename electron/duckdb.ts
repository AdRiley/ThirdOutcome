import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

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

let instancePromise: Promise<DuckDBInstance> | null = null;
let connectionPromise: Promise<DuckDBConnection> | null = null;

async function getInstance(): Promise<DuckDBInstance> {
  if (!instancePromise) {
    instancePromise = DuckDBInstance.create(":memory:");
  }

  return instancePromise;
}

async function getConnection(): Promise<DuckDBConnection> {
  if (!connectionPromise) {
    connectionPromise = (async () => {
      const instance = await getInstance();
      const connection = await instance.connect();

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

      return connection;
    })();
  }

  return connectionPromise;
}

export async function initializeDuckDb(): Promise<void> {
  await getConnection();
}

export async function executeQuery(sql: string): Promise<QueryResult> {
  const trimmedSql = sql.trim();

  if (!trimmedSql) {
    throw new Error("Enter a SQL statement before running the query.");
  }

  const connection = await getConnection();
  const reader = await connection.runAndReadAll(trimmedSql);
  const columns = Object.keys(reader.getColumnsObjectJson());
  const rows = reader.getRowObjectsJson() as Record<string, unknown>[];

  return {
    columns,
    rows,
    rowCount: rows.length
  };
}

export async function getSchema(): Promise<SchemaColumn[]> {
  const connection = await getConnection();
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
