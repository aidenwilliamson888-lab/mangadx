// functions/api/proxy.js
// Cloudflare Pages Function - Proxy untuk MangaDex API

export async function onRequest(context) {
    const { request } = context;
    const url = new URL(request.url);

    // Ambil parameter 'url' dari query string
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
        return new Response(
            JSON.stringify({ error: 'Parameter url wajib diisi' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Validasi keamanan: cuma boleh ke api.mangadex.org
    const parsed = new URL(targetUrl);
    if (parsed.hostname !== 'api.mangadex.org') {
        return new Response(
            JSON.stringify({ error: 'Domain tidak diizinkan' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // Forward request ke MangaDex
    try {
        const response = await fetch(targetUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'MangaReader/1.0'
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Gagal ambil data dari MangaDex', detail: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
