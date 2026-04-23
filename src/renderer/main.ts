import "./styles.css";
import { createDesktopClient } from "./data-client";
import type { QueryResult, SchemaColumn } from "../shared/data-contract";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Renderer root element was not found.");
}

const desktopClient = createDesktopClient();
const appInfo = desktopClient.getAppInfo();
const defaultSql = `SELECT
  rep,
  region,
  ROUND(SUM(revenue), 2) AS total_revenue,
  COUNT(*) AS orders
FROM sample_sales
GROUP BY 1, 2
ORDER BY total_revenue DESC;`;

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">Electron + TypeScript + DuckDB</p>
      <h1>${appInfo.name}</h1>
      <p class="lede">
        Local SQL workbench running against DuckDB inside Electron. This is the first query path we will later hand to the LLM layer.
      </p>
    </section>

    <section class="workspace">
      <article class="panel composer">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">SQL Editor</p>
            <h2>Run a DuckDB query</h2>
          </div>
          <button class="run-button" id="run-query" type="button">Run Query</button>
        </div>
        <label class="label" for="sql-editor">SQL</label>
        <textarea id="sql-editor" spellcheck="false">${defaultSql}</textarea>
        <p class="hint">
          Starter table: <code>sample_sales</code>. Try <code>SELECT * FROM sample_sales LIMIT 5;</code>
        </p>
      </article>

      <article class="panel schema-panel">
        <p class="panel-kicker">Schema</p>
        <h2>Available tables</h2>
        <div id="schema-list" class="schema-list"></div>
      </article>
    </section>

    <section class="panel results-panel">
      <div class="panel-header">
        <div>
          <p class="panel-kicker">Results</p>
          <h2>Query output</h2>
        </div>
        <div id="query-meta" class="query-meta">Ready</div>
      </div>
      <p id="query-error" class="query-error" hidden></p>
      <div id="results-container" class="results-container">
        <p class="empty-state">Run a query to inspect rows from DuckDB.</p>
      </div>
    </section>

    <section class="panel notes-panel">
      <p class="panel-kicker">Next Step</p>
      <h2>What this enables</h2>
      <p>
        The renderer can now send reviewed SQL to the Electron main process, which executes it against DuckDB and returns rows for display.
      </p>
    </section>

    <footer class="status">
      <span>Runtime: ${appInfo.runtime}</span>
      <span>Bridge: preload + IPC active</span>
      <span>Engine: DuckDB node-api</span>
    </footer>
  </main>
`;

const editor = document.querySelector<HTMLTextAreaElement>("#sql-editor");
const runButton = document.querySelector<HTMLButtonElement>("#run-query");
const schemaList = document.querySelector<HTMLDivElement>("#schema-list");
const queryMeta = document.querySelector<HTMLDivElement>("#query-meta");
const queryError = document.querySelector<HTMLParagraphElement>("#query-error");
const resultsContainer = document.querySelector<HTMLDivElement>("#results-container");

if (!editor || !runButton || !schemaList || !queryMeta || !queryError || !resultsContainer) {
  throw new Error("Expected renderer controls were not found.");
}

const sqlEditor = editor;
const runQueryButton = runButton;
const schemaListContainer = schemaList;
const queryMetaLabel = queryMeta;
const queryErrorLabel = queryError;
const queryResultsContainer = resultsContainer;

function renderSchema(columns: SchemaColumn[]): void {
  const grouped = new Map<string, SchemaColumn[]>();

  for (const column of columns) {
    const tableColumns = grouped.get(column.tableName) ?? [];
    tableColumns.push(column);
    grouped.set(column.tableName, tableColumns);
  }

  schemaListContainer.innerHTML = [...grouped.entries()]
    .map(([tableName, tableColumns]) => {
      const rows = tableColumns
        .map(
          (column) => `
            <li>
              <span>${column.columnName}</span>
              <code>${column.dataType}</code>
            </li>
          `
        )
        .join("");

      return `
        <section class="schema-table">
          <h3>${tableName}</h3>
          <ul>${rows}</ul>
        </section>
      `;
    })
    .join("");
}

function renderResults(result: QueryResult): void {
  if (result.columns.length === 0) {
    queryResultsContainer.innerHTML = `<p class="empty-state">Statement completed successfully. No rows were returned.</p>`;
    return;
  }

  const headers = result.columns.map((column) => `<th>${column}</th>`).join("");
  const rows = result.rows
    .map((row) => {
      const cells = result.columns
        .map((column) => `<td>${String(row[column] ?? "")}</td>`)
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  queryResultsContainer.innerHTML = `
    <div class="table-scroll">
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

async function loadSchema(): Promise<void> {
  const schema = await desktopClient.getSchema();
  renderSchema(schema);
}

async function runCurrentQuery(): Promise<void> {
  runQueryButton.disabled = true;
  queryMetaLabel.textContent = "Running...";
  queryErrorLabel.hidden = true;

  try {
    const result = await desktopClient.querySql(sqlEditor.value);
    renderResults(result);
    queryMetaLabel.textContent = `${result.rowCount} row${result.rowCount === 1 ? "" : "s"} returned`;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The query failed.";
    queryErrorLabel.hidden = false;
    queryErrorLabel.textContent = message;
    queryResultsContainer.innerHTML = `<p class="empty-state">Fix the SQL and run the query again.</p>`;
    queryMetaLabel.textContent = "Query failed";
  } finally {
    runQueryButton.disabled = false;
  }
}

runQueryButton.addEventListener("click", () => {
  void runCurrentQuery();
});

void loadSchema();
void runCurrentQuery();
