-- ============================================================
-- Interview Preparation Platform — PostgreSQL Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fast text search

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      VARCHAR(50)  UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  full_name     VARCHAR(100),
  avatar_url    TEXT,
  bio           TEXT,
  github_url    TEXT,
  linkedin_url  TEXT,
  target_role   VARCHAR(100),
  experience_level VARCHAR(20) DEFAULT 'beginner' CHECK (experience_level IN ('beginner','intermediate','advanced')),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DSA PROBLEMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dsa_problems (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  slug          VARCHAR(200) UNIQUE NOT NULL,
  description   TEXT NOT NULL,
  difficulty    VARCHAR(10) NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
  category      VARCHAR(50) NOT NULL,  -- Arrays, Trees, DP, Graphs, etc.
  tags          TEXT[],
  constraints   TEXT,
  examples      JSONB,       -- [{input, output, explanation}]
  hints         TEXT[],
  companies     TEXT[],      -- Companies that asked this
  acceptance_rate DECIMAL(5,2),
  is_premium    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DSA SUBMISSIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dsa_submissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  problem_id    INTEGER NOT NULL REFERENCES dsa_problems(id),
  code          TEXT NOT NULL,
  language      VARCHAR(30) NOT NULL DEFAULT 'javascript',
  status        VARCHAR(20) NOT NULL CHECK (status IN ('Accepted','Wrong Answer','TLE','MLE','Runtime Error','Compile Error')),
  runtime_ms    INTEGER,
  memory_kb     INTEGER,
  notes         TEXT,
  submitted_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- USER PROBLEM PROGRESS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_problem_progress (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  problem_id    INTEGER REFERENCES dsa_problems(id),
  status        VARCHAR(20) DEFAULT 'unsolved' CHECK (status IN ('unsolved','attempted','solved')),
  is_bookmarked BOOLEAN DEFAULT FALSE,
  solved_at     TIMESTAMPTZ,
  attempts      INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, problem_id)
);

-- ─────────────────────────────────────────
-- MOCK INTERVIEWS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mock_interviews (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interview_type VARCHAR(30) NOT NULL CHECK (interview_type IN ('technical','behavioral','system-design','hr')),
  topic         VARCHAR(100),
  difficulty    VARCHAR(10) DEFAULT 'Medium',
  duration_mins INTEGER DEFAULT 45,
  status        VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled','in-progress','completed','cancelled')),
  ai_feedback   JSONB,       -- {overall_score, strengths[], improvements[], detailed_feedback}
  transcript    JSONB,       -- [{role, content, timestamp}]
  score         DECIMAL(4,1),
  scheduled_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) UNIQUE NOT NULL,
  logo_url      TEXT,
  industry      VARCHAR(100),
  size          VARCHAR(50),  -- startup, mid-size, enterprise
  description   TEXT,
  glassdoor_url TEXT,
  careers_url   TEXT,
  interview_process TEXT,
  difficulty    VARCHAR(10) DEFAULT 'Medium',
  tags          TEXT[]
);

