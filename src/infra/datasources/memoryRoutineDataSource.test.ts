import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";
import { runRoutineDataSourceContractTests } from "@/infra/datasources/routineDataSource.contract";

describe("MemoryRoutineDataSource", () => {
  runRoutineDataSourceContractTests(async () => {
    const tasks = new MemoryTaskDataSource();
    return { routines: new MemoryRoutineDataSource(tasks), tasks };
  });
});
