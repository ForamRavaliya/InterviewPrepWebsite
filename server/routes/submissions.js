const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { problem_id, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let conditions = ['ds.user_id = $1'], params = [req.user.id], idx = 2;

  if (problem_id) { conditions.push(`ds.problem_id = $${idx++}`); params.push(problem_id); }
  if (status)     { conditions.push(`ds.status = $${idx++}`);     params.push(status); }

  try {
    const result = await query(
      `SELECT ds.*, dp.title as problem_title, dp.difficulty
       FROM dsa_submissions ds JOIN dsa_problems dp ON dp.id = ds.problem_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ds.submitted_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch submissions.' });
  }
});

module.exports = router;
