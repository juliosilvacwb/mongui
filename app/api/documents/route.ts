import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dbName = searchParams.get("db");
    const collectionName = searchParams.get("collection");
    const limitParam = searchParams.get("limit") || "50";

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const limit = parseInt(limitParam, 10);
    const documents = await collection.find({}).limit(limit).toArray();

    // Converter ObjectId para string para serialização JSON
    const serializedDocs = documents.map((doc) => ({
      ...doc,
      _id: doc._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedDocs,
      count: serializedDocs.length,
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
