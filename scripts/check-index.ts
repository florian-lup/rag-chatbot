// Load environment variables from .env.local BEFORE any other imports
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

import { Pinecone } from "@pinecone-database/pinecone";
import { config, validateConfig } from "../config/config";

class IndexChecker {
  private pinecone: Pinecone;

  constructor() {
    validateConfig();

    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
  }

  /**
   * Check the status and contents of the Pinecone index
   */
  async checkIndex(): Promise<void> {
    try {
      console.log(`\n🔍 Checking index: ${config.pinecone.indexName}`);
      console.log(`📍 Environment: ${config.pinecone.environment}\n`);

      // Get index
      const index = this.pinecone.Index(config.pinecone.indexName);

      // Get index description
      console.log("📋 Index Configuration:");
      const indexList = await this.pinecone.listIndexes();
      const indexInfo = indexList.indexes?.find((idx) => idx.name === config.pinecone.indexName);

      if (indexInfo) {
        console.log(`   Name: ${indexInfo.name}`);
        console.log(`   Dimension: ${indexInfo.dimension}`);
        console.log(`   Metric: ${indexInfo.metric}`);
        console.log(`   Host: ${indexInfo.host}`);
        console.log(`   Status: ✅ Ready`);
      }

      // Get index stats
      console.log("\n📊 Index Statistics:");
      const stats = await index.describeIndexStats();

      const totalVectors = stats.totalRecordCount || 0;
      console.log(`   Total vectors: ${totalVectors}`);

      if (stats.namespaces) {
        const namespaces = Object.keys(stats.namespaces);
        if (namespaces.length > 0) {
          console.log(`   Namespaces: ${namespaces.length}`);
          for (const ns of namespaces) {
            const nsStats = stats.namespaces[ns];
            console.log(`     - ${ns || "(default)"}: ${nsStats.recordCount} vectors`);
          }
        }
      }

      if (stats.dimension) {
        console.log(`   Vector dimension: ${stats.dimension}`);
      }

      if (stats.indexFullness) {
        const fullnessPercent = (stats.indexFullness * 100).toFixed(2);
        console.log(`   Index fullness: ${fullnessPercent}%`);
      }

      // Sample some vectors to show metadata structure
      if (totalVectors > 0) {
        console.log("\n📝 Sample Vector Metadata:");
        try {
          // Query with a random vector to get some results
          const queryResponse = await index.query({
            vector: new Array(1536).fill(0.1), // Dummy vector
            topK: 3,
            includeMetadata: true,
          });

          if (queryResponse.matches && queryResponse.matches.length > 0) {
            console.log(`   Found ${queryResponse.matches.length} sample vectors:`);
            queryResponse.matches.forEach((match, idx) => {
              console.log(`\n   Vector ${idx + 1}:`);
              console.log(`     ID: ${match.id}`);
              console.log(`     Score: ${match.score?.toFixed(4)}`);
              if (match.metadata) {
                console.log(`     Source: ${match.metadata.source}`);
                console.log(`     Section: ${match.metadata.section}`);
                if (match.metadata.subsection) {
                  console.log(`     Subsection: ${match.metadata.subsection}`);
                }
                if (match.metadata.text && typeof match.metadata.text === "string") {
                  const preview = match.metadata.text.substring(0, 100);
                  console.log(`     Text preview: "${preview}..."`);
                }
              }
            });
          }
        } catch (error) {
          console.log("   Could not retrieve sample vectors");
        }
      } else {
        console.log("\n📭 Index is empty. No vectors found.");
      }

      console.log("\n✅ Index check complete!");
    } catch (error) {
      console.error("\n❌ Error checking index:", error);
      throw error;
    }
  }
}

// Run the checker
async function main() {
  console.log("🔍 Pinecone Index Checker");
  console.log("========================");

  try {
    const checker = new IndexChecker();
    await checker.checkIndex();
  } catch (error) {
    console.error("\nFatal error:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
