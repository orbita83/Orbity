import { InMemoryRoutineRepository } from "@/infra/repositories/in-memory-routine-repository";
import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { runRoutineRepositoryContractTests } from "@/infra/repositories/routine-repository.contract";

describe("InMemoryRoutineRepository", () => {
  runRoutineRepositoryContractTests(async () => {
    const tasks = new InMemoryTaskRepository();
    return { routines: new InMemoryRoutineRepository(tasks), tasks };
  });
});
