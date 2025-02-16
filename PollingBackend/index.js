const express = require('express');
const mysql = require('mysql2/promise'); // Use promise-based MySQL
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: 'root', // Replace with your MySQL password
  database: 'polling_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create a new poll
app.post('/api/polls', async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert poll
      const [pollResult] = await connection.query(
        'INSERT INTO polls (question) VALUES (?)',
        [question]
      );

      const pollId = pollResult.insertId;

      // Insert options one by one (Fix bulk insert issue)
      for (const option of options) {
        await connection.query(
          'INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)',
          [pollId, option]
        );
      }

      await connection.commit();
      
      // Fetch and return the newly created poll
      const [poll] = await pool.query(
        `SELECT p.*, 
         COALESCE(
           JSON_ARRAYAGG(
             JSON_OBJECT('id', po.id, 'text', po.option_text, 'votes', po.votes)
           ), '[]'
         ) AS options
         FROM polls p
         LEFT JOIN poll_options po ON p.id = po.poll_id
         WHERE p.id = ?
         GROUP BY p.id`,
        [pollId]
      );

      res.status(201).json(poll[0]);
    } catch (error) {
      await connection.rollback();
      console.error('Transaction Error:', error);
      res.status(500).json({ error: 'Error creating poll' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database Connection Error:', error);
    res.status(500).json({ error: 'Error creating poll' });
  }
});

// Get all polls
app.get('/api/polls', async (req, res) => {
  try {
    const [polls] = await pool.query(
      `SELECT p.*, 
       COALESCE(
         JSON_ARRAYAGG(
           JSON_OBJECT('id', po.id, 'text', po.option_text, 'votes', po.votes)
         ), '[]'
       ) AS options
       FROM polls p
       LEFT JOIN poll_options po ON p.id = po.poll_id
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    );

    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Error fetching polls' });
  }
});

// Get a single poll
app.get('/api/polls/:id', async (req, res) => {
  try {
    const [polls] = await pool.query(
      `SELECT p.*, 
       COALESCE(
         JSON_ARRAYAGG(
           JSON_OBJECT('id', po.id, 'text', po.option_text, 'votes', po.votes)
         ), '[]'
       ) AS options
       FROM polls p
       LEFT JOIN poll_options po ON p.id = po.poll_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );

    if (polls.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(polls[0]);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Error fetching poll' });
  }
});

// Vote on a poll
app.post('/api/polls/:id/vote', async (req, res) => {
  try {
    const { optionId } = req.body;

    if (!optionId) {
      return res.status(400).json({ error: 'Option ID is required' });
    }

    const [optionRows] = await pool.query(
      'SELECT * FROM poll_options WHERE id = ?',
      [optionId]
    );

    if (optionRows.length === 0) {
      return res.status(400).json({ error: 'Invalid option selected' });
    }

    await pool.query(
      'UPDATE poll_options SET votes = votes + 1 WHERE id = ?',
      [optionId]
    );

    const [polls] = await pool.query(
      `SELECT p.*, 
       COALESCE(
         JSON_ARRAYAGG(
           JSON_OBJECT('id', po.id, 'text', po.option_text, 'votes', po.votes)
         ), '[]'
       ) AS options
       FROM polls p
       LEFT JOIN poll_options po ON p.id = po.poll_id
       WHERE p.id = ?
       GROUP BY p.id`,
      [req.params.id]
    );

    if (polls.length === 0) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    res.json(polls[0]);
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Error voting' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://192.168.56.1:${PORT}`);
});
