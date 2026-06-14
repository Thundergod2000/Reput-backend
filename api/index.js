// Simple in-memory items API for Vercel serverless
// NOTE: serverless functions are stateless across cold starts; in-memory data may not persist.

const items = global.__items ||= [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' }
];

module.exports = (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  const { method, url } = req;

  if (!url || url === '/') {
    return res.end(JSON.stringify({ message: 'Sample API', uptime: process.uptime() }));
  }

  const m = url.match(/^\/items(?:\/(\d+))?$/);
  if (!m) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  const id = m[1] ? Number(m[1]) : null;

  if (method === 'GET') {
    if (id) {
      const item = items.find(i => i.id === id);
      if (!item) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      return res.end(JSON.stringify(item));
    }
    return res.end(JSON.stringify(items));
  }

  if (method === 'POST' && !id) {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      let parsed;
      try {
        parsed = JSON.parse(body || '{}');
      } catch (e) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'invalid json' }));
      }
      const { name } = parsed;
      if (!name) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'name required' }));
      }
      const newId = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
      const item = { id: newId, name };
      items.push(item);
      res.statusCode = 201;
      return res.end(JSON.stringify(item));
    });
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};
