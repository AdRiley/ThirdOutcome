import "./styles.css";

declare global {
  interface Window {
    desktop: {
      getAppInfo: () => {
        name: string;
        runtime: string;
      };
    };
  }
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Renderer root element was not found.");
}

const appInfo = window.desktop.getAppInfo();

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">Electron + TypeScript</p>
      <h1>${appInfo.name}</h1>
      <p class="lede">
        Desktop foundation for CSV-backed natural language analytics powered by DuckDB and LLM-generated SQL.
      </p>
    </section>

    <section class="panel-grid">
      <article class="panel">
        <h2>Ingest</h2>
        <p>Import CSV files and inspect inferred schema before querying.</p>
      </article>
      <article class="panel">
        <h2>Query</h2>
        <p>Send natural language prompts through multiple SQL-generation models.</p>
      </article>
      <article class="panel">
        <h2>Execute</h2>
        <p>Run reviewed SQL against DuckDB locally and render results in-app.</p>
      </article>
    </section>

    <footer class="status">
      <span>Runtime: ${appInfo.runtime}</span>
      <span>Bridge: preload active</span>
    </footer>
  </main>
`;
