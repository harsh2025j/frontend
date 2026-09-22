import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "certificate.png";

  if (!fileUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  // Ensure URL is a valid HTTP/HTTPS URL to prevent SSRF
  try {
    const parsed = new URL(fileUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new NextResponse("Invalid protocol", { status: 400 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return new NextResponse(`Failed to fetch file from storage: ${res.statusText}`, {
        status: res.status,
      });
    }

    const contentType =
      res.headers.get("content-type") ||
      (filename.endsWith(".pdf") ? "application/pdf" : "image/png");

    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (error: any) {
    return new NextResponse(`Download error: ${error?.message || error}`, {
      status: 500,
    });
  }
}
