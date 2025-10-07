import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await clientPromise;
    const adminDb = client.db("admin");
    
    const result = await adminDb.admin().listDatabases();
    
    const databases = result.databases
      .filter((db) => !["admin", "local", "config"].includes(db.name))
      .map((db) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
        empty: db.empty,
      }));

    return NextResponse.json({
      success: true,
      data: databases,
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
