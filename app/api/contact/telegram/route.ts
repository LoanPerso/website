import { NextRequest, NextResponse } from "next/server";

function clampText(input: string, maxLen: number) {
  const s = input.trim();
  if (s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1))}\u2026`;
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: true, code: "TELEGRAM_NOT_CONFIGURED" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name : "";
    const email = typeof body?.email === "string" ? body.email : "";
    const message = typeof body?.message === "string" ? body.message : "";
    const website = typeof body?.website === "string" ? body.website : ""; // honeypot

    if (website) {
      // Likely bot.
      return NextResponse.json({ ok: true });
    }

    const msg = message.trim();
    if (!msg) {
      return NextResponse.json(
        { error: true, code: "MISSING_MESSAGE" },
        { status: 400 }
      );
    }

    const ua = req.headers.get("user-agent") || "";
    const ip = req.headers.get("x-forwarded-for") || "";

    const text = [
      "Nouveau message (site Quickfund):",
      "",
      `Nom: ${clampText(name || "-", 120)}`,
      `Email: ${clampText(email || "-", 160)}`,
      "",
      "Message:",
      clampText(msg, 3500),
      "",
      `IP: ${clampText(ip || "-", 200)}`,
      `UA: ${clampText(ua || "-", 300)}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const telegramRes = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    });

    const telegramJson = await telegramRes.json().catch(() => null);
    if (!telegramRes.ok || !telegramJson?.ok) {
      return NextResponse.json(
        { error: true, code: "TELEGRAM_SEND_FAILED" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Contact telegram error:", e);
    return NextResponse.json(
      { error: true, code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

