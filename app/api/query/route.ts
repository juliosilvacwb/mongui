import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { db: dbName, collection: collectionName, filter, sort, limit } = body;

    if (!dbName || !collectionName) {
      return NextResponse.json(
        { success: false, error: "Database and collection are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let query = collection.find(filter || {});

    if (sort) {
      query = query.sort(sort);
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    } else {
      query = query.limit(50); // Default
    }

    const documents = await query.toArray();

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
