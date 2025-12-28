import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { getDefaultColor } from '../utils/petColors';
import * as api from '../services/api';

// 알바 정보 - 펫별로 관리, 레벨당 분당 획득 (등차수열)
const JOB_TYPES = {
  delivery: { name: '배달', icon: '🚴', baseCost: 50, baseEarn: 5, earnIncrement: 3 },
  cleaning: { name: '청소', icon: '🧹', baseCost: 100, baseEarn: 8, earnIncrement: 5 },
  tutoring: { name: '과외', icon: '📚', baseCost: 200, baseEarn: 12, earnIncrement: 8 }
};

// 초기 상태
const initialState = {
  pets: [],
  selectedPetId: null,
  coins: 100,
  
  // 강화 시스템
  upgrades: {
    fingernail: { level: 0, maxLevel: 20, baseCost: 100, coinPerClick: 1 },
    toenail: { level: 0, maxLevel: 20, baseCost: 1000, coinPerClick: 5 },
    fullbody: { level: 0, maxLevel: 20, baseCost: 10000, coinPerClick: 20 }
  },
  
  // 인벤토리 (레벨 포함)
  inventory: {
    food: { 
      apple: { count: 3, level: 1, basePrice: 10 }, 
      meat: { count: 2, level: 1, basePrice: 25 }, 
      cookie: { count: 1, level: 1, basePrice: 15 } 
    },
    medicine: { 
      pill: { count: 2, level: 1, basePrice: 50 } 
    },
    toys: { ball: 1, yarn: 1 }
  },
  
  gameTime: {
    day: 1,
    hour: 12,
    isNight: false
  },
  notifications: [],
  lastSaveTime: Date.now(),
  lastJobTick: Date.now(), // 분당 코인을 위한 마지막 틱 시간
  settings: {
    soundEnabled: true,
    vibrationEnabled: true
  }
};

// 펫 생성 함수
const createPet = (type, name) => ({
  id: Date.now().toString(),
  type,
  name: name || getDefaultName(type),
  colorId: getDefaultColor(type),
  createdAt: Date.now(),
  
  stats: {
    hunger: 80,
    happiness: 80,
    health: 100,
    energy: 100,
    cleanliness: 90,
  },
  
  growth: {
    stage: 'baby',
    exp: 0,
    level: 1,
  },
  
  state: 'idle',
  mood: 'happy',
  
  position: {
    x: 50 + Math.random() * 200,
    y: 100
  },
  direction: 1,
  
  poopCount: 0,
  isSick: false,
  hasRunAway: false,
  lastFed: Date.now(),
  lastPlayed: Date.now(),
  
  // 특수 활동 상태
  specialActivity: null,
  activityProgress: 0,
  
  // 펫별 알바 시스템 (깨어있을 때만 가능)
  jobs: {
    delivery: { level: 0, unlocked: false },
    cleaning: { level: 0, unlocked: false },
    tutoring: { level: 0, unlocked: false }
  },
  currentJob: null, // 현재 진행중인 알바 (깨어있을 때만)
  jobStartTime: null,
  jobEarned: 0
});

const getDefaultName = (type) => {
  const names = {
    dog: ['멍멍이', '바둑이', '초코', '뽀삐', '두부'],
    cat: ['야옹이', '나비', '치즈', '모찌', '루나'],
    hamster: ['햄찌', '동글이', '씨앗이', '뽀롱이', '솜이']
  };
  const typeNames = names[type] || names.dog;
  return typeNames[Math.floor(Math.random() * typeNames.length)];
};

// 클릭당 코인 계산
const calculateClickCoins = (upgrades) => {
  const base = 1;
  const fingernail = upgrades.fingernail.level * upgrades.fingernail.coinPerClick;
  const toenail = upgrades.toenail.level * upgrades.toenail.coinPerClick;
  const fullbody = upgrades.fullbody.level * upgrades.fullbody.coinPerClick;
  return base + fingernail + toenail + fullbody;
};

// 강화 비용 계산
const calculateUpgradeCost = (baseCost, currentLevel) => {
  return baseCost * Math.pow(2, currentLevel);
};

// 음식 가격 계산
const calculateFoodPrice = (basePrice, level) => {
  return basePrice * Math.pow(2, level - 1);
};

// 음식 레벨업 비용
const calculateFoodUpgradeCost = (basePrice, level) => {
  return calculateFoodPrice(basePrice, level) * 10;
};

