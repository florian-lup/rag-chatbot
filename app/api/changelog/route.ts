import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read from the scraped JSON file
    const jsonPath = path.join(process.cwd(), "public", "changelog.json");

    if (!fs.existsSync(jsonPath)) {
      console.log('No changelog file found. Run "npm run scrape:changelog" to generate it.');
      return NextResponse.json(
        { error: "Changelog not found. Please run the scraper first." },
        { status: 404 },
      );
    }

    console.log("Reading changelog from saved JSON file...");
    const data = fs.readFileSync(jsonPath, "utf-8");
    const changelog = JSON.parse(data);
    return NextResponse.json(changelog);
  } catch (error) {
    console.error("Error fetching changelog:", error);
    return NextResponse.json({ error: "Failed to read changelog" }, { status: 500 });
  }
}
