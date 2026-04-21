const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Lazy-load OpenAI to avoid crash if key not set
const getOpenAI = () => {
  const OpenAI = require('openai');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// POST /api/mock-interview/start
router.post('/start', authenticate, async (req, res) => {
  const { interview_type = 'technical', topic, difficulty = 'Medium' } = req.body;

  try {
    const result = await query(
      `INSERT INTO mock_interviews (user_id, interview_type, topic, difficulty, status, started_at)
       VALUES ($1, $2, $3, $4, 'in-progress', NOW())
       RETURNING *`,
      [req.user.id, interview_type, topic, difficulty]
    );

    res.status(201).json({ interview: result.rows[0], message: 'Interview started!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start interview.' });
  }
});

// POST /api/mock-interview/:id/message — AI chat
router.post('/:id/message', authenticate, async (req, res) => {
  const { message, conversation_history = [] } = req.body;

  try {
    const interviewResult = await query(
      'SELECT * FROM mock_interviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!interviewResult.rows.length) {
      return res.status(404).json({ error: 'Interview not found.' });
    }

    const interview = interviewResult.rows[0];

    const systemPrompt = `You are an expert ${interview.interview_type} interviewer at a top tech company.
You are conducting a ${interview.difficulty} level interview${interview.topic ? ` focused on ${interview.topic}` : ''}.
Be professional, ask follow-up questions, provide hints when the candidate is stuck.
After each response, evaluate quality internally but only give the full evaluation at the end when asked.
Keep responses concise and focused. Ask one question at a time.`;

    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversation_history,
        { role: 'user', content: message },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Save transcript
    const updatedTranscript = [
      ...(interview.transcript || []),
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() },
    ];

    await query(
      'UPDATE mock_interviews SET transcript = $1 WHERE id = $2',
      [JSON.stringify(updatedTranscript), req.params.id]
    );

    res.json({ response: aiResponse, interview_id: req.params.id });
  } catch (err) {
    console.error('AI interview error:', err);
    if (err.status === 429) return res.status(429).json({ error: 'AI rate limited. Try again shortly.' });
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

// POST /api/mock-interview/:id/complete — Get AI feedback
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const interviewResult = await query(
      'SELECT * FROM mock_interviews WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (!interviewResult.rows.length) return res.status(404).json({ error: 'Interview not found.' });

    const interview = interviewResult.rows[0];
    const transcript = interview.transcript || [];

    let ai_feedback = {
      overall_score: 7.5,
      strengths: ['Good communication', 'Logical thinking'],
      improvements: ['Work on time complexity analysis', 'Practice edge cases'],
      detailed_feedback: 'Good overall performance. Keep practicing!',
    };

    if (process.env.OPENAI_API_KEY && transcript.length > 0) {
      const openai = getOpenAI();
      const feedbackCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are evaluating a ${interview.interview_type} interview. 
            Provide structured feedback as JSON with keys: overall_score (0-10), strengths (array), improvements (array), detailed_feedback (string).
            Only respond with valid JSON.`,
          },
          {
            role: 'user',
            content: `Evaluate this interview transcript:\n${JSON.stringify(transcript.slice(-20))}`,
          },
        ],
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      try {
        ai_feedback = JSON.parse(feedbackCompletion.choices[0].message.content);
      } catch (_) {}
    }

    await query(
      `UPDATE mock_interviews
       SET status = 'completed', completed_at = NOW(), ai_feedback = $1, score = $2
       WHERE id = $3`,
      [JSON.stringify(ai_feedback), ai_feedback.overall_score, req.params.id]
    );

    // Update stats
    await query(
      `INSERT INTO user_stats (user_id, total_interviews, avg_interview_score)
       VALUES ($1, 1, $2)
       ON CONFLICT (user_id) DO UPDATE
       SET total_interviews = user_stats.total_interviews + 1,
           avg_interview_score = (user_stats.avg_interview_score * user_stats.total_interviews + $2) / (user_stats.total_interviews + 1)`,
      [req.user.id, ai_feedback.overall_score]
    );

    res.json({ feedback: ai_feedback, message: 'Interview completed!' });
  } catch (err) {
    console.error('Complete interview error:', err);
    res.status(500).json({ error: 'Failed to complete interview.' });
  }
});

// GET /api/mock-interview/history
router.get('/history', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, interview_type, topic, difficulty, status, score, duration_mins, completed_at, created_at
       FROM mock_interviews WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch interview history.' });
  }
});

module.exports = router;
