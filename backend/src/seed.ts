import { localStore } from "./services/localStore";
import { seedInitialData } from "./services/allocation.service";

export const main = async () => {
  await localStore.init();
  await seedInitialData();
  console.log("Seed completed");
};

if (require.main === module) {
  main().catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  });
}
