# backend-test

Minimal Vercel Node.js API deployable immediately.

Deploy:
1. npm i -g vercel
2. vercel login
3. cd backend-test && vercel

Test (after deploy):

curl https://<your-deployment-url>/api

Frontend sample:

fetch('https://<your-deployment-url>/api')
  .then(r => r.json())
  .then(console.log);
