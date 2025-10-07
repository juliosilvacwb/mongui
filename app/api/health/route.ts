import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongoClient";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    
    return NextResponse.json({
      success: true,
      message: "Conexão com MongoDB estabelecida com sucesso",
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

