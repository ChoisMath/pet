import React from 'react';
import { getColorPalette } from '../../utils/petColors';
import './PetSvg.css';

const HamsterSvg = ({ state = 'idle', mood = 'happy', visualMode = 'normal', size = 120, colorId = 'orange' }) => {
  const colors = getColorPalette('hamster', colorId);

  const getEyeStyle = () => {
    if (state === 'sleep' || visualMode === 'sleep') return 'sleeping';
    if (visualMode === 'critical' || visualMode === "starving") return 'dead';
    if (visualMode === 'fever') return 'tired';
    if (visualMode === 'tired' || visualMode === 'collapsed') return 'tired';
    if (visualMode === 'rebellious') return 'angry';
    if (visualMode === 'sulky') return 'sad';

    if (mood === 'sad') return 'sad';
    if (mood === 'sick') return 'sick';
    return 'happy';
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`pet-svg hamster-svg state-${state} mode-${visualMode}`}
    >
      {/* 몸통 - 동글동글 */}
      <ellipse cx="50" cy="60" rx="30" ry="28" fill={colors.main} />
      
      {/* 배 */}
      <ellipse cx="50" cy="65" rx="20" ry="18" fill={colors.belly} />
      
      {/* 작은 다리 */}
      <g className={`legs ${state === 'walking' ? 'walking' : ''}`}>
        {visualMode === 'collapsed' ? (
          <>
             {/* 앉은 다리 (앞으로 뻗음) */}
             <ellipse cx="28" cy="88" rx="7" ry="4" fill={colors.dark} />
             <ellipse cx="72" cy="88" rx="7" ry="4" fill={colors.dark} />
          </>
        ) : (
          <>
             <ellipse cx="32" cy="85" rx="6" ry="4" fill={colors.dark} className="leg-left" />
             <ellipse cx="68" cy="85" rx="6" ry="4" fill={colors.dark} className="leg-right" />
          </>
        )}
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
        <ellipse cx="30" cy="45" rx="5" ry="3" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.7" : "0.7"} />
        <ellipse cx="70" cy="45" rx="5" ry="3" fill={visualMode === "fever" ? "#FF0000" : colors.accent} opacity={visualMode === "fever" ? "0.7" : "0.7"} />
        
        {/* 눈 - 작고 반짝반짝 */}
        <g className="eyes">
          {getEyeStyle() === 'sleeping' ? (
            <>
              <path d="M40 36 Q 43 39, 46 36" stroke="#333" strokeWidth="2" fill="none" />
              <path d="M54 36 Q 57 39, 60 36" stroke="#333" strokeWidth="2" fill="none" />
            </>
          ) : getEyeStyle() === 'dead' ? (
            <>
              <path d="M40 34 L46 38 M46 34 L40 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
              <path d="M54 34 L60 38 M60 34 L54 38" stroke="#333" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : getEyeStyle() === 'tired' ? (
            <>
              <path d="M40 34 L43 36 L40 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M46 34 L43 36 L46 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M54 34 L57 36 L54 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M60 34 L57 36 L60 38" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : getEyeStyle() === 'angry' ? (
             <>
               <path d="M37 32 L 46 35" stroke="#333" strokeWidth="2" />
               <path d="M63 32 L 54 35" stroke="#333" strokeWidth="2" />
               <circle cx="43" cy="36" r="3" fill="#333" />
               <circle cx="57" cy="36" r="3" fill="#333" />
             </>
          ) : getEyeStyle() === 'sad' ? (
             <>
               <circle cx="43" cy="36" r="3" fill="#333" />
               <circle cx="57" cy="36" r="3" fill="#333" />
               <path d="M35 40 Q 35 45, 38 43" stroke="#4FC3F7" strokeWidth="1.5" fill="none" />
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
        
        {/* 선글라스 (Rebellious) */}
        {visualMode === "rebellious" && (
           <g className="sunglasses">
             <path d="M32 34 Q 42 34, 46 36 Q 42 40, 32 40 Z" fill="#222" />
             <path d="M68 34 Q 58 34, 54 36 Q 58 40, 68 40 Z" fill="#222" />
             <line x1="46" y1="36" x2="54" y2="36" stroke="#222" strokeWidth="2" />
           </g>
        )}

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
          ) : visualMode === "fever" || visualMode === "tired" || visualMode === "collapsed" ? (
             <path d="M45 50 Q 47 48, 50 50 Q 53 52, 55 50" stroke="#333" strokeWidth="1.5" fill="none" />
          ) : visualMode === "rebellious" ? (
             <path d="M47 50 L 53 50" stroke="#333" strokeWidth="1.5" />
          ) : visualMode === "sulky" ? (
             <path d="M47 52 Q 50 49, 53 52" stroke="#333" strokeWidth="1.5" fill="none" />
          ) : (
            <>
              <path d="M47 48 Q 50 52, 53 48" stroke="#333" strokeWidth="1.5" fill="none" />
              {/* 귀여운 앞니 */}
              <rect x="48" y="48" width="2" height="3" rx="1" fill="#FFF" stroke="#DDD" strokeWidth="0.5" />
              <rect x="50" y="48" width="2" height="3" rx="1" fill="#FFF" stroke="#DDD" strokeWidth="0.5" />
            </>
          )}
        </g>
        
        {/* 지침 효과 (땀) */}
        {(visualMode === "tired" || visualMode === "collapsed" || visualMode === "fever") && (
          <path d="M70 30 Q 73 27, 76 30 Q 76 37, 70 35" fill="#4FC3F7" />
        )}
      </g>
      
      {/* 머리 위 수건 (Critical) */}
      {visualMode === "critical" && (
        <rect x="35" y="10" width="30" height="10" rx="2" fill="#FFF" stroke="#DDD" />
      )}
      
      {/* 링겔 (Critical) */}
      {visualMode === "critical" && (
        <g className="iv-drip" transform="translate(5, 15)">
           <rect x="0" y="0" width="8" height="18" rx="2" fill="#E0F7FA" stroke="#4DD0E1" />
           <line x1="4" y1="18" x2="4" y2="50" stroke="#DDD" strokeWidth="1.5" />
           <path d="M4 18 Q 15 30, 25 40" stroke="#E0F7FA" strokeWidth="1.5" fill="none" />
        </g>
      )}

      {/* 💢 아이콘 (Rebellious) */}
      {visualMode === "rebellious" && (
        <path d="M80 15 L 90 20 L 85 30 M 82 17 L 95 17" stroke="#FF5252" strokeWidth="2.5" />
      )}

      {/* 잠잘 때 ZZZ */}
      {(state === 'sleep' || visualMode === 'sleep') && (
        <g className="zzz">
          <text x="70" y="15" fontSize="9" fill="#7C4DFF" className="z1">Z</text>
          <text x="77" y="8" fontSize="7" fill="#7C4DFF" className="z2">z</text>
        </g>
      )}

      {/* 쳇바퀴 놀이 중 */}
      {state === 'playing' && (
        <g className="wheel">
          <circle cx="50" cy="90" r="15" fill="none" stroke="#FFD93D" strokeWidth="3" />
          <circle cx="50" cy="90" r="5" fill="#FFD93D" />
          <g className="animate-spin" style={{ transformOrigin: '50px 90px' }}>
            <line x1="50" y1="75" x2="50" y2="80" stroke="#FFD93D" strokeWidth="2" />
            <line x1="35" y1="90" x2="40" y2="90" stroke="#FFD93D" strokeWidth="2" />
            <line x1="60" y1="90" x2="65" y2="90" stroke="#FFD93D" strokeWidth="2" />
            <line x1="50" y1="100" x2="50" y2="105" stroke="#FFD93D" strokeWidth="2" />
          </g>
        </g>
      )}
    </svg>
  );
};

export default HamsterSvg;
