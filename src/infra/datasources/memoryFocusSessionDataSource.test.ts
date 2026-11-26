import { describeFocusSessionDataSourceContract } from "@/infra/datasources/focusSessionDataSource.contract";
import { MemoryFocusSessionDataSource } from "@/infra/datasources/memoryFocusSessionDataSource";

describeFocusSessionDataSourceContract("MemoryFocusSessionDataSource", async () => ({
  dataSource: new MemoryFocusSessionDataSource(),
}));
