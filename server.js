const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const compositions = require('./data/compositions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Joi validation schema for new composition
const compositionSchema = Joi.object({
  name: Joi.string().required().min(3).max(50),
  map: Joi.string().required(),
  agents: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      role: Joi.string().required().valid('Duelist', 'Controller', 'Initiator', 'Sentinel'),
      main_image: Joi.string().optional()
    })
  ).min(1).max(5).required(),
  strategy: Joi.string().required().min(10).max(200),
  difficulty: Joi.string().required().valid('Easy', 'Medium', 'Hard')
});

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

// POST endpoint to add a new composition
app.post('/api/compositions', (req, res) => {
  // Validate the request body
  const { error, value } = compositionSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  
  // Generate a new ID (simple approach: max existing ID + 1)
  const newId = compositions.length > 0 
    ? Math.max(...compositions.map(comp => comp.id)) + 1 
    : 1;
  
  // Create the new composition with ID
  const newComposition = {
    id: newId,
    ...value
  };
  
  // Add to compositions array
  compositions.push(newComposition);
  
  // Return success response with the new composition
  res.status(201).json({ 
    success: true,
    message: 'Composition added successfully',
    composition: newComposition
  });
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 