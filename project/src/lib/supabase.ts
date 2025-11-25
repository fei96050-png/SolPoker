import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Player {
  id: string;
  wallet_address: string;
  username: string;
  avatar_url: string;
  language: 'en' | 'zh';
  total_games: number;
  total_wins: number;
  total_earnings: number;
  created_at: string;
  last_active: string;
}

export interface Room {
  id: string;
  room_name: string;
  creator_address: string;
  buy_in_amount: number;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  contract_address: string | null;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string | null;
  wallet_address: string;
  seat_position: number;
  chip_count: number;
  status: 'active' | 'folded' | 'all_in' | 'eliminated';
  joined_at: string;
  left_at: string | null;
}

export interface GameHistory {
  id: string;
  room_id: string;
  winner_address: string;
  pot_amount: number;
  fee_amount: number;
  players_data: any;
  game_duration: number;
  created_at: string;
}

export interface PlayerStats {
  id: string;
  player_id: string;
  wallet_address: string;
  games_played: number;
  games_won: number;
  total_wagered: number;
  total_winnings: number;
  biggest_pot: number;
  win_rate: number;
  updated_at: string;
}

export async function getOrCreatePlayer(walletAddress: string): Promise<Player | null> {
  const { data: existing, error: fetchError } = await supabase
    .from('players')
    .select('*')
    .eq('wallet_address', walletAddress)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('players')
      .update({ last_active: new Date().toISOString() })
      .eq('id', existing.id);
    return existing;
  }

  const { data: newPlayer, error: createError } = await supabase
    .from('players')
    .insert({
      wallet_address: walletAddress,
      username: `Player ${walletAddress.slice(0, 6)}`,
      language: 'en'
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating player:', createError);
    return null;
  }

  await supabase.from('player_stats').insert({
    player_id: newPlayer.id,
    wallet_address: walletAddress
  });

  return newPlayer;
}

export async function getActiveRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .in('status', ['waiting', 'playing'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data || [];
}

export async function createRoom(roomData: {
  room_name: string;
  creator_address: string;
  buy_in_amount: number;
}): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .insert(roomData)
    .select()
    .single();

  if (error) {
    console.error('Error creating room:', error);
    return null;
  }

  return data;
}

export async function joinRoom(
  roomId: string,
  walletAddress: string,
  seatPosition: number
): Promise<RoomPlayer | null> {
  const player = await getOrCreatePlayer(walletAddress);
  if (!player) return null;

  const { data, error } = await supabase
    .from('room_players')
    .insert({
      room_id: roomId,
      player_id: player.id,
      wallet_address: walletAddress,
      seat_position: seatPosition
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining room:', error);
    return null;
  }

  await supabase.rpc('increment', {
    table_name: 'rooms',
    row_id: roomId,
    column_name: 'current_players'
  });

  return data;
}

export async function getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
  const { data, error } = await supabase
    .from('room_players')
    .select('*')
    .eq('room_id', roomId)
    .is('left_at', null)
    .order('seat_position');

  if (error) {
    console.error('Error fetching room players:', error);
    return [];
  }

  return data || [];
}

export async function updatePlayerStats(
  walletAddress: string,
  updates: Partial<PlayerStats>
): Promise<void> {
  const { error } = await supabase
    .from('player_stats')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('wallet_address', walletAddress);

  if (error) {
    console.error('Error updating player stats:', error);
  }
}

export async function getLeaderboard(limit: number = 10): Promise<PlayerStats[]> {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*')
    .order('total_winnings', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

export async function recordGameResult(gameData: {
  room_id: string;
  winner_address: string;
  pot_amount: number;
  fee_amount: number;
  players_data: any;
  game_duration: number;
}): Promise<void> {
  const { error } = await supabase
    .from('game_history')
    .insert(gameData);

  if (error) {
    console.error('Error recording game result:', error);
  }
}

export function subscribeToRoom(roomId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'room_players',
      filter: `room_id=eq.${roomId}`
    }, callback)
    .subscribe();
}
