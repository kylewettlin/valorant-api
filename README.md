# Valorant Compositions API

A simple REST API that provides Valorant team compositions data.

## Features

- Get all compositions
- Get a specific composition by ID
- Get list of all maps
- Clean, responsive documentation UI

## Tech Stack

- Node.js
- Express.js
- HTML/CSS for the documentation UI

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/valorant-api.git
   cd valorant-api
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the server
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

4. Visit `http://localhost:3001` in your browser to see the API documentation

## API Endpoints

- `GET /api/compositions` - Returns all compositions
- `GET /api/compositions/:id` - Returns a specific composition by ID
- `GET /api/maps` - Returns a list of all maps

## Deploying to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Add `PORT=10000` (or any port Render assigns)

## Integration with Client

Update your client application (React) to fetch data from this API instead of using local JSON files:

```javascript
// Example of fetching from the API
const fetchCompositions = async () => {
  try {
    const response = await fetch('https://your-render-url.onrender.com/api/compositions');
    const data = await response.json();
    setCompositions(data);
  } catch (error) {
    console.error('Error fetching compositions:', error);
  }
};
```

## License

MIT 