// 알바 잠금해제/업그레이드 비용 (2배씩 증가)
const calculateJobCost = (jobType, currentLevel) => {
  const job = JOB_TYPES[jobType];
  if (!job) return 0;
  return job.baseCost * Math.pow(2, currentLevel);
};

// 알바 분당 수입 계산 (등차수열)
const calculateJobEarnPerMinute = (jobType, level) => {
  const job = JOB_TYPES[jobType];
  if (!job || level <= 0) return 0;
  // 레벨 1: baseEarn, 레벨 2: baseEarn + earnIncrement, ...
  return job.baseEarn + (level - 1) * job.earnIncrement;
};

// 도망간 펫 소환 비용 (레벨 * 100)
const calculateRecallCost = (petLevel) => {
  return petLevel * 100;
};

// 액션 타입
const ActionTypes = {
  ADD_PET: 'ADD_PET',
  REMOVE_PET: 'REMOVE_PET',
  SELECT_PET: 'SELECT_PET',
  UPDATE_PET_SETTINGS: 'UPDATE_PET_SETTINGS',
  UPDATE_PET_STATS: 'UPDATE_PET_STATS',
  UPDATE_PET_STATE: 'UPDATE_PET_STATE',
  FEED_PET: 'FEED_PET',
  PLAY_WITH_PET: 'PLAY_WITH_PET',
  SPECIAL_ACTIVITY: 'SPECIAL_ACTIVITY',
  END_SPECIAL_ACTIVITY: 'END_SPECIAL_ACTIVITY',
  UPDATE_ACTIVITY_PROGRESS: 'UPDATE_ACTIVITY_PROGRESS',
  CLEAN_PET: 'CLEAN_PET',
  HEAL_PET: 'HEAL_PET',
  SLEEP_PET: 'SLEEP_PET',
  WAKE_PET: 'WAKE_PET',
  ADD_POOP: 'ADD_POOP',
  CLICK_PET: 'CLICK_PET',
  UPGRADE: 'UPGRADE',
  UPGRADE_FOOD: 'UPGRADE_FOOD',
  BUY_ITEM: 'BUY_ITEM',
  UNLOCK_JOB: 'UNLOCK_JOB',
  UPGRADE_JOB: 'UPGRADE_JOB',
  START_JOB: 'START_JOB',
  END_JOB: 'END_JOB',
  JOB_MINUTE_TICK: 'JOB_MINUTE_TICK',
  ADD_COINS: 'ADD_COINS',
  SPEND_COINS: 'SPEND_COINS',
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  LOAD_GAME: 'LOAD_GAME',
  TICK: 'TICK',
  APPLY_OFFLINE_PENALTY: 'APPLY_OFFLINE_PENALTY',
  RECALL_PET: 'RECALL_PET',
};

// 성장 단계 경험치 요구량
const GROWTH_REQUIREMENTS = {
  egg: { expRequired: 10, nextStage: 'baby' },
  baby: { expRequired: 50, nextStage: 'child' },
  child: { expRequired: 150, nextStage: 'teen' },
  teen: { expRequired: 300, nextStage: 'adult' },
  adult: { expRequired: Infinity, nextStage: null }
};