-- ─────────────────────────────────────────
-- COMPANY INTERVIEW QUESTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_questions (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL REFERENCES companies(id),
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) CHECK (question_type IN ('coding','behavioral','system-design','hr')),
  difficulty    VARCHAR(10),
  frequency     INTEGER DEFAULT 1,  -- how often reported
  reported_by   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- RESUMES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(100) NOT NULL DEFAULT 'My Resume',
  template      VARCHAR(30) DEFAULT 'modern',
  content       JSONB NOT NULL,  -- Full resume JSON structure
  ats_score     INTEGER,
  ai_suggestions JSONB,
  is_primary    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- USER STREAKS & STATS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_stats (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_problems_solved INTEGER DEFAULT 0,
  easy_solved           INTEGER DEFAULT 0,
  medium_solved         INTEGER DEFAULT 0,
  hard_solved           INTEGER DEFAULT 0,
  total_interviews      INTEGER DEFAULT 0,
  avg_interview_score   DECIMAL(4,1),
  current_streak        INTEGER DEFAULT 0,
  longest_streak        INTEGER DEFAULT 0,
  last_active_date      DATE,
  total_time_mins       INTEGER DEFAULT 0,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DAILY ACTIVITY LOG (for streaks)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_activity (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  interviews_done INTEGER DEFAULT 0,
  time_spent_mins INTEGER DEFAULT 0,
  PRIMARY KEY (user_id, activity_date)
);

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dsa_problems_difficulty ON dsa_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_category   ON dsa_problems(category);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_companies  ON dsa_problems USING GIN(companies);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_tags       ON dsa_problems USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_submissions_user        ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem     ON dsa_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user    ON mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email             ON users(email);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user     ON daily_activity(user_id, activity_date DESC);

-- ─────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON resumes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- SEED: Sample companies
-- ─────────────────────────────────────────
INSERT INTO companies (name, industry, size, difficulty, tags, description) VALUES
  ('Google',    'Technology', 'enterprise', 'Hard',   ARRAY['FAANG','Top Tier'], 'Search, Cloud, AI company'),
  ('Amazon',    'Technology', 'enterprise', 'Hard',   ARRAY['FAANG','Top Tier'], 'E-commerce, AWS, Logistics'),
  ('Microsoft', 'Technology', 'enterprise', 'Medium', ARRAY['FAANG','Top Tier'], 'Software, Cloud, Xbox'),
  ('Meta',      'Technology', 'enterprise', 'Hard',   ARRAY['FAANG','Social'],   'Social media, VR, AI'),
  ('Netflix',   'Technology', 'enterprise', 'Hard',   ARRAY['FAANG','Streaming'],'Streaming, Content'),
  ('Flipkart',  'E-commerce', 'enterprise', 'Medium', ARRAY['India','Top Tier'], 'Indian e-commerce giant'),
  ('Razorpay',  'Fintech',    'mid-size',   'Medium', ARRAY['India','Fintech'],  'Payments infrastructure'),
  ('Swiggy',    'Foodtech',   'enterprise', 'Medium', ARRAY['India','Startup'],  'Food delivery platform'),
  ('Zerodha',   'Fintech',    'mid-size',   'Medium', ARRAY['India','Fintech'],  'Discount brokerage firm'),
  ('Atlassian', 'SaaS',       'enterprise', 'Medium', ARRAY['Product','SaaS'],   'Jira, Confluence, Trello')
ON CONFLICT (name) DO NOTHING;

-- SEED: Sample DSA problems
INSERT INTO dsa_problems (title, slug, description, difficulty, category, tags, companies, acceptance_rate) VALUES
  ('Two Sum', 'two-sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'Easy', 'Arrays', ARRAY['hash-map','array'], ARRAY['Google','Amazon','Meta'], 49.2),
  ('Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'Given a string s, find the length of the longest substring without repeating characters.', 'Medium', 'Sliding Window', ARRAY['string','sliding-window','hash-map'], ARRAY['Amazon','Microsoft','Google'], 33.8),
  ('Merge K Sorted Lists', 'merge-k-sorted-lists', 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.', 'Hard', 'Linked Lists', ARRAY['linked-list','heap','divide-and-conquer'], ARRAY['Amazon','Google','Uber'], 49.0),
  ('Binary Tree Level Order Traversal', 'binary-tree-level-order-traversal', 'Given the root of a binary tree, return the level order traversal of its nodes values.', 'Medium', 'Trees', ARRAY['bfs','tree','queue'], ARRAY['Microsoft','Facebook','Bloomberg'], 65.1),
  ('Coin Change', 'coin-change', 'You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed.', 'Medium', 'Dynamic Programming', ARRAY['dp','array','bfs'], ARRAY['Google','Amazon','Airbnb'], 41.5)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
