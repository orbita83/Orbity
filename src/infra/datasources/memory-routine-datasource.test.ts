import { MemoryRoutineDataSource } from "@/infra/datasources/memory-routine-datasource";
import { MemoryTaskDataSource } from "@/infra/datasources/memory-task-datasource";
import { runRoutineDataSourceContractTests } from "@/infra/datasources/routine-datasource.contract";

describe("MemoryRoutineDataSource", () => {
  runRoutineDataSourceContractTests(async () => {
    const tasks = new MemoryTaskDataSource();
    return { routines: new MemoryRoutineDataSource(tasks), tasks };
  });
});
