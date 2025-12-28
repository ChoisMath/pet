import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PET_COLOR_PALETTES } from '../../utils/petColors';
import DogSvg from '../pets/DogSvg';
import CatSvg from '../pets/CatSvg';
import HamsterSvg from '../pets/HamsterSvg';
import './SettingsModal.css';

const SettingsModal = ({ isOpen, onClose }) => {
  const { state, actions } = useGame();
  const [editingPetId, setEditingPetId] = useState(null);
  const [newName, setNewName] = useState('');

  if (!isOpen) return null;

  const handleEditPet = (pet) => {
    setEditingPetId(pet.id);
    setNewName(pet.name);
  };

  const handleSaveName = (petId) => {
    if (newName.trim()) {
      actions.updatePetSettings(petId, { name: newName.trim() });
    }
    setEditingPetId(null);
    setNewName('');
  };

  const handleColorChange = (petId, colorId) => {
    actions.updatePetSettings(petId, { colorId });
  };

  const renderPetPreview = (pet, colorId, size = 60) => {
    const props = { state: 'idle', mood: 'happy', size, colorId };
    switch (pet.type) {
      case 'dog': return <DogSvg {...props} />;
      case 'cat': return <CatSvg {...props} />;
      case 'hamster': return <HamsterSvg {...props} />;
      default: return <DogSvg {...props} />;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 펫 설정</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {state.pets.length === 0 ? (
            <div className="no-pets">펫이 없습니다. 먼저 펫을 입양하세요!</div>
          ) : (
            state.pets.map(pet => (
              <div key={pet.id} className="pet-settings-card">
                <div className="pet-preview">
                  {renderPetPreview(pet, pet.colorId || 'brown', 80)}
                </div>
                
                <div className="pet-settings-info">
                  <div className="name-section">
                    {editingPetId === pet.id ? (
                      <div className="name-edit">
                        <input
                          type="text"
                          value={newName}
                          onChange={e => setNewName(e.target.value)}
                          maxLength={10}
                          placeholder="이름 입력"
                          autoFocus
                        />
                        <button onClick={() => handleSaveName(pet.id)} className="save-btn">✓</button>
                        <button onClick={() => setEditingPetId(null)} className="cancel-btn">✕</button>
                      </div>
                    ) : (
                      <div className="name-display">
                        <span className="pet-name">{pet.name}</span>
                        <span className="pet-type">
                          {pet.type === 'dog' ? '🐶' : pet.type === 'cat' ? '🐱' : '🐹'}
                        </span>
                        <button onClick={() => handleEditPet(pet)} className="edit-btn">✏️</button>
                      </div>
                    )}
                  </div>

                  <div className="color-section">
                    <label>색상 선택:</label>
                    <div className="color-options">
                      {PET_COLOR_PALETTES[pet.type]?.map(color => (
                        <button
                          key={color.id}
                          className={`color-btn ${pet.colorId === color.id ? 'selected' : ''}`}
                          onClick={() => handleColorChange(pet.id, color.id)}
                          title={color.name}
                        >
                          <div 
                            className="color-preview"
                            style={{ backgroundColor: color.main }}
                          />
                          <span className="color-name">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <button className="confirm-btn" onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
