import { describeCategoryDataSourceContract } from "@/infra/datasources/categoryDataSource.contract";
import { MemoryCategoryDataSource } from "@/infra/datasources/memoryCategoryDataSource";
import { MemoryRoutineDataSource } from "@/infra/datasources/memoryRoutineDataSource";
import { MemoryTaskDataSource } from "@/infra/datasources/memoryTaskDataSource";

describeCategoryDataSourceContract("MemoryCategoryDataSource", async () => {
  const tasks = new MemoryTaskDataSource();
  const routines = new MemoryRoutineDataSource(tasks);
  return { dataSource: new MemoryCategoryDataSource(tasks, routines), tasks, routines };
});
