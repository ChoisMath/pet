import React from 'react';
import { getColorPalette } from '../../utils/petColors';
import './PetSvg.css';

const HamsterSvg = ({ state = 'idle', mood = 'happy', size = 120, colorId = 'orange' }) => {
  const colors = getColorPalette('hamster', colorId);

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`pet-svg hamster-svg state-${state}`}
    >
      {/* 몸통 - 동글동글 */}
      <ellipse cx="50" cy="60" rx="30" ry="28" fill={colors.main} />
      
      {/* 배 */}
      <ellipse cx="50" cy="65" rx="20" ry="18" fill={colors.belly} />
      
      {/* 작은 다리 */}
      <g className={`legs ${state === 'walking' ? 'walking' : ''}`}>
        <ellipse cx="32" cy="85" rx="6" ry="4" fill={colors.dark} className="leg-left" />
        <ellipse cx="68" cy="85" rx="6" ry="4" fill={colors.dark} className="leg-right" />
      </g>

      {/* 작은 손 */}
      <ellipse cx="25" cy="60" rx="5" ry="4" fill={colors.dark} />
      <ellipse cx="75" cy="60" rx="5" ry="4" fill={colors.dark} />

      {/* 머리 */}
      <circle cx="50" cy="38" r="22" fill={colors.main} />
      
      {/* 둥근 귀 */}
      <circle cx="30" cy="22" r="10" fill={colors.main} className="ear-left" />
      <circle cx="70" cy="22" r="10" fill={colors.main} className="ear-right" />
      
      {/* 귀 안쪽 */}
      <circle cx="30" cy="22" r="6" fill={colors.accent} />
      <circle cx="70" cy="22" r="6" fill={colors.accent} />

      {/* 볼 주머니 (햄스터 특징!) */}
      <ellipse cx="28" cy="42" rx="10" ry="8" fill={colors.cheek || colors.belly} />
      <ellipse cx="72" cy="42" rx="10" ry="8" fill={colors.cheek || colors.belly} />

      {/* 얼굴 */}
      <g className="face">
        {/* 볼 터치 */}
        <ellipse cx="30" cy="45" rx="5" ry="3" fill={colors.accent} opacity="0.7" />
        <ellipse cx="70" cy="45" rx="5" ry="3" fill={colors.accent} opacity="0.7" />
        
        {/* 눈 - 작고 반짝반짝 */}
        <g className="eyes">
          {state === 'sleep' ? (
            <>
              <path d="M40 36 Q 43 39, 46 36" stroke="#333" strokeWidth="2" fill="none" />
              <path d="M54 36 Q 57 39, 60 36" stroke="#333" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              <circle cx="43" cy="36" r="4" fill="#333" />
              <circle cx="57" cy="36" r="4" fill="#333" />
              <circle cx="44" cy="35" r="1.5" fill="#FFF" />
              <circle cx="58" cy="35" r="1.5" fill="#FFF" />
            </>
          )}
        </g>

        {/* 코 - 작고 귀여운 */}
        <circle cx="50" cy="44" r="3" fill={colors.accent} />

        {/* 입 & 이빨 */}
        <g className="mouth">
          {state === 'eating' ? (
            <>
              <ellipse cx="50" cy="50" rx="4" ry="3" fill="#FF6B6B" />
              {/* 씨앗 먹는 중 */}
              <ellipse cx="50" cy="52" rx="3" ry="2" fill="#8B4513" />
            </>
          ) : (
            <>
              <path d="M47 48 Q 50 52, 53 48" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* 귀여운 앞니 */}
              <rect x="48" y="48" width="2" height="3" rx="1" fill="#FFF" stroke="#DDD" strokeWidth="0.5" />
              <rect x="50" y="48" width="2" height="3" rx="1" fill="#FFF" stroke="#DDD" strokeWidth="0.5" />
            </>
          )}
        </g>
      </g>

      {/* 잠잘 때 ZZZ */}
      {state === 'sleep' && (
        <g className="zzz">
          <text x="70" y="15" fontSize="9" fill="#7C4DFF" className="z1">Z</text>
          <text x="77" y="8" fontSize="7" fill="#7C4DFF" className="z2">z</text>
          <text x="82" y="3" fontSize="5" fill="#7C4DFF" className="z3">z</text>
        </g>
      )}

      {/* 쳇바퀴 놀이 중 */}
      {state === 'playing' && (
        <g className="wheel">
          <circle cx="50" cy="90" r="15" fill="none" stroke="#FFD93D" strokeWidth="3" />
          <circle cx="50" cy="90" r="5" fill="#FFD93D" />
          {/* 회전 바퀴살 */}
          <g className="animate-spin" style={{ transformOrigin: '50px 90px' }}>
            <line x1="50" y1="75" x2="50" y2="80" stroke="#FFD93D" strokeWidth="2" />
            <line x1="35" y1="90" x2="40" y2="90" stroke="#FFD93D" strokeWidth="2" />
            <line x1="60" y1="90" x2="65" y2="90" stroke="#FFD93D" strokeWidth="2" />
            <line x1="50" y1="100" x2="50" y2="105" stroke="#FFD93D" strokeWidth="2" />
          </g>
        </g>
      )}

      {/* 아플 때 */}
      {mood === 'sick' && (
        <g className="sick-indicator">
          <circle cx="72" cy="18" r="7" fill="#4CAF50" opacity="0.8" />
          <text x="72" y="21" fontSize="8" textAnchor="middle" fill="#FFF">🤢</text>
        </g>
      )}
    </svg>
  );
};

export default HamsterSvg;
