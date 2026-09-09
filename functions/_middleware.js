// functions/_middleware.js
// Middleware global - handle semua request termasuk /api/proxy

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 🔥 Cuma handle request ke /api/proxy
    if (pathname === '/api/proxy' || pathname.startsWith('/api/proxy?')) {
        const targetUrl = url.searchParams.get('url');
        if (!targetUrl) {
            return new Response(
                JSON.stringify({ error: 'Parameter url wajib diisi' }),
                { 
                    status: 400, 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    } 
                }
            );
        }

        // Validasi keamanan: cuma boleh ke api.mangadex.org
        try {
            const parsed = new URL(targetUrl);
            if (parsed.hostname !== 'api.mangadex.org') {
                return new Response(
                    JSON.stringify({ error: 'Domain tidak diizinkan' }),
                    { 
                        status: 403, 
                        headers: { 
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        } 
                    }
                );
            }
        } catch (e) {
            return new Response(
                JSON.stringify({ error: 'URL tidak valid' }),
                { 
                    status: 400, 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    } 
                }
            );
        }

        // Forward request ke MangaDex
        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'MangaReader/1.0 (Cloudflare Pages)'
                }
            });

            const data = await response.json();

            return new Response(JSON.stringify(data), {
                status: response.status,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=300'
                }
            });

        } catch (error) {
            return new Response(
                JSON.stringify({ 
                    error: 'Gagal ambil data dari MangaDex', 
                    detail: error.message 
                }),
                { 
                    status: 500, 
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    } 
                }
            );
        }
    }

    // 🔥 Untuk request lain (selain /api/proxy), lanjutkan ke SPA / static
    return next();
}
