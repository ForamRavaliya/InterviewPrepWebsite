const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [stats, recentActivity, recentSubs, recentInterviews] = await Promise.all([
      query('SELECT * FROM user_stats WHERE user_id = $1', [req.user.id]),
      query(
        'SELECT * FROM daily_activity WHERE user_id = $1 ORDER BY activity_date DESC LIMIT 30',
        [req.user.id]
      ),
      query(
        `SELECT ds.id, dp.title, dp.difficulty, ds.status, ds.language, ds.submitted_at
         FROM dsa_submissions ds JOIN dsa_problems dp ON dp.id = ds.problem_id
         WHERE ds.user_id = $1 ORDER BY ds.submitted_at DESC LIMIT 5`,
        [req.user.id]
      ),
      query(
        `SELECT id, interview_type, topic, difficulty, score, status, completed_at
         FROM mock_interviews WHERE user_id = $1 AND status = 'completed'
         ORDER BY completed_at DESC LIMIT 5`,
        [req.user.id]
      ),
    ]);

    res.json({
      stats: stats.rows[0] || {},
      activityHeatmap: recentActivity.rows,
      recentSubmissions: recentSubs.rows,
      recentInterviews: recentInterviews.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard data.' });
  }
});

module.exports = router;
