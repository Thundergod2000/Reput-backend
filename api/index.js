// Testing-friendly Vercel serverless API
// Endpoints: /api/ (or /api/ping) -> pong, /api/echo -> reflects request, /api/items -> sample items
// CORS: reflects Origin header if present (allows testing from browsers). For production, restrict allowed origins.

const items = global.__items ||= [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' }
];

function sendJSON(res, obj, code = 200) {
  res.statusCode = code;
  res.end(JSON.stringify(obj));
}

module.exports = (req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Allow credentials when origin is provided
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  const { method, url, headers } = req;

  // Root / or /ping
  if (!url || url === '/' || url === '/ping') {
    return sendJSON(res, { message: 'pong', uptime: process.uptime(), origin: headers.origin || null });
  }

  // Echo endpoint for frontend testing
  if (url.startsWith('/echo')) {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      let parsed = null;
      try { parsed = body ? JSON.parse(body) : null; } catch (e) { parsed = { _raw: body }; }
      const urlObj = new URL(req.url, 'http://localhost');
      const query = Object.fromEntries(urlObj.searchParams.entries());
      return sendJSON(res, { method, headers, query, body: parsed });
    });
    return;
  }

  // Items list/CRUD
  const m = url.match(/^\/items(?:\/(\d+))?$/);
  if (m) {
    const id = m[1] ? Number(m[1]) : null;
    if (method === 'GET') {
      if (id) {
        const item = items.find(i => i.id === id);
        if (!item) return sendJSON(res, { error: 'Not found' }, 404);
        return sendJSON(res, item);
      }
      return sendJSON(res, items);
    }

    if (method === 'POST' && !id) {
      let body = '';
      req.on('data', c => body += c);
      req.on('end', () => {
        let parsed;
        try { parsed = body ? JSON.parse(body) : {}; } catch (e) { return sendJSON(res, { error: 'invalid json' }, 400); }
        const { name } = parsed;
        if (!name) return sendJSON(res, { error: 'name required' }, 400);
        const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const item = { id: newId, name };
        items.push(item);
        return sendJSON(res, item, 201);
      });
      return;
    }

    return sendJSON(res, { error: 'Method not allowed' }, 405);
  }

  return sendJSON(res, { error: 'Not found' }, 404);
};
