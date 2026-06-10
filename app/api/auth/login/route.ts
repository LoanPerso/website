import { NextRequest, NextResponse } from "next/server";

// Public client login is a smoke: there is no public client portal yet, so the
// request runs for real (visible in the network) but always resolves to
// "account not found". Wire this to a real auth backend to go live.
const PROCESSING_DELAY = 1200;

export async function POST(request: NextRequest) {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email : "";
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // malformed body — handled by the validation below
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: true, code: "MISSING_FIELDS", message: "Email and password are required" },
      { status: 400 }
    );
  }

  // Simulate auth processing latency.
  await new Promise((resolve) => setTimeout(resolve, PROCESSING_DELAY));

  // Smoke: no matching client account is ever found.
  return NextResponse.json(
    { error: true, code: "ACCOUNT_NOT_FOUND", message: "Account not found" },
    { status: 401 }
  );
}
