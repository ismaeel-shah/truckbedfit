import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/utils/email";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await sendContactEmail({ name: name.trim(), email: email.trim(), message: message.trim() });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
