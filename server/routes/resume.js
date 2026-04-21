const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, template, ats_score, is_primary, created_at, updated_at FROM resumes WHERE user_id = $1 ORDER BY updated_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resumes.' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await query('SELECT * FROM resumes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Resume not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch resume.' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { title, template = 'modern', content } = req.body;
  try {
    const result = await query(
      'INSERT INTO resumes (user_id, title, template, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title || 'My Resume', template, JSON.stringify(content)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create resume.' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { title, template, content } = req.body;
  try {
    const result = await query(
      'UPDATE resumes SET title = COALESCE($1, title), template = COALESCE($2, template), content = COALESCE($3, content) WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, template, content ? JSON.stringify(content) : null, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Resume not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resume.' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM resumes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Resume deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
});

module.exports = router;