// 리듀서
const gameReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.ADD_PET: {
      const newPet = createPet(action.payload.type, action.payload.name);
      return {
        ...state,
        pets: [...state.pets, newPet],
        selectedPetId: newPet.id
      };
    }

    case ActionTypes.REMOVE_PET: {
      return {
        ...state,
        pets: state.pets.filter(p => p.id !== action.payload.petId),
        selectedPetId: state.selectedPetId === action.payload.petId 
          ? (state.pets[0]?.id || null) 
          : state.selectedPetId
      };
    }

    // 도망간 펫 소환
    case ActionTypes.RECALL_PET: {
      const { petId } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || !pet.hasRunAway) return state;
      
      const cost = calculateRecallCost(pet.growth.level);
      if (state.coins < cost) return state;
      
      return {
        ...state,
        coins: state.coins - cost,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                hasRunAway: false,
                state: 'idle',
                stats: {
                  hunger: 50,
                  happiness: 50,
                  health: 50,
                  energy: 50,
                  cleanliness: 50
                },
                mood: 'happy',
                isSick: false,
                poopCount: 0,
                currentJob: null,
                jobStartTime: null
              }
            : p
        )
      };
    }

    case ActionTypes.SELECT_PET: {
      return {
        ...state,
        selectedPetId: action.payload.petId
      };
    }

    case ActionTypes.UPDATE_PET_SETTINGS: {
      const { petId, updates } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? { ...pet, ...updates }
            : pet
        )
      };
    }

    case ActionTypes.CLICK_PET: {
      // 펫이 잠자고 있으면 코인 획득 불가
      const pet = state.pets.find(p => p.id === action.payload.petId);
      if (!pet || pet.state === 'sleep') return state;
      
      const coinsEarned = calculateClickCoins(state.upgrades);
      return {
        ...state,
        coins: state.coins + coinsEarned
      };
    }

    case ActionTypes.UPGRADE: {
      const { upgradeType } = action.payload;
      const upgrade = state.upgrades[upgradeType];
      if (!upgrade || upgrade.level >= upgrade.maxLevel) return state;
      
      const cost = calculateUpgradeCost(upgrade.baseCost, upgrade.level);
      if (state.coins < cost) return state;
      
      return {
        ...state,
        coins: state.coins - cost,
        upgrades: {
          ...state.upgrades,
          [upgradeType]: {
            ...upgrade,
            level: upgrade.level + 1
          }
        }
      };
    }

    case ActionTypes.UPGRADE_FOOD: {
      const { itemType, itemName } = action.payload;
      const item = state.inventory[itemType]?.[itemName];
      if (!item) return state;
      
      const cost = calculateFoodUpgradeCost(item.basePrice, item.level);
      if (state.coins < cost) return state;
      
      return {
        ...state,
        coins: state.coins - cost,
        inventory: {
          ...state.inventory,
          [itemType]: {
            ...state.inventory[itemType],
            [itemName]: {
              ...item,
              level: item.level + 1
            }
          }
        }
      };
    }

    case ActionTypes.FEED_PET: {
      const { petId, foodType } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') return state; // 수면 중에는 먹이기 불가
      
      const foodItem = state.inventory.food[foodType];
      if (!foodItem || foodItem.count <= 0) return state;
      
      const foodValues = {
        apple: { hunger: 20, happiness: 5 },
        meat: { hunger: 40, happiness: 10 },
        cookie: { hunger: 10, happiness: 20 },
      };
      const baseFood = foodValues[foodType] || foodValues.apple;
      
      const effectMultiplier = pet.growth.level <= foodItem.level ? 1 : 
        1 / Math.pow(2, pet.growth.level - foodItem.level);
      
      const actualHunger = Math.floor(baseFood.hunger * effectMultiplier);
      const actualHappiness = Math.floor(baseFood.happiness * effectMultiplier);
      
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  hunger: Math.min(100, p.stats.hunger + actualHunger),
                  happiness: Math.min(100, p.stats.happiness + actualHappiness),
                },
                state: 'eating',
                lastFed: Date.now(),
                growth: {
                  ...p.growth,
                  exp: p.growth.exp + 5
                }
              }
            : p
        ),
        inventory: {
          ...state.inventory,
          food: {
            ...state.inventory.food,
            [foodType]: {
              ...foodItem,
              count: foodItem.count - 1
            }
          }
        }
      };
    }

    case ActionTypes.SPECIAL_ACTIVITY: {
      const { petId, activityType } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') return state; // 수면 중에는 활동 불가
      
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                state: 'playing',
                specialActivity: activityType,
                activityProgress: 0
              }
            : p
        )
      };
    }

    case ActionTypes.UPDATE_ACTIVITY_PROGRESS: {
      const { petId, progress } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? { ...pet, activityProgress: progress }
            : pet
        )
      };
    }

    case ActionTypes.END_SPECIAL_ACTIVITY: {
      const { petId } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? {
                ...pet,
                state: 'idle',
                specialActivity: null,
                activityProgress: 0,
                stats: {
                  ...pet.stats,
                  happiness: Math.min(100, pet.stats.happiness + 30),
                  energy: Math.max(0, pet.stats.energy - 20)
                }
              }
            : pet
        )
      };
    }

    case ActionTypes.CLEAN_PET: {
      const { petId } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') return state;
      
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  cleanliness: 100,
                  happiness: Math.min(100, p.stats.happiness + 10),
                },
                poopCount: 0,
                growth: {
                  ...p.growth,
                  exp: p.growth.exp + 3
                }
              }
            : p
        )
      };
    }

    case ActionTypes.HEAL_PET: {
      const { petId } = action.payload;
      const pillItem = state.inventory.medicine.pill;
      if (!pillItem || pillItem.count <= 0) return state;
      
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') return state;
      
      const effectMultiplier = pet.growth.level <= pillItem.level ? 1 : 
        1 / Math.pow(2, pet.growth.level - pillItem.level);
      const healAmount = Math.floor(100 * effectMultiplier);
      
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                stats: {
                  ...p.stats,
                  health: Math.min(100, p.stats.health + healAmount),
                },
                isSick: healAmount >= 50 ? false : p.isSick,
                mood: 'happy',
                state: 'idle'
              }
            : p
        ),
        inventory: {
          ...state.inventory,
          medicine: {
            ...state.inventory.medicine,
            pill: {
              ...pillItem,
              count: pillItem.count - 1
            }
          }
        }
      };
    }

    case ActionTypes.SLEEP_PET: {
      const { petId } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? { 
                ...pet, 
                state: 'sleep', 
                specialActivity: null,
                currentJob: null, // 수면 시 알바 중지
                jobStartTime: null
              }
            : pet
        )
      };
    }

    case ActionTypes.WAKE_PET: {
      const { petId } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? {
                ...pet,
                state: 'idle',
                stats: {
                  ...pet.stats,
                  energy: 100
                }
              }
            : pet
        )
      };
    }

    case ActionTypes.ADD_POOP: {
      const { petId } = action.payload;
      return {
        ...state,
        pets: state.pets.map(pet => 
          pet.id === petId
            ? { 
                ...pet, 
                poopCount: pet.poopCount + 1,
                stats: {
                  ...pet.stats,
                  cleanliness: Math.max(0, pet.stats.cleanliness - 15),
                  happiness: Math.max(0, pet.stats.happiness - 5)
                }
              }
            : pet
        )
      };
    }

    // 알바 잠금해제 (초기 비용)
    case ActionTypes.UNLOCK_JOB: {
      const { petId, jobType } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet) return state;
      
      const cost = JOB_TYPES[jobType]?.baseCost || 0;
      if (state.coins < cost) return state;
      
      return {
        ...state,
        coins: state.coins - cost,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                jobs: {
                  ...p.jobs,
                  [jobType]: { level: 1, unlocked: true }
                }
              }
            : p
        )
      };
    }

    // 알바 레벨업 (2배씩 비용 증가)
    case ActionTypes.UPGRADE_JOB: {
      const { petId, jobType } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || !pet.jobs[jobType]?.unlocked) return state;
      
      const currentLevel = pet.jobs[jobType].level;
      const cost = calculateJobCost(jobType, currentLevel);
      if (state.coins < cost) return state;
      
      return {
        ...state,
        coins: state.coins - cost,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                jobs: {
                  ...p.jobs,
                  [jobType]: { 
                    ...p.jobs[jobType],
                    level: currentLevel + 1 
                  }
                }
              }
            : p
        )
      };
    }

    // 알바 시작 (깨어있는 펫만 가능)
    case ActionTypes.START_JOB: {
      const { petId, jobType } = action.payload;
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep' || !pet.jobs[jobType]?.unlocked) return state;
      
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                currentJob: jobType,
                jobStartTime: Date.now(),
                jobEarned: 0
              }
            : p
        )
      };
    }

    // 알바 종료
    case ActionTypes.END_JOB: {
      const { petId } = action.payload;
      return {
        ...state,
        pets: state.pets.map(p => 
          p.id === petId
            ? {
                ...p,
                currentJob: null,
                jobStartTime: null,
                jobEarned: 0
              }
            : p
        )
      };
    }

    // 알바 분당 틱 (1분마다 호출)
    case ActionTypes.JOB_MINUTE_TICK: {
      let totalEarned = 0;
      const updatedPets = state.pets.map(pet => {
        // 수면 중이거나 알바 중이 아니면 스킵
        if (pet.state === 'sleep' || !pet.currentJob) return pet;
        
        const jobLevel = pet.jobs[pet.currentJob]?.level || 0;
        const earned = calculateJobEarnPerMinute(pet.currentJob, jobLevel);
        totalEarned += earned;
        
        return {
          ...pet,
          jobEarned: (pet.jobEarned || 0) + earned
        };
      });
      
      return {
        ...state,
        coins: state.coins + totalEarned,
        pets: updatedPets,
        lastJobTick: Date.now()
      };
    }

    case ActionTypes.ADD_COINS: {
      return {
        ...state,
        coins: state.coins + action.payload.amount
      };
    }

    case ActionTypes.SPEND_COINS: {
      return {
        ...state,
        coins: Math.max(0, state.coins - action.payload.amount)
      };
    }

    case ActionTypes.BUY_ITEM: {
      const { itemType, itemName } = action.payload;
      const item = state.inventory[itemType]?.[itemName];
      if (!item) return state;
      
      const price = calculateFoodPrice(item.basePrice, item.level);
      if (state.coins < price) return state;
      
      return {
        ...state,
        coins: state.coins - price,
        inventory: {
          ...state.inventory,
          [itemType]: {
            ...state.inventory[itemType],
            [itemName]: {
              ...item,
              count: item.count + 1
            }
          }
        }
      };
    }

    case ActionTypes.ADD_NOTIFICATION: {
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), ...action.payload }
        ].slice(-5)
      };
    }

    case ActionTypes.REMOVE_NOTIFICATION: {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.id)
      };
    }

    case ActionTypes.LOAD_GAME: {
      const loadedPets = (action.payload.pets || []).map(pet => ({
        ...pet,
        colorId: pet.colorId || getDefaultColor(pet.type),
        jobs: pet.jobs || {
          delivery: { level: 0, unlocked: false },
          cleaning: { level: 0, unlocked: false },
          tutoring: { level: 0, unlocked: false }
        },
        currentJob: pet.currentJob || null,
        jobStartTime: pet.jobStartTime || null,
        jobEarned: pet.jobEarned || 0
      }));
      
      return {
        ...initialState,
        ...action.payload,
        pets: loadedPets,
        inventory: {
          food: {
            apple: action.payload.inventory?.food?.apple?.count !== undefined 
              ? action.payload.inventory.food.apple 
              : { count: 3, level: 1, basePrice: 10 },
            meat: action.payload.inventory?.food?.meat?.count !== undefined 
              ? action.payload.inventory.food.meat 
              : { count: 2, level: 1, basePrice: 25 },
            cookie: action.payload.inventory?.food?.cookie?.count !== undefined 
              ? action.payload.inventory.food.cookie 
              : { count: 1, level: 1, basePrice: 15 },
          },
          medicine: {
            pill: action.payload.inventory?.medicine?.pill?.count !== undefined 
              ? action.payload.inventory.medicine.pill 
              : { count: 2, level: 1, basePrice: 50 },
          },
          toys: action.payload.inventory?.toys || { ball: 1, yarn: 1 }
        },
        upgrades: action.payload.upgrades || initialState.upgrades,
        lastJobTick: action.payload.lastJobTick || Date.now()
      };
    }

    case ActionTypes.APPLY_OFFLINE_PENALTY: {
      const { offlineSeconds } = action.payload;
      const decayPerSecond = 0.01;
      
      return {
        ...state,
        pets: state.pets.map(pet => {
          if (pet.state === 'sleep') return pet;
          
          const decay = offlineSeconds * decayPerSecond;
          return {
            ...pet,
            stats: {
              hunger: Math.max(0, pet.stats.hunger - decay * 2),
              happiness: Math.max(0, pet.stats.happiness - decay * 1.5),
              health: Math.max(0, pet.stats.health - decay),
              energy: Math.max(0, pet.stats.energy - decay),
              cleanliness: Math.max(0, pet.stats.cleanliness - decay * 0.5),
            }
          };
        })
      };
    }

    case ActionTypes.TICK: {
      return {
        ...state,
        lastSaveTime: Date.now(),
        pets: state.pets.map(pet => {
          // 수면 중에는 상태 변화 없음
          if (pet.hasRunAway || pet.state === 'sleep') return pet;
          
          const newStats = { ...pet.stats };
          
          newStats.hunger = Math.max(0, newStats.hunger - 0.5);
          newStats.happiness = Math.max(0, newStats.happiness - 0.3);
          newStats.energy = Math.max(0, newStats.energy - 0.2);
          newStats.cleanliness = Math.max(0, newStats.cleanliness - 0.1);
          
          if (newStats.hunger < 20 || newStats.cleanliness < 20) {
            newStats.health = Math.max(0, newStats.health - 0.3);
          }
          
          let newMood = pet.mood;
          let newIsSick = pet.isSick;
          
          if (newStats.health < 30) {
            newMood = 'sick';
            newIsSick = true;
          } else if (newStats.happiness < 30) {
            newMood = 'sad';
          } else if (newStats.energy < 20) {
            newMood = 'tired';
          } else {
            newMood = 'happy';
          }
          
          // 배고픔 0, 행복 0, 또는 똥 5개 이상이면 도망
          const hasRunAway = newStats.hunger <= 0 || newStats.happiness <= 0 || pet.poopCount >= 5;
          
          return {
            ...pet,
            stats: newStats,
            mood: newMood,
            isSick: newIsSick,
            hasRunAway,
            state: pet.state === 'eating' || (pet.state === 'playing' && !pet.specialActivity)
              ? 'idle' 
              : pet.state
          };
        })
      };
    }

    default:
      return state;
  }
};

