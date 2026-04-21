const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authenticate, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, email, full_name, avatar_url, bio, github_url, linkedin_url, target_role, experience_level, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  const { full_name, bio, github_url, linkedin_url, target_role, experience_level, avatar_url } = req.body;
  try {
    const result = await query(
      `UPDATE users SET
        full_name = COALESCE($1, full_name),
        bio = COALESCE($2, bio),
        github_url = COALESCE($3, github_url),
        linkedin_url = COALESCE($4, linkedin_url),
        target_role = COALESCE($5, target_role),
        experience_level = COALESCE($6, experience_level),
        avatar_url = COALESCE($7, avatar_url)
       WHERE id = $8
       RETURNING id, username, email, full_name, bio, github_url, linkedin_url, target_role, experience_level, avatar_url`,
      [full_name, bio, github_url, linkedin_url, target_role, experience_level, avatar_url, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

router.put('/change-password', authenticate, async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(current_password, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect.' });

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(new_password, salt);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
