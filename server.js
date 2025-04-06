const express = require('express');
const cors = require('cors');
const path = require('path');
const compositions = require('./data/compositions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/compositions', (req, res) => {
  res.json(compositions);
});

app.get('/api/compositions/:id', (req, res) => {
  const composition = compositions.find(comp => comp.id === parseInt(req.params.id));
  
  if (!composition) {
    return res.status(404).json({ message: 'Composition not found' });
  }
  
  res.json(composition);
});

app.get('/api/maps', (req, res) => {
  const maps = [...new Set(compositions.map(comp => comp.map))];
  res.json(maps);
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 