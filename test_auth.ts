import "dotenv/config";
import * as db from "./server/db";
import { sdk } from "./server/_core/sdk";

async function test() {
  const mockOpenId = "mock-user-123";
  try {
    await db.upsertUser({
      openId: mockOpenId,
      name: "Joueur Test",
      email: "test@example.com",
      loginMethod: "mock",
      lastSignedIn: new Date(),
    });
    console.log("Upsert ok");
    const token = await sdk.createSessionToken(mockOpenId, { name: "Joueur Test" });
    console.log("Token ok", token);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
test();
