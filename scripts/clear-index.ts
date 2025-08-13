// Load environment variables from .env.local BEFORE any other imports
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";
import { config, validateConfig } from "../config/config";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

class IndexCleaner {
  private pinecone: Pinecone;

  constructor() {
    validateConfig();

    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
  }

  /**
   * Delete all records from the Pinecone index
   */
  async clearIndex(): Promise<void> {
    try {
      console.log(`\n🗑️  Preparing to clear index: ${config.pinecone.indexName}`);

      // Get index
      const index = this.pinecone.Index(config.pinecone.indexName);

      // Get index stats to show current state
      const stats = await index.describeIndexStats();
      const totalVectors = stats.totalRecordCount || 0;

      if (totalVectors === 0) {
        console.log("✅ Index is already empty. No records to delete.");
        return;
      }

      console.log(`\n📊 Current index stats:`);
      console.log(`   Total vectors: ${totalVectors}`);

      // Confirm deletion
      console.log("\n⚠️  WARNING: This will delete ALL records from the index!");
      const confirmation = await question(
        `Type "DELETE ALL" to confirm deletion of ${totalVectors} vectors: `,
      );

      if (confirmation !== "DELETE ALL") {
        console.log("\n❌ Deletion cancelled. Index remains unchanged.");
        return;
      }

      console.log("\n🔄 Deleting all vectors from index...");

      // Delete all vectors using deleteAll
      await index.namespace("").deleteAll();

      // Verify deletion
      console.log("⏳ Verifying deletion...");

      // Wait a moment for Pinecone to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newStats = await index.describeIndexStats();
      const remainingVectors = newStats.totalRecordCount || 0;

      if (remainingVectors === 0) {
        console.log("\n✅ Success! All vectors have been deleted from the index.");
        console.log(`   Deleted: ${totalVectors} vectors`);
      } else {
        console.log(`\n⚠️  Partial deletion. Remaining vectors: ${remainingVectors}`);
        console.log(`   You may need to run this script again.`);
      }
    } catch (error) {
      console.error("\n❌ Error clearing index:", error);
      throw error;
    }
  }
}

// Run the cleaner
async function main() {
  console.log("🧹 Pinecone Index Cleaner");
  console.log("========================\n");

  try {
    const cleaner = new IndexCleaner();
    await cleaner.clearIndex();
  } catch (error) {
    console.error("\nFatal error:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  rl.close();
  process.exit(1);
});
