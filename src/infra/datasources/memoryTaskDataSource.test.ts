import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { runTaskDataSourceContractTests } from "@/infra/datasources/taskDataSource.contract";

describe("MemoryTaskDataSource", () => {
  runTaskDataSourceContractTests(async () => new MemoryTaskDataSource());
});
