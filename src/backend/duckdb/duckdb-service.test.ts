import { beforeEach, describe, expect, it } from "vitest";
import { DuckDbService } from "./duckdb-service";

describe("DuckDbService", () => {
  let service: DuckDbService;

  beforeEach(async () => {
    service = new DuckDbService();
    await service.initialize();
  });

  it("returns seeded schema metadata", async () => {
    const schema = await service.getSchema();
    const sampleSalesColumns = schema.filter((column) => column.tableName === "sample_sales");

    expect(sampleSalesColumns).toHaveLength(5);
    expect(sampleSalesColumns.map((column) => column.columnName)).toEqual([
      "order_id",
      "rep",
      "region",
      "revenue",
      "sold_at"
    ]);
  });

  it("executes a query and returns rows plus columns", async () => {
    const result = await service.executeQuery(`
      SELECT rep, ROUND(SUM(revenue), 2) AS total_revenue
      FROM sample_sales
      GROUP BY rep
      ORDER BY total_revenue DESC
    `);

    expect(result.columns).toEqual(["rep", "total_revenue"]);
    expect(result.rowCount).toBe(4);
    expect(result.rows[0]).toEqual({
      rep: "Casey",
      total_revenue: "3715.40"
    });
  });

  it("rejects blank SQL", async () => {
    await expect(service.executeQuery("   ")).rejects.toThrow(
      "Enter a SQL statement before running the query."
    );
  });

  it("surfaces invalid SQL errors", async () => {
    await expect(service.executeQuery("SELECT * FROM missing_table")).rejects.toThrow();
  });
});
