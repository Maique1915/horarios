import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        let response = await fetch(url);

        // Handle Google Drive "virus scan" confirmation for large files
        if (url.includes('drive.google.com') && response.ok) {
            const contentType = response.headers.get('content-type') || '';

            // Only search for confirm token if it's an HTML page (warning page)
            if (contentType.includes('text/html')) {
                const bodyText = await response.clone().text();
                const confirmMatch = bodyText.match(/confirm=([a-zA-Z0-9_]+)/);

                if (confirmMatch && confirmMatch[1]) {
                    const confirmToken = confirmMatch[1];
                    const newUrl = `${url}&confirm=${confirmToken}`;

                    // Passing cookies from the first request is often required by Google
                    const cookies = response.headers.get('set-cookie');

                    response = await fetch(newUrl, {
                        headers: cookies ? { 'Cookie': cookies } : {}
                    });
                }
            }
        }

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch from source: ${response.statusText}` }, { status: response.status });
        }

        const contentType = response.headers.get('content-type');
        const blob = await response.blob();
        const buffer = Buffer.from(await blob.arrayBuffer());

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType || 'application/octet-stream',
                'Content-Disposition': `attachment;`,
                'Access-Control-Allow-Origin': '*', // Allow CORS for this specific proxy
            },
        });

    } catch (error: any) {
        console.error('Proxy Download Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
