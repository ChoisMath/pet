import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import AuthScreen from './components/auth/AuthScreen';
import GameScreen from './components/game/GameScreen';
import ControlPanel from './components/game/ControlPanel';
import Notifications from './components/game/Notifications';
import './App.css';

// 게임 컨테이너 (인증 후 표시)
const GameContainer = () => {
  return (
    <GameProvider>
      <div className="app">
        <main className="game-area">
          <GameScreen />
        </main>
        <footer className="control-area">
          <ControlPanel />
        </footer>
        <Notifications />
      </div>
    </GameProvider>
  );
};

// 메인 앱 (인증 분기 처리)
const AppContent = () => {
  const { isLoggedIn, loading, logout, user } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  // 게스트 모드 확인
  useEffect(() => {
    const guestMode = localStorage.getItem('tamagotchi_guest');
    if (guestMode === 'true') {
      setIsGuest(true);
    }
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <span className="loading-emoji">🐾</span>
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 로그인 또는 게스트 모드
  if (isLoggedIn || isGuest) {
    return (
      <div className="app-wrapper">
        {/* 사용자 정보 헤더 (옵션) */}
        {(isLoggedIn || isGuest) && (
          <div className="user-header">
            <span className="user-info">
              {isGuest ? '🎮 게스트' : `👤 ${user?.username}`}
            </span>
            <button 
              className="logout-btn"
              onClick={() => {
                if (isGuest) {
                  localStorage.removeItem('tamagotchi_guest');
                  setIsGuest(false);
                } else {
                  logout();
                }
                window.location.reload();
              }}
            >
              로그아웃
            </button>
          </div>
        )}
        <GameContainer />
      </div>
    );
  }

  // 로그인 화면
  return <AuthScreen />;
};

// 앱 루트
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
