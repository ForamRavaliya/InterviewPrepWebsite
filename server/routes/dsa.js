const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/dsa/problems — list with filters
router.get('/problems', authenticate, async (req, res) => {
  const { difficulty, category, tag, company, search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  const params = [req.user.id];
  let conditions = [];
  let idx = 2;

  if (difficulty) { conditions.push(`p.difficulty = $${idx++}`); params.push(difficulty); }
  if (category)   { conditions.push(`p.category = $${idx++}`);   params.push(category); }
  if (tag)        { conditions.push(`$${idx++} = ANY(p.tags)`);  params.push(tag); }
  if (company)    { conditions.push(`$${idx++} = ANY(p.companies)`); params.push(company); }
  if (search)     { conditions.push(`p.title ILIKE $${idx++}`);  params.push(`%${search}%`); }

  const where = conditions.length ? 'AND ' + conditions.join(' AND ') : '';

  try {
    const result = await query(
      `SELECT p.id, p.title, p.slug, p.difficulty, p.category, p.tags, p.companies,
              p.acceptance_rate, p.is_premium,
              COALESCE(upp.status, 'unsolved') AS status,
              upp.is_bookmarked
       FROM dsa_problems p
       LEFT JOIN user_problem_progress upp ON upp.problem_id = p.id AND upp.user_id = $1
       WHERE 1=1 ${where}
       ORDER BY p.id
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(*) FROM dsa_problems p WHERE 1=1 ${where}`,
      params.slice(1)
    );

    res.json({
      problems: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch problems.' });
  }
});

// GET /api/dsa/problems/:slug — single problem
router.get('/problems/:slug', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, COALESCE(upp.status, 'unsolved') AS user_status, upp.is_bookmarked
       FROM dsa_problems p
       LEFT JOIN user_problem_progress upp ON upp.problem_id = p.id AND upp.user_id = $1
       WHERE p.slug = $2`,
      [req.user.id, req.params.slug]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Problem not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch problem.' });
  }
});

// POST /api/dsa/problems/:id/submit
router.post('/problems/:id/submit', authenticate, async (req, res) => {
  const { code, language, status, runtime_ms, memory_kb } = req.body;
  const problem_id = parseInt(req.params.id);

  try {
    // Save submission
    const sub = await query(
      `INSERT INTO dsa_submissions (user_id, problem_id, code, language, status, runtime_ms, memory_kb)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.user.id, problem_id, code, language || 'javascript', status, runtime_ms, memory_kb]
    );

    // Update progress
    if (status === 'Accepted') {
      await query(
        `INSERT INTO user_problem_progress (user_id, problem_id, status, solved_at, attempts)
         VALUES ($1, $2, 'solved', NOW(), 1)
         ON CONFLICT (user_id, problem_id)
         DO UPDATE SET status = 'solved', solved_at = NOW(), attempts = user_problem_progress.attempts + 1`,
        [req.user.id, problem_id]
      );

      // Update stats
      const prob = await query('SELECT difficulty FROM dsa_problems WHERE id = $1', [problem_id]);
      if (prob.rows.length) {
        const diff = prob.rows[0].difficulty.toLowerCase();
        await query(
          `INSERT INTO user_stats (user_id, total_problems_solved, ${diff}_solved)
           VALUES ($1, 1, 1)
           ON CONFLICT (user_id) DO UPDATE
           SET total_problems_solved = user_stats.total_problems_solved + 1,
               ${diff}_solved = user_stats.${diff}_solved + 1`,
          [req.user.id]
        );
      }
    } else {
      await query(
        `INSERT INTO user_problem_progress (user_id, problem_id, status, attempts)
         VALUES ($1, $2, 'attempted', 1)
         ON CONFLICT (user_id, problem_id)
         DO UPDATE SET status = CASE WHEN user_problem_progress.status = 'solved' THEN 'solved' ELSE 'attempted' END,
                       attempts = user_problem_progress.attempts + 1`,
        [req.user.id, problem_id]
      );
    }

    res.json({ submission: sub.rows[0], message: status === 'Accepted' ? '✅ Accepted!' : `❌ ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed.' });
  }
});

// GET /api/dsa/categories
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      'SELECT category, COUNT(*) as count FROM dsa_problems GROUP BY category ORDER BY count DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

module.exports = router;
