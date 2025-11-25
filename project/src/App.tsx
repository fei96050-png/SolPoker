import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './contexts/Web3Context';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Lobby } from './components/Lobby';
import { GameRoom } from './components/GameRoom';
import { Leaderboard } from './components/Leaderboard';
import { Profile } from './components/Profile';
import './i18n/config';

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Lobby />} />
              <Route path="/room/:roomId" element={<RoomWrapper />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
}

function RoomWrapper() {
  const params = new URLSearchParams(window.location.search);
  const roomId = window.location.pathname.split('/').pop() || '';
  return <GameRoom roomId={roomId} />;
}

export default App;
