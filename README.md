# backend-test

Minimal Vercel Node.js API deployable immediately.

Deploy:
1. npm i -g vercel
2. vercel login
3. cd backend-test && vercel

Test (after deploy):

- GET /api or /api/ping -> pong
- GET /api/items -> list
- POST /api/items -> create { name }
- POST /api/echo -> echoes method, headers, query and JSON body

Examples:

curl https://<your-deployment-url>/api/ping

curl https://<your-deployment-url>/api/items

curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"New\"}" https://<your-deployment-url>/api/items

# Frontend sample (browser)
fetch('https://<your-deployment-url>/api/ping', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)

# Echo example
fetch('https://<your-deployment-url>/api/echo?test=1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ hello: 'world' })
})
  .then(r => r.json())
  .then(console.log);

