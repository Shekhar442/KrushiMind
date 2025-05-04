const express = require('express');
const next = require('next');
const path = require('path');
const cors = require('cors');
const { initDB } = require('./db/database');
const bodyParser = require('body-parser');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3001;

// Initialize database
initDB();

app.prepare().then(() => {
  const server = express();
  
  // Middleware
  server.use(cors());
  server.use(express.json({ limit: '10mb' }));
  server.use(express.urlencoded({ extended: true }));
  
  // Static files
  server.use('/models', express.static(path.join(__dirname, '../public/models')));
  server.use('/voices', express.static(path.join(__dirname, '../public/voices')));
  
  // API routes
  server.use('/api/identifications', require('./api/identifications'));
  server.use('/api/marketplace', require('./api/marketplace'));
  server.use('/api/finance', require('./api/finance'));
  
  // Simple connectivity check endpoint
  server.head('/api/ping', (req, res) => {
    res.status(200).end();
  });
  
  // Default route handler (Next.js)
  server.all('*', (req, res) => {
    return handle(req, res);
  });
  
  // Start server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> KrushiMind server ready on http://localhost:${port}`);
  });
});