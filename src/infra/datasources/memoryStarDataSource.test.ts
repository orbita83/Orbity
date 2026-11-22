import { describeStarDataSourceContract } from "@/infra/datasources/starDataSource.contract";
import { MemoryStarDataSource } from "@/infra/datasources/memoryStarDataSource";

describeStarDataSourceContract("MemoryStarDataSource", async () => ({
  dataSource: new MemoryStarDataSource(),
}));
