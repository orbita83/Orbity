import { InMemoryTaskRepository } from "@/infra/repositories/in-memory-task-repository";
import { runTaskRepositoryContractTests } from "@/infra/repositories/task-repository.contract";

describe("InMemoryTaskRepository", () => {
  runTaskRepositoryContractTests(async () => new InMemoryTaskRepository());
});
