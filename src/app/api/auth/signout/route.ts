import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await auth.api.signOut();
  return NextResponse.redirect(new URL("/authentication", request.url));
}
