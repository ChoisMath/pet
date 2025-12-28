import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import StatBar from '../ui/StatBar';
import ActionButton from '../ui/ActionButton';
import SettingsModal from '../settings/SettingsModal';
import './ControlPanel.css';

const ControlPanel = () => {
  const { 
    state, actions, getSelectedPet, getClickCoins, 
    getUpgradeCost, getFoodPrice, getFoodUpgradeCost,
    getJobCost, getJobEarnPerSecond, getAssetCost, getTotalAssetMultiplier,
    JOB_TYPES, ASSET_TYPES 
  } = useGame();
  const [activeTab, setActiveTab] = useState('actions');
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const selectedPet = getSelectedPet();
  const maxPetLevel = state.pets.reduce((max, pet) => Math.max(max, pet.growth.level), 1);

  // 펫별 놀이 버튼 라벨
  const getPlayButtonInfo = (petType) => {
    switch (petType) {
      case 'dog':
        return { icon: '🚶', label: '산책', activity: 'walking' };
      case 'cat':
        return { icon: '🧶', label: '리본', activity: 'ribbon' };
      case 'hamster':
        return { icon: '🎡', label: '챗바퀴', activity: 'wheel' };
      default:
        return { icon: '🎾', label: '놀기', activity: 'playing' };
    }
  };

  const handleFeed = (foodType) => {
    if (!selectedPet) return;
    if (selectedPet.state === 'sleep') {
      actions.notify('펫이 자고 있어요! 💤', 'warning');
      return;
    }
    const foodItem = state.inventory.food[foodType];
    if (!foodItem || foodItem.count <= 0) {
      actions.notify(`${foodType}이(가) 없어요! 상점에서 구매하세요.`, 'warning');
      return;
    }
    
    if (selectedPet.growth.level > foodItem.level) {
      const diff = selectedPet.growth.level - foodItem.level;
      actions.notify(`⚠️ 음식 레벨이 낮아 효과가 ${Math.pow(2, diff)}배 감소해요!`, 'warning');
    }
    
    actions.feedPet(selectedPet.id, foodType);
    actions.notify(`${selectedPet.name}에게 밥을 줬어요! 🍖`, 'success');
  };

  const handlePlay = () => {
    if (!selectedPet) return;
    if (selectedPet.state === 'sleep') {
      actions.notify('펫이 자고 있어요! 💤', 'warning');
      return;
    }
    if (selectedPet.stats.energy < 20) {
      actions.notify('에너지가 부족해요! 💤', 'warning');
      return;
    }
    if (selectedPet.specialActivity) {
      actions.notify('이미 놀고 있어요! ⭐', 'info');
      return;
    }
    
    const playInfo = getPlayButtonInfo(selectedPet.type);
    actions.playWithPet(selectedPet.id, playInfo.activity);
    actions.notify(`${selectedPet.name}가 ${playInfo.label}을 시작해요! 🎉`, 'success');
  };

  const handleClean = () => {
    if (!selectedPet) return;
    
    // 청결도 70 이하일 때만 청소 가능
    if (selectedPet.stats.cleanliness > 70) {
      actions.notify('이미 깨끗해요! ✨ (청결도 70% 이하일 때 가능)', 'info');
      return;
    }
    
    // 비용 확인은 리듀서에서 처리하거나 여기서 미리 체크 가능
    const cost = 30 * selectedPet.growth.level;
    if (state.coins < cost) {
      actions.notify(`청소 비용이 부족해요! (필요: ${cost}🪙)`, 'warning');
      return;
    }
    
    actions.cleanPet(selectedPet.id);
    actions.notify(`깨끗해졌어요! 🧹 (-${cost}🪙)`, 'success');
  };

  const handleHeal = () => {
    if (!selectedPet) return;
    if (!selectedPet.isSick) {
      actions.notify('펫이 아프지 않아요! 😊', 'info');
      return;
    }
    const pillItem = state.inventory.medicine.pill;
    if (!pillItem || pillItem.count <= 0) {
      actions.notify('약이 없어요! 상점에서 구매하세요.', 'warning');
      return;
    }
    actions.healPet(selectedPet.id);
    actions.notify(`${selectedPet.name}가 건강해졌어요! 💊`, 'success');
  };

  const handleSleep = () => {
    if (!selectedPet) return;
    if (selectedPet.state === 'sleep') {
      actions.wakePet(selectedPet.id);
      actions.notify(`${selectedPet.name}가 일어났어요! ☀️`, 'info');
    } else {
      actions.sleepPet(selectedPet.id);
      actions.notify(`${selectedPet.name}가 잠들었어요! 💤`, 'info');
    }
  };

  const handleAddPet = (type) => {
    if (state.pets.length >= 5) {
      actions.notify('최대 5마리까지만 키울 수 있어요!', 'warning');
      return;
    }
    actions.addPet(type);
    setShowAddPetModal(false);
    actions.notify('새 펫이 왔어요! 🎉', 'success');
  };

  const handleUpgrade = (upgradeType) => {
    const cost = getUpgradeCost(upgradeType);
    const upgrade = state.upgrades[upgradeType];
    
    if (upgrade.level >= upgrade.maxLevel) {
      actions.notify('이미 최대 레벨이에요! 🌟', 'info');
      return;
    }
    if (state.coins < cost) {
      actions.notify('코인이 부족해요! 💰', 'warning');
      return;
    }
    
    actions.upgrade(upgradeType);
    actions.notify(`강화 성공! +${upgrade.coinPerClick} 코인/클릭 🎉`, 'success');
  };

  const handleBuyItem = (itemType, itemName) => {
    const price = getFoodPrice(itemType, itemName);
    if (state.coins < price) {
      actions.notify('코인이 부족해요! 💰', 'warning');
      return;
    }
    actions.buyItem(itemType, itemName);
    actions.notify(`${itemName}을(를) 구매했어요! 🛒`, 'success');
  };

  const handleUpgradeFood = (itemType, itemName) => {
    const cost = getFoodUpgradeCost(itemType, itemName);
    if (state.coins < cost) {
      actions.notify('코인이 부족해요! 💰', 'warning');
      return;
    }
    actions.upgradeFood(itemType, itemName);
    actions.notify(`${itemName} 레벨업! 📈`, 'success');
  };

  // 알바 잠금해제
  const handleUnlockJob = (jobType) => {
    if (!selectedPet) return;
    const cost = getJobCost(jobType, selectedPet.id);
    if (state.coins < cost) {
      actions.notify('코인이 부족해요! 💰', 'warning');
      return;
    }
    actions.unlockJob(selectedPet.id, jobType);
    actions.notify(`${JOB_TYPES[jobType].name} 알바 해금! 🎉`, 'success');
  };

  // 알바 업그레이드
  const handleUpgradeJob = (jobType) => {
    if (!selectedPet) return;
    const cost = getJobCost(jobType, selectedPet.id);
    if (state.coins < cost) {
      actions.notify('코인이 부족해요! 💰', 'warning');
      return;
    }
    actions.upgradeJob(selectedPet.id, jobType);
    actions.notify(`${JOB_TYPES[jobType].name} 레벨업! 📈`, 'success');
  };



  const tabs = [
    { id: 'actions', label: '행동', icon: '🎮' },
    { id: 'stats', label: '상태', icon: '📊' },
    { id: 'upgrade', label: '강화', icon: '⚡' },
    { id: 'shop', label: '상점', icon: '🛒' },
    { id: 'job', label: '알바', icon: '💼' },
    { id: 'settings', label: '설정', icon: '⚙️' }
  ];

  const playInfo = selectedPet ? getPlayButtonInfo(selectedPet.type) : null;

  return (
    <div className="control-panel">
      {/* 탭 네비게이션 */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="tab-content">
        {/* 행동 탭 */}
        {activeTab === 'actions' && (
          <div className="actions-tab">
            {selectedPet ? (
              <>
                <div className="selected-pet-info">
                  <span className="pet-emoji">
                    {selectedPet.type === 'dog' ? '🐶' : selectedPet.type === 'cat' ? '🐱' : '🐹'}
                  </span>
                  <span className="pet-name">{selectedPet.name}</span>
                  <span className="pet-state">
                    {selectedPet.state === 'sleep' ? '💤' : 
                     selectedPet.state === 'eating' ? '🍖' :
                     selectedPet.currentJob ? '💼' :
                     selectedPet.specialActivity ? '🎮' : ''}
                  </span>
                  <span className="click-coins">클릭당 +{getClickCoins()}🪙</span>
                  {selectedPet.state === 'sleep' && (
                    <span className="sleep-warning">😴 수면 중</span>
                  )}
                </div>
                
                <div className="action-buttons">
                  {/* 사과 - 모든 펫 */}
                  <ActionButton 
                    icon="🍎" 
                    label={`사과 (${state.inventory.food.apple?.count || 0})`}
                    onClick={() => handleFeed('apple')}
                    variant="success"
                    size="medium"
                    disabled={selectedPet.state === 'sleep'}
                  />
                  {/* 고기 - 강아지/고양이만 */}
                  {(selectedPet.type === 'dog' || selectedPet.type === 'cat') && (
                    <ActionButton 
                      icon="🍖" 
                      label={`고기 (${state.inventory.food.meat?.count || 0})`}
                      onClick={() => handleFeed('meat')}
                      variant="warning"
                      size="medium"
                      disabled={selectedPet.state === 'sleep'}
                    />
                  )}
                  {/* 쿠키 - 햄스터만 */}
                  {selectedPet.type === 'hamster' && (
                    <ActionButton 
                      icon="🍪" 
                      label={`쿠키 (${state.inventory.food.cookie?.count || 0})`}
                      onClick={() => handleFeed('cookie')}
                      variant="warning"
                      size="medium"
                      disabled={selectedPet.state === 'sleep'}
                    />
                  )}
                  <ActionButton 
                    icon={playInfo?.icon || '🎾'} 
                    label={playInfo?.label || '놀기'}
                    onClick={handlePlay}
                    variant="primary"
                    size="medium"
                    disabled={selectedPet.state === 'sleep' || selectedPet.specialActivity}
                  />
                  <ActionButton 
                    icon="🧹" 
                    label={`청소 (🪙${selectedPet ? 30 * selectedPet.growth.level : 0})`}
                    onClick={handleClean}
                    variant="secondary"
                    size="medium"
                    disabled={selectedPet.stats.cleanliness > 70}
                  />
                  <ActionButton 
                    icon="💊" 
                    label={`치료 (${state.inventory.medicine.pill?.count || 0})`}
                    onClick={handleHeal}
                    variant="danger"
                    size="medium"
                    disabled={!selectedPet.isSick}
                  />
                  <ActionButton 
                    icon={selectedPet.state === 'sleep' ? '☀️' : '💤'} 
                    label={selectedPet.state === 'sleep' ? '깨우기' : '재우기'}
                    onClick={handleSleep}
                    variant="secondary"
                    size="medium"
                  />
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>펫을 선택해주세요!</p>
                <p className="sub">펫을 클릭하면 코인을 얻어요 🪙</p>
              </div>
            )}
            
            <button className="add-pet-btn" onClick={() => setShowAddPetModal(true)}>
              ➕ 새 펫 입양하기
            </button>
          </div>
        )}

        {/* 상태 탭 */}
        {activeTab === 'stats' && selectedPet && (
          <div className="stats-tab">
            <div className="stats-header">
              <span className="pet-emoji-large">
                {selectedPet.type === 'dog' ? '🐶' : selectedPet.type === 'cat' ? '🐱' : '🐹'}
              </span>
              <div className="pet-info">
                <h3>{selectedPet.name}</h3>
                <p>Lv.{selectedPet.growth.level} • {selectedPet.growth.stage}</p>
              </div>
            </div>
            
            <div className="stats-grid">
              <StatBar 
                label="배부름" 
                value={selectedPet.stats.hunger} 
                icon="🍖" 
                color="var(--success)"
              />
              <StatBar 
                label="행복" 
                value={selectedPet.stats.happiness} 
                icon="❤️" 
                color="var(--primary)"
              />
              <StatBar 
                label="건강" 
                value={selectedPet.stats.health} 
                icon="💚" 
                color="#4CAF50"
              />
              <StatBar 
                label="에너지" 
                value={selectedPet.stats.energy} 
                icon="⚡" 
                color="var(--warning)"
              />
              <StatBar 
                label="청결" 
                value={selectedPet.stats.cleanliness} 
                icon="✨" 
                color="var(--secondary)"
              />
            </div>

            <div className="exp-section">
              <h4>성장</h4>
              <StatBar 
                label="경험치" 
                value={selectedPet.growth.exp} 
                maxValue={100 * Math.pow(3, selectedPet.growth.level - 1)}
                icon="⭐" 
                color="#FFD700"
              />
            </div>
          </div>
        )}

        {/* 강화 탭 */}
        {activeTab === 'upgrade' && (
          <div className="upgrade-tab">
            <h3>⚡ 클릭 강화</h3>
            <p className="upgrade-info">현재 클릭당 +{getClickCoins()} 코인</p>
            
            <div className="upgrade-list">
              {/* 손톱 */}
              <div className="upgrade-item">
                <div className="upgrade-icon">💅</div>
                <div className="upgrade-details">
                  <h4>손톱 강화</h4>
                  <p>클릭당 +1 코인</p>
                  <p className="upgrade-level">
                    Lv.{state.upgrades.fingernail.level} / {state.upgrades.fingernail.maxLevel}
                  </p>
                </div>
                <button 
                  className="upgrade-btn"
                  onClick={() => handleUpgrade('fingernail')}
                  disabled={state.upgrades.fingernail.level >= state.upgrades.fingernail.maxLevel || state.upgrades.fingernail.level >= maxPetLevel}
                >
                  {state.upgrades.fingernail.level >= state.upgrades.fingernail.maxLevel 
                    ? 'MAX' 
                    : state.upgrades.fingernail.level >= maxPetLevel
                    ? `Limit (Lv.${maxPetLevel})`
                    : `🪙 ${getUpgradeCost('fingernail').toLocaleString()}`}
                </button>
              </div>

              {/* 발톱 */}
              <div className="upgrade-item">
                <div className="upgrade-icon">🦶</div>
                <div className="upgrade-details">
                  <h4>발톱 강화</h4>
                  <p>클릭당 +5 코인</p>
                  <p className="upgrade-level">
                    Lv.{state.upgrades.toenail.level} / {state.upgrades.toenail.maxLevel}
                  </p>
                </div>
                <button 
                  className="upgrade-btn"
                  onClick={() => handleUpgrade('toenail')}
                  disabled={state.upgrades.toenail.level >= state.upgrades.toenail.maxLevel || state.upgrades.toenail.level >= maxPetLevel}
                >
                  {state.upgrades.toenail.level >= state.upgrades.toenail.maxLevel 
                    ? 'MAX' 
                    : state.upgrades.toenail.level >= maxPetLevel
                    ? `Limit (Lv.${maxPetLevel})`
                    : `🪙 ${getUpgradeCost('toenail').toLocaleString()}`}
                </button>
              </div>

              {/* 전신 */}
              <div className="upgrade-item">
                <div className="upgrade-icon">✨</div>
                <div className="upgrade-details">
                  <h4>전신 강화</h4>
                  <p>클릭당 +20 코인</p>
                  <p className="upgrade-level">
                    Lv.{state.upgrades.fullbody.level} / {state.upgrades.fullbody.maxLevel}
                  </p>
                </div>
                <button 
                  className="upgrade-btn"
                  onClick={() => handleUpgrade('fullbody')}
                  disabled={state.upgrades.fullbody.level >= state.upgrades.fullbody.maxLevel || state.upgrades.fullbody.level >= maxPetLevel}
                >
                  {state.upgrades.fullbody.level >= state.upgrades.fullbody.maxLevel 
                    ? 'MAX' 
                    : state.upgrades.fullbody.level >= maxPetLevel
                    ? `Limit (Lv.${maxPetLevel})`
                    : `🪙 ${getUpgradeCost('fullbody').toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 상점 탭 */}
        {activeTab === 'shop' && (
          <div className="shop-tab">
            <h3>🛒 상점</h3>
            
            <div className="shop-section">
              <h4>🍎 음식</h4>
              <div className="shop-items">
                {['apple', 'meat', 'cookie'].map(foodName => {
                  const food = state.inventory.food[foodName];
                  const price = getFoodPrice('food', foodName);
                  const upgradeCost = getFoodUpgradeCost('food', foodName);
                  const icons = { apple: '🍎', meat: '🍖', cookie: '🍪' };
                  const names = { apple: '사과', meat: '고기', cookie: '쿠키' };
                  const canBuy = state.coins >= price;
                  const currentLevel = food?.level || 1;
                  const isMaxLevel = currentLevel >= maxPetLevel;
                  const canUpgrade = !isMaxLevel && state.coins >= upgradeCost;
                  
                  return (
                    <div key={foodName} className="shop-item-row">
                      <div 
                        className="shop-item" 
                        onClick={() => canBuy && handleBuyItem('food', foodName)}
                        style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                      >
                        <span className="item-icon">{icons[foodName]}</span>
                        <span className="item-name">{names[foodName]}</span>
                        <span className="item-level">Lv.{currentLevel}</span>
                        <span className="item-price" style={{ color: canBuy ? '#FFA000' : '#FF5252' }}>
                          🪙 {price}
                        </span>
                        <span className="item-owned">x{food?.count || 0}</span>
                      </div>
                      <button 
                        className="level-up-btn"
                        onClick={() => handleUpgradeFood('food', foodName)}
                        disabled={!canUpgrade}
                        style={{ opacity: canUpgrade ? 1 : 0.5 }}
                      >
                        {isMaxLevel ? `Limit (Lv.${maxPetLevel})` : `📈 ${upgradeCost.toLocaleString()}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="shop-section">
              <h4>💊 약품</h4>
              <div className="shop-items">
                {(() => {
                  const pill = state.inventory.medicine.pill;
                  const price = getFoodPrice('medicine', 'pill');
                  const upgradeCost = getFoodUpgradeCost('medicine', 'pill');
                  const canBuy = state.coins >= price;
                  const currentLevel = pill?.level || 1;
                  const isMaxLevel = currentLevel >= maxPetLevel;
                  const canUpgrade = !isMaxLevel && state.coins >= upgradeCost;
                  
                  return (
                    <div className="shop-item-row">
                      <div 
                        className="shop-item" 
                        onClick={() => canBuy && handleBuyItem('medicine', 'pill')}
                        style={{ opacity: canBuy ? 1 : 0.5, cursor: canBuy ? 'pointer' : 'not-allowed' }}
                      >
                        <span className="item-icon">💊</span>
                        <span className="item-name">알약</span>
                        <span className="item-level">Lv.{currentLevel}</span>
                        <span className="item-price" style={{ color: canBuy ? '#FFA000' : '#FF5252' }}>
                          🪙 {price}
                        </span>
                        <span className="item-owned">x{pill?.count || 0}</span>
                      </div>
                      <button 
                        className="level-up-btn"
                        onClick={() => handleUpgradeFood('medicine', 'pill')}
                        disabled={!canUpgrade}
                        style={{ opacity: canUpgrade ? 1 : 0.5 }}
                      >
                        {isMaxLevel ? `Limit (Lv.${maxPetLevel})` : `📈 ${upgradeCost.toLocaleString()}`}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 자산 섹션 */}
            <div className="shop-section">
              <h4>🏠 자산 (알바 수익 x{getTotalAssetMultiplier().toFixed(2)})</h4>
              <div className="shop-items">
                {Object.entries(ASSET_TYPES).map(([assetType, assetInfo]) => {
                  const currentAsset = state.assets[assetType];
                  const level = currentAsset?.level || 0;
                  const cost = getAssetCost(assetType);
                  const isMaxLevel = level >= assetInfo.maxLevel;
                  const isPetLimited = level >= maxPetLevel;
                  const canBuy = !isMaxLevel && !isPetLimited && state.coins >= cost;
                  
                  return (
                    <div key={assetType} className="shop-item-row">
                      <div 
                        className="shop-item" 
                        onClick={() => canBuy && actions.upgradeAsset(assetType)}
                        style={{ 
                          cursor: isMaxLevel || isPetLimited ? 'default' : (canBuy ? 'pointer' : 'not-allowed'),
                          opacity: isMaxLevel || isPetLimited || canBuy ? 1 : 0.5
                        }}
                      >
                        <span className="item-icon">{assetInfo.icon}</span>
                        <span className="item-name">{assetInfo.name}</span>
                        <span className="item-level">Lv.{level}</span>
                        <span className="item-price" style={{ color: isMaxLevel || isPetLimited ? '#999' : (canBuy ? '#FFA000' : '#FF5252') }}>
                          {isMaxLevel ? 'MAX' : isPetLimited ? `Limit (Lv.${maxPetLevel})` : `🪙 ${cost.toLocaleString()}`}
                        </span>
                        <span className="item-owned">x{assetInfo.multiplier}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 알바 탭 - 패시브 수입 시스템 */}
        {activeTab === 'job' && (
          <div className="job-tab">
            <h3>💼 알바 (자동 수입)</h3>
            
            {!selectedPet ? (
              <p className="job-notice">⚠️ 펫을 먼저 선택해주세요!</p>
            ) : selectedPet.state === 'sleep' ? (
              <div className="job-notice warning">
                <p>😴 펫이 자고 있어요!</p>
                <p className="sub-notice">자고 있는 동안엔 알바 수입이 들어오지 않아요.</p>
              </div>
            ) : (
              <>
                <div className="job-pet-info">
                  <span className="pet-emoji">
                    {selectedPet.type === 'dog' ? '🐶' : selectedPet.type === 'cat' ? '🐱' : '🐹'}
                  </span>
                  <span>{selectedPet.name}의 알바 현황</span>
                </div>

                {/* 총 수입 요약 */}
                <div className="income-summary">
                  <div className="income-row">
                    <span>기본 수입 합계</span>
                    <span>
                      {Object.entries(JOB_TYPES).reduce((acc, [type]) => {
                        return acc + getJobEarnPerSecond(type, selectedPet.id);
                      }, 0)} 코인/초
                    </span>
                  </div>
                  <div className="income-row multiplier">
                    <span>자산 배율 효과</span>
                    <span>x{getTotalAssetMultiplier().toFixed(2)}</span>
                  </div>
                  <div className="income-total">
                    <span>최종 시간당 수입</span>
                    <span className="highlight">
                      +{(Object.entries(JOB_TYPES).reduce((acc, [type]) => {
                        return acc + getJobEarnPerSecond(type, selectedPet.id);
                      }, 0) * getTotalAssetMultiplier()).toFixed(0)} 코인/초
                    </span>
                  </div>
                </div>

                <div className="job-list">
                  {Object.entries(JOB_TYPES).map(([jobType, jobInfo]) => {
                    const petJob = selectedPet.jobs[jobType];
                    const isUnlocked = petJob?.unlocked;
                    const level = petJob?.level || 0;
                    const unlockCost = jobInfo.baseCost;
                    const upgradeCost = getJobCost(jobType, selectedPet.id);
                    const earnPerSec = getJobEarnPerSecond(jobType, selectedPet.id);
                    
                    const canUnlock = state.coins >= unlockCost;
                    const isPetLimited = level >= maxPetLevel;
                    const canUpgrade = !isPetLimited && state.coins >= upgradeCost;
                    
                    return (
                      <div key={jobType} className="job-item-new">
                        <div className="job-header">
                          <span className="job-emoji">{jobInfo.icon}</span>
                          <div className="job-details">
                            <h4>{jobInfo.name}</h4>
                            {isUnlocked ? (
                              <p className="income-text">Lv.{level} • +{earnPerSec} 코인/초 (기본)</p>
                            ) : (
                              <p className="locked">🔒 잠금됨</p>
                            )}
                          </div>
                        </div>
                        <div className="job-actions">
                          {!isUnlocked ? (
                            <button 
                              className="unlock-btn"
                              onClick={() => handleUnlockJob(jobType)}
                              disabled={!canUnlock}
                              style={{ opacity: canUnlock ? 1 : 0.5, cursor: canUnlock ? 'pointer' : 'not-allowed' }}
                            >
                              🔓 해금 (🪙{unlockCost})
                            </button>
                          ) : (
                            <button 
                              className="upgrade-job-btn"
                              onClick={() => handleUpgradeJob(jobType)}
                              disabled={!canUpgrade}
                              style={{ opacity: canUpgrade ? 1 : 0.5, cursor: canUpgrade ? 'pointer' : 'not-allowed' }}
                            >
                              {isPetLimited ? `Limit (Lv.${maxPetLevel})` : `📈 레벨업 (🪙${upgradeCost.toLocaleString()})`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>⚙️ 설정</h3>
            
            <div className="setting-item">
              <span>🎨 펫 설정</span>
              <button onClick={() => setShowSettingsModal(true)}>
                이름/색상 변경
              </button>
            </div>
            
            <div className="setting-item">
              <span>💾 게임 저장</span>
              <button onClick={() => {
                actions.saveGame();
                actions.notify('게임이 저장되었어요! 💾', 'success');
              }}>저장</button>
            </div>
            
            <div className="setting-item warning-box">
              <div>
                <span>⚠️ 수면 시스템 안내</span>
                <p className="warning-text">
                  • 수면 중에는 클릭, 알바, 상태변화가 모두 정지해요<br/>
                  • 깨어있을 때만 활동할 수 있어요<br/>
                  • 오프라인 시 재우지 않으면 상태가 감소해요
                </p>
              </div>
            </div>
            
            <div className="setting-item danger">
              <span>🗑️ 게임 초기화</span>
              <button onClick={() => {
                if (window.confirm('정말 초기화하시겠어요? 모든 데이터가 삭제됩니다.')) {
                  actions.resetGame();
                }
              }}>초기화</button>
            </div>

            <div className="game-info">
              <p>🐾 다마고치 v2.2 (Patch: Price Fix)</p>
              <p>React + Vite</p>
            </div>
          </div>
        )}
      </div>

      {/* 새 펫 추가 모달 */}
      {showAddPetModal && (
        <div className="modal-overlay" onClick={() => setShowAddPetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>🐾 새 펫 입양하기</h3>
            <div className="pet-choices">
              <button className="pet-choice" onClick={() => handleAddPet('dog')}>
                <span className="choice-emoji">🐶</span>
                <span className="choice-name">강아지</span>
                <span className="choice-skill">🚶 산책</span>
              </button>
              <button className="pet-choice" onClick={() => handleAddPet('cat')}>
                <span className="choice-emoji">🐱</span>
                <span className="choice-name">고양이</span>
                <span className="choice-skill">🧶 리본</span>
              </button>
              <button className="pet-choice" onClick={() => handleAddPet('hamster')}>
                <span className="choice-emoji">🐹</span>
                <span className="choice-name">햄스터</span>
                <span className="choice-skill">🎡 챗바퀴</span>
              </button>
            </div>
            <button className="close-modal" onClick={() => setShowAddPetModal(false)}>
              취소
            </button>
          </div>
        </div>
      )}

      {/* 펫 설정 모달 */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  );
};

// 헬퍼 함수
const getExpRequired = (stage) => {
  const requirements = {
    egg: 10,
    baby: 50,
    child: 150,
    teen: 300,
    adult: 500
  };
  return requirements[stage] || 100;
};

export default ControlPanel;
