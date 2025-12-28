import React from 'react';
import { getColorPalette } from '../../utils/petColors';
import './PetSvg.css';

const CatSvg = ({ state = 'idle', mood = 'happy', size = 120, colorId = 'gray' }) => {
  const colors = getColorPalette('cat', colorId);

  const getEyeStyle = () => {
    if (state === 'sleep') return 'sleeping';
    if (mood === 'sad') return 'sad';
    if (mood === 'sick') return 'sick';
    return 'happy';
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`pet-svg cat-svg state-${state}`}
    >
      {/* 꼬리 */}
      <g className="tail">
        <path 
          d="M78 70 Q 95 60, 92 40 Q 88 35, 82 50 Q 80 60, 75 65" 
          fill="none"
          stroke={colors.dark}
          strokeWidth="8"
          strokeLinecap="round"
          className={state === 'idle' ? 'swaying' : ''}
        />
      </g>

      {/* 몸통 */}
      <ellipse cx="50" cy="68" rx="25" ry="20" fill={colors.main} />
      
      {/* 배 */}
      <ellipse cx="50" cy="72" rx="15" ry="12" fill={colors.belly} />
      
      {/* 앞다리 */}
      <g className={`legs ${state === 'walking' ? 'walking' : ''}`}>
        <rect x="32" y="80" width="8" height="16" rx="4" fill={colors.dark} className="leg-left" />
        <rect x="60" y="80" width="8" height="16" rx="4" fill={colors.dark} className="leg-right" />
      </g>

      {/* 머리 */}
      <circle cx="50" cy="40" r="24" fill={colors.main} />
      
      {/* 뾰족한 귀 */}
      <polygon points="25,30 20,5 38,22" fill={colors.main} className="ear-left" />
      <polygon points="75,30 80,5 62,22" fill={colors.main} className="ear-right" />
      
      {/* 귀 안쪽 */}
      <polygon points="27,27 24,12 35,23" fill={colors.accent} />
      <polygon points="73,27 76,12 65,23" fill={colors.accent} />

      {/* 얼굴 */}
      <g className="face">
        {/* 볼 터치 */}
        <ellipse cx="30" cy="48" rx="7" ry="4" fill={colors.accent} opacity="0.5" />
        <ellipse cx="70" cy="48" rx="7" ry="4" fill={colors.accent} opacity="0.5" />
        
        {/* 눈 */}
        <g className={`eyes ${getEyeStyle()}`}>
          {state === 'sleep' ? (
            <>
              <path d="M36 38 Q 40 42, 44 38" stroke="#333" strokeWidth="2" fill="none" />
              <path d="M56 38 Q 60 42, 64 38" stroke="#333" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              {/* 고양이 눈 - 세로 동공 */}
              <ellipse cx="40" cy="38" rx="6" ry="7" fill={colors.eye || '#90CAF9'} />
              <ellipse cx="60" cy="38" rx="6" ry="7" fill={colors.eye || '#90CAF9'} />
              <ellipse cx="40" cy="38" rx="2" ry="5" fill="#333" />
              <ellipse cx="60" cy="38" rx="2" ry="5" fill="#333" />
              <circle cx="42" cy="36" r="2" fill="#FFF" />
              <circle cx="62" cy="36" r="2" fill="#FFF" />
            </>
          )}
        </g>

        {/* 코 */}
        <polygon points="50,46 47,50 53,50" fill={colors.accent} />

        {/* 수염 */}
        <g className="whiskers">
          <line x1="25" y1="48" x2="38" y2="50" stroke="#666" strokeWidth="1" />
          <line x1="25" y1="52" x2="38" y2="52" stroke="#666" strokeWidth="1" />
          <line x1="25" y1="56" x2="38" y2="54" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="48" x2="62" y2="50" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="52" x2="62" y2="52" stroke="#666" strokeWidth="1" />
          <line x1="75" y1="56" x2="62" y2="54" stroke="#666" strokeWidth="1" />
        </g>

        {/* 입 */}
        <g className="mouth">
          {state === 'eating' ? (
            <ellipse cx="50" cy="56" rx="5" ry="4" fill="#FF6B6B" />
          ) : mood === 'happy' ? (
            <>
              <path d="M46 54 Q 50 58, 50 54" stroke="#333" strokeWidth="1.5" fill="none" />
              <path d="M50 54 Q 50 58, 54 54" stroke="#333" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <path d="M47 55 L 53 55" stroke="#333" strokeWidth="1.5" />
          )}
        </g>
      </g>

      {/* 잠잘 때 ZZZ */}
      {state === 'sleep' && (
        <g className="zzz">
          <text x="72" y="18" fontSize="10" fill="#7C4DFF" className="z1">Z</text>
          <text x="80" y="10" fontSize="8" fill="#7C4DFF" className="z2">z</text>
          <text x="86" y="4" fontSize="6" fill="#7C4DFF" className="z3">z</text>
        </g>
      )}

      {/* 놀이 중일 때 털실 */}
      {state === 'playing' && (
        <g className="yarn animate-bounce">
          <circle cx="20" cy="85" r="8" fill="#FF6B6B" />
          <path d="M20 85 Q 15 80, 25 78 Q 18 75, 22 82" stroke="#FF8A8A" strokeWidth="1" fill="none" />
        </g>
      )}

      {/* 아플 때 표시 */}
      {mood === 'sick' && (
        <g className="sick-indicator">
          <circle cx="75" cy="22" r="8" fill="#4CAF50" opacity="0.8" />
          <text x="75" y="25" fontSize="10" textAnchor="middle" fill="#FFF">🤢</text>
        </g>
      )}
    </svg>
  );
};

export default CatSvg;
