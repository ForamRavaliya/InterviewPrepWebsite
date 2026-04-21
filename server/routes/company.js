const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const { search, industry, difficulty } = req.query;
  let conditions = [], params = [], idx = 1;

  if (search)     { conditions.push(`name ILIKE $${idx++}`);      params.push(`%${search}%`); }
  if (industry)   { conditions.push(`industry = $${idx++}`);      params.push(industry); }
  if (difficulty) { conditions.push(`difficulty = $${idx++}`);    params.push(difficulty); }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  try {
    const result = await query(`SELECT * FROM companies ${where} ORDER BY name`, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies.' });
  }
});

router.get('/:id/questions', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM company_questions WHERE company_id = $1 ORDER BY frequency DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch company questions.' });
  }
});

router.get('/:id/problems', authenticate, async (req, res) => {
  try {
    const company = await query('SELECT name FROM companies WHERE id = $1', [req.params.id]);
    if (!company.rows.length) return res.status(404).json({ error: 'Company not found.' });
    const result = await query(
      `SELECT id, title, slug, difficulty, category, acceptance_rate
       FROM dsa_problems WHERE $1 = ANY(companies) ORDER BY difficulty`,
      [company.rows[0].name]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch company problems.' });
  }
});

module.exports = router;
