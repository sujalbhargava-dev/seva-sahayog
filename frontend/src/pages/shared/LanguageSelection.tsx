import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';
import './LanguageSelection.css';

const languages = [
  { id: 'en', code: 'EN', name: 'English', subtitle: 'Continue in English', color: '#374151', bg: '#f3f4f6' },
  { id: 'hi', code: 'HI', name: 'Hindi', subtitle: 'Hindi mein jaari rakhein', color: '#ca8a04', bg: '#fefce8' },
  { id: 'bn', code: 'BN', name: 'Bengali', subtitle: 'Bangla-y chaliye jaan', color: '#ef4444', bg: '#fef2f2' },
  { id: 'mr', code: 'MR', name: 'Marathi', subtitle: 'Marathi madhun continue kara', color: '#f97316', bg: '#fff7ed' },
  { id: 'ta', code: 'TA', name: 'Tamil', subtitle: 'Tamizhil thodarumgal', color: '#0d9488', bg: '#f0fdfa' },
  { id: 'te', code: 'TE', name: 'Telugu', subtitle: 'Teluguloki continue avvandi', color: '#3b82f6', bg: '#eff6ff' },
];

export default function LanguageSelection() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleContinue = () => {
    // In a real app, save the language preference here
    navigate('/landing');
  };

  return (
    <div className="language-page">
      {/* Header */}
      <div className="language-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} color="#1f2937" />
        </button>
        <h1>Choose Your Language</h1>
        <p>Apni Bhasha Mein, Apni Seva</p>
      </div>

      {/* Language List */}
      <div className="language-list-container">
        <div className="language-list">
          {languages.map((lang) => {
            const isSelected = selectedLanguage === lang.id;
            return (
              <div
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`language-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="language-info-wrapper">
                  <div 
                    className="language-avatar"
                    style={{ backgroundColor: lang.bg, color: lang.color }}
                  >
                    {lang.code}
                  </div>
                  <div>
                    <h3 className="language-name">
                      {lang.name}
                    </h3>
                    <p className="language-subtitle">
                      {lang.subtitle}
                    </p>
                  </div>
                </div>
                <div>
                  {isSelected ? (
                    <CheckCircle2 size={24} color="#008751" />
                  ) : (
                    <Circle size={24} color="#d1d5db" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="language-bottom-action">
        <button
          onClick={handleContinue}
          className="btn-continue"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
