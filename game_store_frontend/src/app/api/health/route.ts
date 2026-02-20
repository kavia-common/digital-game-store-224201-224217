import { NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/apiClient";

export const dynamic = "force-static";

// PUBLIC_INTERFACE
export async function GET() {
  /**
   * Static-export compatible health endpoint.
   *
   * With `output: "export"` Next.js cannot execute runtime fetches during build/export.
   * This endpoint therefore does NOT proxy the backend health check.
   *
   * To verify backend connectivity (port 3001), call the backend directly from the browser
   * or use the backend /docs endpoint.
   */
  return NextResponse.json({
    apiBaseUrl: getApiBaseUrl(),
    backendOk: null,
    note:
      "Static export mode: backend health proxy disabled. Check backend directly at NEXT_PUBLIC_API_BASE_URL.",
  });
}
