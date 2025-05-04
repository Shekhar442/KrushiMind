import { getDB } from '../../../server/db/database';

export default async function handler(req, res) {
  const db = await getDB();
  
  try {
    switch (req.method) {
      case 'GET':
        // Handle GET request
        const rows = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM crops', (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        res.status(200).json(rows);
        break;
        
      case 'POST':
        // Handle POST request
        const { name, season, description } = req.body;
        const result = await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO crops (name, season, description) VALUES (?, ?, ?)',
            [name, season, description],
            function(err) {
              if (err) reject(err);
              else resolve({ id: this.lastID });
            }
          );
        });
        res.status(201).json(result);
        break;
        
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 