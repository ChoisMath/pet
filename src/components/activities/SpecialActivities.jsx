import React from 'react';
import './SpecialActivities.css';

// 강아지 산책 애니메이션
export const WalkingActivity = ({ progress }) => {
  // progress: 0-100
  // 0-30: 집에서 출발
  // 30-50: 건물 지나기
  // 50-70: 산 지나기
  // 70-100: 집으로 돌아오기
  
  const dogPosition = progress;
  
  return (
    <div className="activity-overlay walking-activity">
      <div className="walking-scene">
        {/* 배경 - 움직임 */}
        <div 
          className="walking-bg"
          style={{ transform: `translateX(-${progress * 3}px)` }}
        >
          {/* 집 (시작점) */}
          <div className="scene-item house start-house" style={{ left: '50px' }}>
            <span className="building-emoji">🏠</span>
            <span className="label">우리집</span>
          </div>
          
          {/* 건물들 */}
          <div className="scene-item" style={{ left: '200px' }}>
            <span className="building-emoji">🏢</span>
          </div>
          <div className="scene-item" style={{ left: '280px' }}>
            <span className="building-emoji">🏬</span>
          </div>
          <div className="scene-item" style={{ left: '360px' }}>
            <span className="building-emoji">🏪</span>
          </div>
          
          {/* 산 */}
          <div className="scene-item mountain" style={{ left: '480px' }}>
            <span className="building-emoji">⛰️</span>
          </div>
          <div className="scene-item" style={{ left: '560px' }}>
            <span className="building-emoji">🌲</span>
          </div>
          <div className="scene-item" style={{ left: '620px' }}>
            <span className="building-emoji">🌲</span>
          </div>
          
          {/* 집 (끝점) */}
          <div className="scene-item house end-house" style={{ left: '750px' }}>
            <span className="building-emoji">🏠</span>
            <span className="label">도착!</span>
          </div>
        </div>
        
        {/* 강아지 (고정 위치에서 걷는 애니메이션) */}
        <div className="walking-dog">
          🐕
        </div>
        
        {/* 땅 */}
        <div className="ground-line"></div>
      </div>
      
      {/* 진행 바 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">산책 중... {Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// 고양이 리본(털실) 놀이 애니메이션
export const RibbonActivity = ({ progress }) => {
  // 0-50: 털실 던지기 (풀기)
  // 50-100: 털실 감기
  
  const isUnwinding = progress < 50;
  const yarnSize = isUnwinding 
    ? 60 - (progress * 0.8) // 풀리면서 작아짐
    : 20 + ((progress - 50) * 0.8); // 감으면서 커짐
  
  const yarnX = isUnwinding
    ? 50 + progress * 3 // 오른쪽으로 이동
    : 200 - ((progress - 50) * 3); // 왼쪽으로 돌아옴
  
  // 털실 줄 길이
  const stringLength = isUnwinding
    ? progress * 2
    : 100 - ((progress - 50) * 2);
  
  return (
    <div className="activity-overlay ribbon-activity">
      <div className="ribbon-scene">
        {/* 고양이 (왼쪽에 고정) */}
        <div className="playing-cat">
          <span className={`cat-emoji ${isUnwinding ? 'throwing' : 'pulling'}`}>
            🐱
          </span>
          {!isUnwinding && <span className="cat-paw">🐾</span>}
        </div>
        
        {/* 털실 줄 */}
        <svg className="yarn-string" viewBox="0 0 300 100">
          <path 
            d={`M 50 50 Q ${75 + stringLength/2} ${30 + Math.sin(progress * 0.2) * 20} ${yarnX} 50`}
            stroke="#FF6B6B"
            strokeWidth="3"
            fill="none"
            strokeDasharray={isUnwinding ? "5,5" : "none"}
          />
        </svg>
        
        {/* 털실 뭉치 */}
        <div 
          className={`yarn-ball ${isUnwinding ? 'unwinding' : 'winding'}`}
          style={{ 
            left: `${yarnX}px`,
            width: `${yarnSize}px`,
            height: `${yarnSize}px`
          }}
        >
          <div className="yarn-pattern"></div>
        </div>
        
        {/* 효과 */}
        {isUnwinding && (
          <div className="throw-effect" style={{ left: `${yarnX - 20}px` }}>
            💨
          </div>
        )}
      </div>
      
      {/* 진행 바 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill ribbon-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          {isUnwinding ? '털실 던지기... 🧶' : '털실 감기... 🧵'} {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

// 햄스터 챗바퀴 애니메이션
export const WheelActivity = ({ progress }) => {
  const rotationSpeed = progress * 10; // 바퀴 회전 각도
  
  return (
    <div className="activity-overlay wheel-activity">
      <div className="wheel-scene">
        {/* 챗바퀴 */}
        <div className="hamster-wheel">
          {/* 바퀴 외곽 */}
          <div 
            className="wheel-outer"
            style={{ transform: `rotate(${rotationSpeed}deg)` }}
          >
            <div className="wheel-spoke"></div>
            <div className="wheel-spoke" style={{ transform: 'rotate(45deg)' }}></div>
            <div className="wheel-spoke" style={{ transform: 'rotate(90deg)' }}></div>
            <div className="wheel-spoke" style={{ transform: 'rotate(135deg)' }}></div>
          </div>
          
          {/* 햄스터 (바퀴 안에서 뛰기) */}
          <div className="hamster-in-wheel">
            <span 
              className="hamster-emoji running"
              style={{ 
                animationDuration: `${Math.max(0.1, 0.5 - progress * 0.004)}s`
              }}
            >
              🐹
            </span>
          </div>
          
          {/* 바퀴 스탠드 */}
          <div className="wheel-stand"></div>
        </div>
        
        {/* 속도 효과 */}
        {progress > 30 && (
          <div className="speed-lines">
            {Array.from({ length: Math.floor(progress / 20) }).map((_, i) => (
              <div 
                key={i} 
                className="speed-line"
                style={{ 
                  top: `${30 + i * 15}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        )}
        
        {/* 땀방울 */}
        {progress > 50 && (
          <div className="sweat-drops">
            💦
          </div>
        )}
      </div>
      
      {/* 진행 바 */}
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill wheel-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-text">
          챗바퀴 달리기! 🎡 {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};
