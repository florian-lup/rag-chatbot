import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Read from the scraped JSON file
    const jsonPath = path.join(process.cwd(), "public", "changelog", "changelog.json");

    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json(
        { error: "Changelog not found. Please run the scraper first." },
        { status: 404 },
      );
    }

    const data = fs.readFileSync(jsonPath, "utf-8");
    const changelog = JSON.parse(data);
    return NextResponse.json(changelog);
  } catch {
    return NextResponse.json({ error: "Failed to read changelog" }, { status: 500 });
  }
}
