const express = require('express');
const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

let items = [
  { id: 1, name: 'Item One' },
  { id: 2, name: 'Item Two' }
];

app.get('/', (req, res) => res.json({ message: 'Sample API', uptime: process.uptime() }));

app.get('/items', (req, res) => res.json(items));

app.get('/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const item = items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/items', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const id = items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  const item = { id, name };
  items.push(item);
  res.status(201).json(item);
});

app.listen(port, () => console.log(`Sample API listening on http://localhost:${port}`));
