import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");

    if (!dbName) {
      return NextResponse.json(
        { success: false, error: "Database name is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    
    const collections = await db.listCollections().toArray();
    
    const collectionNames = collections.map((col) => ({
      name: col.name,
      type: col.type,
    }));

    return NextResponse.json({
      success: true,
      data: collectionNames,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
