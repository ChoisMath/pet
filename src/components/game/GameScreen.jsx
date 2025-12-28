import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import Pet from '../pets/Pet';
import './GameScreen.css';

const GameScreen = () => {
  const { state, actions, getSelectedPet } = useGame();
  const [time, setTime] = useState(new Date());

  // 시간 업데이트
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 밤/낮 체크
  const hour = time.getHours();
  const isNight = hour >= 21 || hour < 7;
  const isEvening = hour >= 17 && hour < 21;

  const getBackgroundClass = () => {
    if (isNight) return 'night';
    if (isEvening) return 'evening';
    return 'day';
  };

  const selectedPet = getSelectedPet();

  return (
    <div className={`game-screen ${getBackgroundClass()}`}>
      {/* 배경 장식 */}
      <div className="background-decor">
        {isNight && (
          <>
            <div className="moon">🌙</div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="star"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >✨</div>
            ))}
          </>
        )}
        {!isNight && (
          <>
            <div className="sun">{isEvening ? '🌅' : '☀️'}</div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div 
                key={i} 
                className="cloud"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${10 + i * 5}%`,
                  animationDelay: `${i * 5}s`
                }}
              >☁️</div>
            ))}
          </>
        )}
      </div>

      {/* 바닥 */}
      <div className="ground">
        <div className="grass"></div>
        <div className="floor"></div>
      </div>

      {/* 펫들 */}
      <div className="pets-scroll-wrapper">
        <div className="pets-container">
          {state.pets.length === 0 ? (
            <div className="no-pets-message">
              <span className="emoji">🥚</span>
              <p>아직 펫이 없어요!</p>
              <p>아래에서 새 펫을 입양해보세요 🐾</p>
            </div>
          ) : (
            state.pets.map(pet => (
              <Pet
                key={pet.id}
                pet={pet}
                isSelected={pet.id === state.selectedPetId}
                onClick={() => actions.selectPet(pet.id)}
                size={80}
              />
            ))
          )}
        </div>
        {state.pets.length > 2 && (
          <div className="scroll-hint">← 스와이프하여 펫 보기 →</div>
        )}
      </div>

      {/* 시간 표시 */}
      <div className="time-display">
        <span className="time-icon">{isNight ? '🌙' : isEvening ? '🌅' : '☀️'}</span>
        <span className="time-text">
          {time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="day-text">Day {state.gameTime.day}</span>
      </div>

      {/* 코인 표시 (우측 상단) */}
      <div className="coin-display">
        <span className="coin-icon">🪙</span>
        <span className="coin-amount">{state.coins}</span>
      </div>
    </div>
  );
};

export default GameScreen;
