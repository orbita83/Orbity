import { MemoryTaskDataSource } from "@/infra/datasources/memory-task-datasource";
import { runTaskDataSourceContractTests } from "@/infra/datasources/task-datasource.contract";

describe("MemoryTaskDataSource", () => {
  runTaskDataSourceContractTests(async () => new MemoryTaskDataSource());
});
