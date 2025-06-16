import React from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

const AISettingsTab = ({ data, onInputChange, onSave, saving, showApiKeys, onToggleKeyVisibility }) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>AI設定</h2>
        <p>チャットボットのAI設定を管理します</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>AI個性</label>
          <select
            value={data?.personality || 'friendly'}
            onChange={(e) => onInputChange('aiSettings', 'personality', e.target.value)}
            className="form-select"
          >
            <option value="friendly">フレンドリー</option>
            <option value="formal">丁寧</option>
            <option value="casual">カジュアル</option>
            <option value="professional">プロフェッショナル</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>言語スタイル</label>
          <select
            value={data?.tone || 'casual'}
            onChange={(e) => onInputChange('aiSettings', 'tone', e.target.value)}
            className="form-select"
          >
            <option value="casual">カジュアル</option>
            <option value="polite">丁寧語</option>
            <option value="business">ビジネス</option>
          </select>
        </div>
        
        <div className="form-group full-width">
          <label>カスタムプロンプト</label>
          <textarea
            value={data?.customPrompt || ''}
            onChange={(e) => onInputChange('aiSettings', 'customPrompt', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="お客様に親しみやすく、居酒屋らしい温かみのある対応をしてください。"
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data?.useCommonKey || true}
              onChange={(e) => onInputChange('aiSettings', 'useCommonKey', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            共通APIキーを使用
          </label>
        </div>
        
        {!data?.useCommonKey && (
          <div className="form-group full-width">
            <label>カスタムAPIキー</label>
            <div className="input-with-action">
              <input
                type={showApiKeys['customApiKey'] ? 'text' : 'password'}
                value={data?.customApiKey || ''}
                onChange={(e) => onInputChange('aiSettings', 'customApiKey', e.target.value)}
                className="form-input"
                placeholder="sk-..."
              />
              <button
                className="action-btn"
                onClick={() => onToggleKeyVisibility('customApiKey')}
              >
                {showApiKeys['customApiKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}
        
        <div className="form-group">
          <label>Temperature</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={data?.temperature || 0.7}
            onChange={(e) => onInputChange('aiSettings', 'temperature', parseFloat(e.target.value))}
            className="form-range"
          />
          <span>{data?.temperature || 0.7}</span>
        </div>
        
        <div className="form-group">
          <label>Max Tokens</label>
          <input
            type="number"
            value={data?.maxTokens || 1000}
            onChange={(e) => onInputChange('aiSettings', 'maxTokens', parseInt(e.target.value))}
            className="form-input"
            min="100"
            max="4000"
          />
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data?.enableAutoReply || true}
              onChange={(e) => onInputChange('aiSettings', 'enableAutoReply', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            自動返信を有効化
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data?.enableLearning || true}
              onChange={(e) => onInputChange('aiSettings', 'enableLearning', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            学習機能を有効化
          </label>
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('aiSettings')}
          disabled={saving}
        >
          <Save size={18} />
          AI設定を保存
        </button>
      </div>
    </div>
  );
};

export default AISettingsTab;