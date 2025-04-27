const express = require('express');
const cors = require('cors');
const path = require('path');
const Joi = require('joi');
const mongoose = require('mongoose');
// const compositions = require('./data/compositions'); // No longer using in-memory data

// --- MongoDB Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/valorantComps';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Schema and Model ---
const agentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['Duelist', 'Controller', 'Initiator', 'Sentinel'] },
  main_image: { type: String } // Assuming this is a URL or identifier, keep optional for now unless req changes
}, { _id: false }); // Prevent Mongoose from creating _id for subdocuments

const compositionMongooseSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  map: { type: String, required: true },
  agents: {
    type: [agentSchema],
    required: true,
    validate: [val => val.length >= 1 && val.length <= 5, 'Must have between 1 and 5 agents']
  },
  strategy: { type: String, required: true, minlength: 10, maxlength: 200 },
  difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
  imageUrl: { type: String, required: true }, // Added required image URL
  type: { type: String, enum: ['user', 'recommended'], default: 'recommended' } // To distinguish user vs seeded data
}, { timestamps: true }); // Add createdAt and updatedAt timestamps

const Composition = mongoose.model('Composition', compositionMongooseSchema);

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
      // main_image removed, relying on top-level imageUrl
    })
  ).min(1).max(5).required(),
  strategy: Joi.string().required().min(10).max(200),
  difficulty: Joi.string().required().valid('Easy', 'Medium', 'Hard'),
  imageUrl: Joi.string().uri().required() // Add required image URL validation
});

// Routes
app.get('/api/compositions', (req, res) => {
  res.json(compositions);
});

app.get('/api/compositions/:id', async (req, res) => {
  try {
    const composition = await Composition.findById(req.params.id);
    if (!composition) {
      return res.status(404).json({ success: false, message: 'Composition not found' });
    }
    res.json(composition);
  } catch (error) {
     // Handle potential CastError if ID format is invalid for MongoDB ObjectId
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Composition ID format' });
    }
    console.error("Error fetching composition by ID:", error);
    res.status(500).json({ success: false, message: 'Error fetching composition' });
  }
});

app.get('/api/maps', async (req, res) => {
  try {
    // Fetch distinct map values directly from the database
    const maps = await Composition.distinct('map');
    res.json(maps);
  } catch (error) {
    console.error("Error fetching maps:", error);
    res.status(500).json({ success: false, message: 'Error fetching maps' });
  }
});

// POST endpoint to add a new composition
app.post('/api/compositions', async (req, res) => {
  // Validate the request body
  const { error, value } = compositionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }
  
  try {
    // Create new composition document, explicitly setting type to 'user'
    const newCompositionData = {
      ...value,
      type: 'user' // Ensure new comps are marked as user-created
    };
    const newComposition = new Composition(newCompositionData);
    await newComposition.save(); // Save to database
    
    // Return success response with the new composition (including _id from DB)
    res.status(201).json({ 
      success: true,
      message: 'Composition added successfully',
      composition: newComposition 
    });
  } catch (dbError) {
    console.error("Error saving new composition:", dbError);
    // Handle potential Mongoose validation errors
    if (dbError.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Database validation failed',
            errors: Object.values(dbError.errors).map(e => e.message)
        });
    }
    res.status(500).json({ success: false, message: 'Error saving composition to database' });
  }
});

// GET endpoint for recommended compositions
app.get('/api/recommended/compositions', async (req, res) => {
  try {
    const recommendedComps = await Composition.find({ type: 'recommended' });
    res.json(recommendedComps);
  } catch (error) {
    console.error("Error fetching recommended compositions:", error);
    res.status(500).json({ success: false, message: 'Error fetching recommended compositions' });
  }
});

// GET endpoint for user-created compositions
app.get('/api/user/compositions', async (req, res) => {
  try {
    const userComps = await Composition.find({ type: 'user' });
    res.json(userComps);
  } catch (error) {
    console.error("Error fetching user compositions:", error);
    res.status(500).json({ success: false, message: 'Error fetching user compositions' });
  }
});

// PUT endpoint to update an existing composition
app.put('/api/compositions/:id', async (req, res) => {
  const { id } = req.params;

  // Validate the request body first
  const { error, value } = compositionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
  }

  try {
    // Find and update the composition in the database
    // { new: true } returns the updated document
    // value already contains the validated fields including imageUrl
    const updatedComposition = await Composition.findByIdAndUpdate(
      id, 
      value, // Use the validated 'value' which includes all fields from Joi schema
      { new: true, runValidators: true } // Return updated doc & run Mongoose validators
    );

    if (!updatedComposition) {
      return res.status(404).json({ success: false, message: 'Composition not found' });
    }

    res.json({
      success: true,
      message: 'Composition updated successfully',
      composition: updatedComposition
    });
  } catch (dbError) {
     // Handle potential CastError if ID format is invalid
    if (dbError.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Composition ID format' });
    }
    // Handle potential Mongoose validation errors during update
    if (dbError.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Database validation failed during update',
            errors: Object.values(dbError.errors).map(e => e.message)
        });
    }
    console.error("Error updating composition:", dbError);
    res.status(500).json({ success: false, message: 'Error updating composition in database' });
  }
});

// DELETE endpoint to remove a composition
app.delete('/api/compositions/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedComposition = await Composition.findByIdAndDelete(id);

    if (!deletedComposition) {
      return res.status(404).json({ success: false, message: 'Composition not found' });
    }

    res.json({ success: true, message: 'Composition deleted successfully' });
  } catch (dbError) {
     // Handle potential CastError if ID format is invalid
    if (dbError.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Composition ID format' });
    }
    console.error("Error deleting composition:", dbError);
    res.status(500).json({ success: false, message: 'Error deleting composition from database' });
  }
});

// Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 