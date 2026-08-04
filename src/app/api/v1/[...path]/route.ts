import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL || 'https://parking.service.rendsyah.my.id/api/v1';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const targetUrl = new URL(`${BACKEND_BASE_URL}/${path}`);

  // Forward Query String
  targetUrl.search = req.nextUrl.search;

  // Prepare Headers — forward auth, content-type, and accept
  const headers = new Headers();
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers.set('authorization', authHeader);
  }
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }
  const acceptHeader = req.headers.get('accept');
  if (acceptHeader) {
    headers.set('accept', acceptHeader);
  }

  // Read Body if applicable
  let body: ArrayBuffer | null = null;
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    try {
      body = await req.arrayBuffer();
    } catch {
      body = null;
    }
  }

  try {
    const backendRes = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      // @ts-ignore
      duplex: 'half',
    });

    const resContentType = backendRes.headers.get('content-type') || '';

    // ─── SSE Stream Passthrough ───────────────────────────────────────────────
    // When the backend responds with text/event-stream, pipe the raw
    // ReadableStream directly to the client without buffering.
    // DO NOT call backendRes.json() here — SSE is a never-ending stream
    // and json() would hang indefinitely, blocking the entire response.
    if (resContentType.includes('text/event-stream')) {
      return new Response(backendRes.body, {
        status: backendRes.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // ─── CSV Passthrough ──────────────────────────────────────────────────────
    const resHeaders = new Headers();
    if (resContentType) {
      resHeaders.set('content-type', resContentType);
    }

    if (resContentType.includes('text/csv')) {
      const csvText = await backendRes.text();
      return new NextResponse(csvText, {
        status: backendRes.status,
        headers: resHeaders,
      });
    }

    // ─── Standard JSON Response ───────────────────────────────────────────────
    const data = await backendRes.json();
    return NextResponse.json(data, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'BFF Proxy Request Failed',
        data: null,
      },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
