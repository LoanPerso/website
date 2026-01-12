import { NextRequest, NextResponse } from "next/server";

// Simulated processing delay (in ms)
const PROCESSING_DELAY = 2000;

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const idDocument = formData.get("idDocument") as File | null;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        {
          error: true,
          code: "MISSING_FIELDS",
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (!idDocument) {
      return NextResponse.json(
        {
          error: true,
          code: "MISSING_DOCUMENT",
          message: "ID document is required",
        },
        { status: 400 }
      );
    }

    // Simulate server-side processing/analysis
    await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY));

    // For now, always return "country not supported" error
    // This makes it easy to change later when we want to accept applications
    return NextResponse.json(
      {
        error: true,
        code: "COUNTRY_NOT_SUPPORTED",
        message: "We were unable to verify your identity. The country detected from your document is not currently supported.",
        details: {
          documentReceived: true,
          documentType: idDocument.type,
          documentSize: idDocument.size,
          applicant: {
            firstName,
            lastName,
            email,
          },
          analysis: {
            status: "rejected",
            reason: "country_not_supported",
            supportedCountries: ["EE"],
            timestamp: new Date().toISOString(),
          },
        },
      },
      { status: 422 }
    );
  } catch (error) {
    console.error("Application analysis error:", error);

    return NextResponse.json(
      {
        error: true,
        code: "INTERNAL_ERROR",
        message: "An error occurred while processing your application",
      },
      { status: 500 }
    );
  }
}
