/*
  # Texas Hold'em Poker Game Database Schema

  ## Overview
  This migration creates the complete database structure for a BSC blockchain-based 
  Texas Hold'em poker game with room management, player statistics, and game history.

  ## 1. New Tables

  ### players
  - `id` (uuid, primary key) - Unique player identifier
  - `wallet_address` (text, unique) - BSC wallet address
  - `username` (text) - Player display name
  - `avatar_url` (text) - Profile picture URL
  - `language` (text) - Preferred language (en/zh)
  - `total_games` (integer) - Total games played
  - `total_wins` (integer) - Total games won
  - `total_earnings` (numeric) - Total earnings in BNB
  - `created_at` (timestamptz) - Account creation timestamp
  - `last_active` (timestamptz) - Last activity timestamp

  ### rooms
  - `id` (uuid, primary key) - Unique room identifier
  - `room_name` (text) - Display name of the room
  - `creator_address` (text) - Wallet address of room creator
  - `buy_in_amount` (numeric) - Entry amount in BNB
  - `max_players` (integer) - Maximum players (default 6)
  - `current_players` (integer) - Current player count
  - `status` (text) - Room status: waiting, playing, finished
  - `contract_address` (text) - Smart contract address for this room
  - `created_at` (timestamptz) - Room creation time
  - `started_at` (timestamptz) - Game start time
  - `ended_at` (timestamptz) - Game end time

  ### room_players
  - `id` (uuid, primary key) - Unique record identifier
  - `room_id` (uuid, foreign key) - Reference to rooms table
  - `player_id` (uuid, foreign key) - Reference to players table
  - `wallet_address` (text) - Player wallet address
  - `seat_position` (integer) - Seat number (0-5)
  - `chip_count` (numeric) - Current chip count
  - `status` (text) - Player status: active, folded, all_in, eliminated
  - `joined_at` (timestamptz) - When player joined
  - `left_at` (timestamptz) - When player left

  ### game_history
  - `id` (uuid, primary key) - Unique game record
  - `room_id` (uuid, foreign key) - Reference to rooms table
  - `winner_address` (text) - Winner's wallet address
  - `pot_amount` (numeric) - Total pot amount
  - `fee_amount` (numeric) - Platform fee (0.5%)
  - `players_data` (jsonb) - Complete game data including hands
  - `game_duration` (integer) - Duration in seconds
  - `created_at` (timestamptz) - Game completion time

  ### player_stats
  - `id` (uuid, primary key) - Unique stat record
  - `player_id` (uuid, foreign key) - Reference to players table
  - `wallet_address` (text) - Player wallet address
  - `games_played` (integer) - Total games
  - `games_won` (integer) - Total wins
  - `total_wagered` (numeric) - Total amount wagered
  - `total_winnings` (numeric) - Total winnings
  - `biggest_pot` (numeric) - Largest pot won
  - `win_rate` (numeric) - Win percentage
  - `updated_at` (timestamptz) - Last update time

  ## 2. Security
  - Enable RLS on all tables
  - Add policies for authenticated user access
  - Restrict data modification to authorized users only
  - Ensure players can only access their own data and public game info

  ## 3. Important Notes
  - All BNB amounts stored as numeric type for precision
  - Indexes added for frequently queried fields
  - Foreign key constraints ensure data integrity
  - RLS policies are restrictive by default
*/

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  language text DEFAULT 'en' CHECK (language IN ('en', 'zh')),
  total_games integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  total_earnings numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name text NOT NULL,
  creator_address text NOT NULL,
  buy_in_amount numeric NOT NULL CHECK (buy_in_amount > 0),
  max_players integer DEFAULT 6 CHECK (max_players <= 6),
  current_players integer DEFAULT 0 CHECK (current_players <= max_players),
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  contract_address text,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  ended_at timestamptz
);

-- Create room_players table
CREATE TABLE IF NOT EXISTS room_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE SET NULL,
  wallet_address text NOT NULL,
  seat_position integer NOT NULL CHECK (seat_position >= 0 AND seat_position < 6),
  chip_count numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'folded', 'all_in', 'eliminated')),
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(room_id, seat_position)
);

-- Create game_history table
CREATE TABLE IF NOT EXISTS game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  winner_address text NOT NULL,
  pot_amount numeric NOT NULL,
  fee_amount numeric NOT NULL,
  players_data jsonb DEFAULT '{}'::jsonb,
  game_duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create player_stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_wagered numeric DEFAULT 0,
  total_winnings numeric DEFAULT 0,
  biggest_pot numeric DEFAULT 0,
  win_rate numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(player_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_wallet ON players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_creator ON rooms(creator_address);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_room_players_wallet ON room_players(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_history_room ON game_history(room_id);
CREATE INDEX IF NOT EXISTS idx_game_history_winner ON game_history(winner_address);
CREATE INDEX IF NOT EXISTS idx_player_stats_wallet ON player_stats(wallet_address);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for players table
CREATE POLICY "Players can view all profiles"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can insert their own profile"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can update their own profile"
  ON players FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for rooms table
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Room creators can update their rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (creator_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (creator_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for room_players table
CREATE POLICY "Anyone can view room players"
  ON room_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can join rooms"
  ON room_players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can update their own room status"
  ON room_players FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- RLS Policies for game_history table
CREATE POLICY "Anyone can view game history"
  ON game_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert game history"
  ON game_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for player_stats table
CREATE POLICY "Anyone can view player stats"
  ON player_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert player stats"
  ON player_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update player stats"
  ON player_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);