// Context 생성
const GameContext = createContext(null);

// Provider 컴포넌트
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const activityTimers = useRef({});
  const isResetting = useRef(false);

  // 로컬 스토리지에서 게임 로드
  useEffect(() => {
    const savedGame = localStorage.getItem('tamagotchi_save');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        dispatch({ type: ActionTypes.LOAD_GAME, payload: parsed });
        
        if (parsed.lastSaveTime) {
          const offlineSeconds = (Date.now() - parsed.lastSaveTime) / 1000;
          if (offlineSeconds > 60) {
            dispatch({ 
              type: ActionTypes.APPLY_OFFLINE_PENALTY, 
              payload: { offlineSeconds } 
            });
            
            const awakePets = parsed.pets?.filter(p => p.state !== 'sleep') || [];
            if (awakePets.length > 0) {
              setTimeout(() => {
                dispatch({
                  type: ActionTypes.ADD_NOTIFICATION,
                  payload: {
                    message: `⚠️ ${Math.floor(offlineSeconds / 60)}분 동안 펫이 깨어있어서 상태가 감소했어요!`,
                    type: 'warning'
                  }
                });
              }, 1000);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
  }, []);

  // 서버 저장 함수 (debounced)
  const lastServerSave = useRef(0);
  const serverSaveTimeout = useRef(null);
  
  const saveToServerDirect = async (gameState) => {
    try {
      await api.saveGameData({
        coins: gameState.coins,
        upgrades: gameState.upgrades,
        pets: gameState.pets,
        inventory: gameState.inventory,
        partTimeJob: { isWorking: false },
        gameTime: gameState.gameTime,
        settings: gameState.settings
      });
      console.log('✅ 서버 저장 완료');
    } catch (error) {
      console.error('❌ 서버 저장 실패:', error);
    }
  };

  const saveToServer = useCallback(async (gameState) => {
    if (!api.isLoggedIn()) return;
    
    // 최소 5초 간격으로 서버 저장
    const now = Date.now();
    if (now - lastServerSave.current < 5000) {
      // 5초 내에 다시 호출되면 타임아웃 설정
      if (serverSaveTimeout.current) {
        clearTimeout(serverSaveTimeout.current);
      }
      serverSaveTimeout.current = setTimeout(() => {
        saveToServerDirect(gameState);
        lastServerSave.current = Date.now();
      }, 5000 - (now - lastServerSave.current));
      return;
    }
    
    lastServerSave.current = now;
    
    try {
      await api.saveGameData({
        coins: gameState.coins,
        upgrades: gameState.upgrades,
        pets: gameState.pets,
        inventory: gameState.inventory,
        partTimeJob: { isWorking: false },
        gameTime: gameState.gameTime,
        settings: gameState.settings
      });
      console.log('✅ 서버 저장 완료');
    } catch (error) {
      console.error('❌ 서버 저장 실패:', error);
    }
  }, []);

  // 게임 자동 저장
  useEffect(() => {
    // 로컬 저장 (10초마다)
    const localSaveInterval = setInterval(() => {
      localStorage.setItem('tamagotchi_save', JSON.stringify(state));
    }, 10000);
    
    // 서버 저장 (30초마다, 로그인 상태일 때만)
    const serverSaveInterval = setInterval(() => {
      if (api.isLoggedIn()) {
        saveToServer(state);
      }
    }, 30000);
    
    const handleBeforeUnload = (e) => {
      // 초기화 중이면 저장하지 않음
      if (isResetting.current) return;
      
      // 로컬 저장
      localStorage.setItem('tamagotchi_save', JSON.stringify(state));
      
      // 서버 저장 시도 (navigator.sendBeacon 사용)
      if (api.isLoggedIn()) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const data = JSON.stringify({
          coins: state.coins,
          upgrades: state.upgrades,
          pets: state.pets,
          inventory: state.inventory,
          partTimeJob: { isWorking: false },
          gameTime: state.gameTime,
          settings: state.settings
        });
        
        // sendBeacon으로 페이지 닫을 때도 저장
        navigator.sendBeacon(
          `${apiUrl}/game/save`,
          new Blob([data], { type: 'application/json' })
        );
      }
      
      const awakePets = state.pets.filter(p => p.state !== 'sleep');
      if (awakePets.length > 0) {
        e.preventDefault();
        e.returnValue = '펫이 깨어있어요! 재우지 않고 나가면 상태가 감소합니다.';
        return e.returnValue;
      }
    };
    
    // visibilitychange로 탭 전환 시에도 저장
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('tamagotchi_save', JSON.stringify(state));
        if (api.isLoggedIn()) {
          saveToServer(state);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(localSaveInterval);
      clearInterval(serverSaveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (serverSaveTimeout.current) {
        clearTimeout(serverSaveTimeout.current);
      }
    };
  }, [state, saveToServer]);

  // 게임 틱 (3초마다)
  useEffect(() => {
    const tickInterval = setInterval(() => {
      dispatch({ type: ActionTypes.TICK });
    }, 3000);
    
    return () => clearInterval(tickInterval);
  }, []);

  // 알바 분당 틱 (60초마다)
  useEffect(() => {
    const jobInterval = setInterval(() => {
      dispatch({ type: ActionTypes.JOB_MINUTE_TICK });
    }, 60000);
    
    return () => clearInterval(jobInterval);
  }, []);

  // 똥 싸기
  useEffect(() => {
    const poopInterval = setInterval(() => {
      state.pets.forEach(pet => {
        if (!pet.hasRunAway && pet.state !== 'sleep' && Math.random() < 0.1) {
          dispatch({ type: ActionTypes.ADD_POOP, payload: { petId: pet.id } });
        }
      });
    }, 10000);
    
    return () => clearInterval(poopInterval);
  }, [state.pets]);

  const getSelectedPet = () => {
    return state.pets.find(p => p.id === state.selectedPetId) || null;
  };

  const getClickCoins = () => {
    return calculateClickCoins(state.upgrades);
  };

  const getUpgradeCost = (upgradeType) => {
    const upgrade = state.upgrades[upgradeType];
    if (!upgrade) return 0;
    return calculateUpgradeCost(upgrade.baseCost, upgrade.level);
  };

  const getFoodPrice = (itemType, itemName) => {
    const item = state.inventory[itemType]?.[itemName];
    if (!item) return 0;
    return calculateFoodPrice(item.basePrice, item.level);
  };

  const getFoodUpgradeCost = (itemType, itemName) => {
    const item = state.inventory[itemType]?.[itemName];
    if (!item) return 0;
    return calculateFoodUpgradeCost(item.basePrice, item.level);
  };

  const getJobCost = (jobType, petId) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return 0;
    const currentLevel = pet.jobs[jobType]?.level || 0;
    return calculateJobCost(jobType, currentLevel);
  };

  const getJobEarnPerMinute = (jobType, petId) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return 0;
    const level = pet.jobs[jobType]?.level || 0;
    return calculateJobEarnPerMinute(jobType, level);
  };

  // 특수 활동 시작
  const startSpecialActivity = (petId, activityType, duration = 5000) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet || pet.state === 'sleep') return;
    
    dispatch({ 
      type: ActionTypes.SPECIAL_ACTIVITY, 
      payload: { petId, activityType } 
    });
    
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      dispatch({
        type: ActionTypes.UPDATE_ACTIVITY_PROGRESS,
        payload: { petId, progress }
      });
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        dispatch({ type: ActionTypes.END_SPECIAL_ACTIVITY, payload: { petId } });
      }
    }, 100);
    
    activityTimers.current[petId] = progressInterval;
  };

  const actions = {
    addPet: (type, name) => dispatch({ 
      type: ActionTypes.ADD_PET, 
      payload: { type, name } 
    }),
    
    removePet: (petId) => dispatch({ 
      type: ActionTypes.REMOVE_PET, 
      payload: { petId } 
    }),
    
    selectPet: (petId) => dispatch({ 
      type: ActionTypes.SELECT_PET, 
      payload: { petId } 
    }),
    
    updatePetSettings: (petId, updates) => dispatch({
      type: ActionTypes.UPDATE_PET_SETTINGS,
      payload: { petId, updates }
    }),
    
    clickPet: (petId) => dispatch({
      type: ActionTypes.CLICK_PET,
      payload: { petId }
    }),
    
    feedPet: (petId, foodType = 'apple') => dispatch({ 
      type: ActionTypes.FEED_PET, 
      payload: { petId, foodType } 
    }),
    
    playWithPet: (petId, activityType) => {
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') return;
      
      const activity = activityType || 
        (pet.type === 'dog' ? 'walking' : 
         pet.type === 'cat' ? 'ribbon' : 'wheel');
      
      startSpecialActivity(petId, activity, 8000);
    },
    
    cleanPet: (petId) => dispatch({ 
      type: ActionTypes.CLEAN_PET, 
      payload: { petId } 
    }),
    
    healPet: (petId) => dispatch({ 
      type: ActionTypes.HEAL_PET, 
      payload: { petId } 
    }),
    
    sleepPet: (petId) => dispatch({ 
      type: ActionTypes.SLEEP_PET, 
      payload: { petId } 
    }),
    
    wakePet: (petId) => dispatch({ 
      type: ActionTypes.WAKE_PET, 
      payload: { petId } 
    }),
    
    upgrade: (upgradeType) => dispatch({
      type: ActionTypes.UPGRADE,
      payload: { upgradeType }
    }),
    
    upgradeFood: (itemType, itemName) => dispatch({
      type: ActionTypes.UPGRADE_FOOD,
      payload: { itemType, itemName }
    }),
    
    buyItem: (itemType, itemName) => dispatch({ 
      type: ActionTypes.BUY_ITEM, 
      payload: { itemType, itemName } 
    }),
    
    unlockJob: (petId, jobType) => dispatch({
      type: ActionTypes.UNLOCK_JOB,
      payload: { petId, jobType }
    }),
    
    upgradeJob: (petId, jobType) => dispatch({
      type: ActionTypes.UPGRADE_JOB,
      payload: { petId, jobType }
    }),
    
    startJob: (petId, jobType) => {
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || pet.state === 'sleep') {
        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: {
            message: '⚠️ 펫이 깨어있을 때만 알바를 할 수 있어요!',
            type: 'warning'
          }
        });
        return;
      }
      dispatch({ type: ActionTypes.START_JOB, payload: { petId, jobType } });
    },
    
    endJob: (petId) => dispatch({ 
      type: ActionTypes.END_JOB, 
      payload: { petId } 
    }),
    
    addCoins: (amount) => dispatch({ 
      type: ActionTypes.ADD_COINS, 
      payload: { amount } 
    }),
    
    notify: (message, type = 'info') => dispatch({ 
      type: ActionTypes.ADD_NOTIFICATION, 
      payload: { message, type } 
    }),
    
    removeNotification: (id) => dispatch({ 
      type: ActionTypes.REMOVE_NOTIFICATION, 
      payload: { id } 
    }),
    
    saveGame: () => {
      localStorage.setItem('tamagotchi_save', JSON.stringify(state));
    },
    
    resetGame: () => {
      isResetting.current = true;
      localStorage.removeItem('tamagotchi_save');
      localStorage.removeItem('tamagotchi_guest');
      sessionStorage.clear();
      window.location.reload();
    },
    
    recallPet: (petId) => {
      const pet = state.pets.find(p => p.id === petId);
      if (!pet || !pet.hasRunAway) return;
      
      const cost = calculateRecallCost(pet.growth.level);
      if (state.coins < cost) {
        dispatch({
          type: ActionTypes.ADD_NOTIFICATION,
          payload: {
            message: `⚠️ 코인이 부족해요! (필요: ${cost}🪙)`,
            type: 'warning'
          }
        });
        return;
      }
      
      dispatch({ type: ActionTypes.RECALL_PET, payload: { petId } });
      dispatch({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: {
          message: `🎉 ${pet.name}가 돌아왔어요! (-${cost}🪙)`,
          type: 'success'
        }
      });
    }
  };

  const getRecallCost = (petId) => {
    const pet = state.pets.find(p => p.id === petId);
    if (!pet) return 0;
    return calculateRecallCost(pet.growth.level);
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      dispatch, 
      actions, 
      getSelectedPet,
      getClickCoins,
      getUpgradeCost,
      getFoodPrice,
      getFoodUpgradeCost,
      getJobCost,
      getJobEarnPerMinute,
      getRecallCost,
      JOB_TYPES
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export default GameContext;
