import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_API_BASE_URL || 'https://parking.service.rendsyah.my.id/api/v1';

async function handleProxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join('/');
  const targetUrl = new URL(`${BACKEND_BASE_URL}/${path}`);

  // Forward Query String
  targetUrl.search = req.nextUrl.search;

  // Prepare Headers
  const headers = new Headers();
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    headers.set('authorization', authHeader);
  }
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  // Read Body if applicable
  let body: any = null;
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
