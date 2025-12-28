import React, { useState, useRef, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import DogSvg from './DogSvg';
import CatSvg from './CatSvg';
import HamsterSvg from './HamsterSvg';
import { WalkingActivity, RibbonActivity, WheelActivity } from '../activities/SpecialActivities';
import './Pet.css';

const Pet = ({ 
  pet, 
  isSelected = false, 
  onClick,
  size = 120 
}) => {
  const { actions, getClickCoins, getRecallCost } = useGame();
  const [coinPopups, setCoinPopups] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // 모바일 롱프레스 핸들러 (모든 Hook은 조건부 return 전에 정의)
  const handleTouchStart = useCallback(() => {
    // 롱프레스 초기화
    isLongPress.current = false;
    
    // 500ms 후 툴팁 표시
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setIsHovered(true);
      // 진동 피드백 (지원되는 기기에서)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  const handleTouchEnd = useCallback((e) => {
    // 타이머 클리어
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // 툴팁 숨김
    setIsHovered(false);
    
    // 롱프레스 완료 후에는 기본 클릭 방지
    if (isLongPress.current) {
      e.preventDefault();
      isLongPress.current = false;
    }
  }, []);

  const handleTouchMove = useCallback(() => {
    // 움직이면 롱프레스 취소
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsHovered(false);
  }, []);

  if (!pet) return null;

  // 도망간 펫 렌더링
  if (pet.hasRunAway) {
    const recallCost = getRecallCost(pet.id);
    
    return (
      <div className="pet-container runaway">
        <div className="runaway-overlay">
          <div className="runaway-pet-sprite">
            {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐹'}
          </div>
          <div className="runaway-info">
            <p className="runaway-name">{pet.name}</p>
            <p className="runaway-text">😢 도망갔어요...</p>
            <button 
              className="recall-btn"
              onClick={() => actions.recallPet(pet.id)}
            >
              🔮 다시 부르기 ({recallCost}🪙)
            </button>
          </div>
        </div>
        <div className="name-tag runaway-tag">
          {pet.name}
          <span className="level-badge">Lv.{pet.growth?.level || 1}</span>
        </div>
      </div>
    );
  }

  const handleClick = (e) => {
    e.stopPropagation();
    
    // 롱프레스 중이었으면 클릭 무시
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    
    // 펫 선택
    onClick?.();
    
    // 수면 상태에서는 코인 획득 불가
    if (pet.state === 'sleep') {
      return;
    }
    
    // 코인 획득
    actions.clickPet(pet.id);
    
    // 코인 팝업 표시
    const coins = getClickCoins();
    const newPopup = {
      id: Date.now(),
      amount: coins,
      x: Math.random() * 40 - 20,
      y: 0
    };
    
    setCoinPopups(prev => [...prev, newPopup]);
    
    // 팝업 제거
    setTimeout(() => {
      setCoinPopups(prev => prev.filter(p => p.id !== newPopup.id));
    }, 1000);
  };

  const renderPetSvg = () => {
    const props = {
      state: pet.state,
      mood: pet.mood,
      size: size,
      colorId: pet.colorId
    };

    switch (pet.type) {
      case 'dog':
        return <DogSvg {...props} />;
      case 'cat':
        return <CatSvg {...props} />;
      case 'hamster':
        return <HamsterSvg {...props} />;
      default:
        return <DogSvg {...props} />;
    }
  };

  // 특수 활동 오버레이 렌더링
  const renderActivityOverlay = () => {
    if (!pet.specialActivity) return null;
    
    switch (pet.specialActivity) {
      case 'walking':
        return <WalkingActivity progress={pet.activityProgress} />;
      case 'ribbon':
        return <RibbonActivity progress={pet.activityProgress} />;
      case 'wheel':
        return <WheelActivity progress={pet.activityProgress} />;
      default:
        return null;
    }
  };

  // 상태 게이지 렌더링
  const renderStatTooltip = () => {
    if (!isHovered || !pet.stats) return null;

    const stats = [
      { name: '배고픔', value: pet.stats.hunger, icon: '🍖', color: '#FF6B6B' },
      { name: '행복', value: pet.stats.happiness, icon: '💖', color: '#FF69B4' },
      { name: '건강', value: pet.stats.health, icon: '💚', color: '#4CAF50' },
      { name: '에너지', value: pet.stats.energy, icon: '⚡', color: '#FFD93D' },
      { name: '청결', value: pet.stats.cleanliness, icon: '✨', color: '#64B5F6' },
    ];

    return (
      <div className="stat-tooltip">
        <div className="stat-tooltip-header">
          <span>{pet.name}</span>
          <span className="stat-tooltip-level">Lv.{pet.growth?.level || 1}</span>
        </div>
        {stats.map(stat => (
          <div key={stat.name} className="stat-tooltip-row">
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-bar-container">
              <div 
                className="stat-bar-fill"
                style={{ 
                  width: `${stat.value}%`,
                  backgroundColor: stat.color
                }}
              />
            </div>
            <span className="stat-value">{Math.floor(stat.value)}</span>
          </div>
        ))}
        {pet.state === 'sleep' && (
          <div className="stat-tooltip-sleep">😴 수면 중 - 클릭 불가</div>
        )}
      </div>
    );
  };

  return (
    <>
      <div 
        className={`pet-container ${isSelected ? 'selected' : ''} ${pet.state === 'sleep' ? 'sleeping' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd}
        style={{
          transform: `scaleX(${pet.direction})`,
        }}
      >
        {/* 상태 툴팁 */}
        {renderStatTooltip()}

        {/* 코인 팝업 */}
        {coinPopups.map(popup => (
          <div 
            key={popup.id}
            className="coin-popup"
            style={{ left: `calc(50% + ${popup.x}px)` }}
          >
            +{popup.amount} 🪙
          </div>
        ))}

        {/* 선택 표시 */}
        {isSelected && (
          <div className="selection-indicator">
            <span className="arrow">▼</span>
          </div>
        )}

        {/* 말풍선 (상태에 따라) */}
        {pet.mood !== 'happy' && pet.state !== 'sleep' && (
          <div className="speech-bubble">
            {pet.mood === 'sad' && '😢'}
            {pet.mood === 'sick' && '🤒'}
            {pet.mood === 'tired' && '😴'}
            {pet.stats?.hunger < 30 && '🍖?'}
          </div>
        )}

        {/* 펫 SVG */}
        <div className={`pet-sprite ${pet.state === 'sleep' ? 'sleeping-sprite' : ''}`}>
          {renderPetSvg()}
          
          {/* 잠자는 효과 */}
          {pet.state === 'sleep' && (
            <div className="sleep-overlay">
              <div className="zzz-container">
                <span className="zzz z1">Z</span>
                <span className="zzz z2">z</span>
                <span className="zzz z3">z</span>
              </div>
              <div className="sleep-cap">😴</div>
            </div>
          )}
        </div>

        {/* 이름 태그 */}
        <div className="name-tag">
          {pet.name}
          <span className="level-badge">Lv.{pet.growth?.level || 1}</span>
        </div>

        {/* 똥 표시 */}
        {pet.poopCount > 0 && (
          <div className="poop-indicator">
            {Array.from({ length: Math.min(pet.poopCount, 5) }).map((_, i) => (
              <span key={i} className="poop" style={{ 
                left: `${20 + i * 15}px`,
                animationDelay: `${i * 0.1}s`
              }}>💩</span>
            ))}
          </div>
        )}

        {/* 먹는 중 이펙트 */}
        {pet.state === 'eating' && (
          <div className="eating-effect">
            <span>🍖</span>
            <span>✨</span>
          </div>
        )}

        {/* 노는 중 이펙트 (특수 활동 아닐 때) */}
        {pet.state === 'playing' && !pet.specialActivity && (
          <div className="playing-effect">
            <span>⭐</span>
            <span>❤️</span>
            <span>✨</span>
          </div>
        )}
      </div>

      {/* 특수 활동 오버레이 (전체 화면) */}
      {renderActivityOverlay()}
    </>
  );
};

export default Pet;
