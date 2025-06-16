import React from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

const GoogleSettingsTab = ({ data, onInputChange, onSave, saving, showApiKeys, onToggleKeyVisibility }) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>Google Calendar設定</h2>
        <p>予約システムとGoogle Calendarの連携設定</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Calendar ID</label>
          <input
            type="text"
            value={data?.calendarId || ''}
            onChange={(e) => onInputChange('googleSettings', 'calendarId', e.target.value)}
            className="form-input"
            placeholder="store123@group.calendar.google.com"
          />
        </div>
        
        <div className="form-group">
          <label>Service Account Email</label>
          <input
            type="email"
            value={data?.serviceAccountEmail || ''}
            onChange={(e) => onInputChange('googleSettings', 'serviceAccountEmail', e.target.value)}
            className="form-input"
            placeholder="kanpai-service@project.iam.gserviceaccount.com"
          />
        </div>
        
        <div className="form-group full-width">
          <label>Private Key</label>
          <div className="input-with-action">
            <textarea
              value={showApiKeys['privateKey'] ? data?.privateKey || '' : '••••••••••••••••'}
              onChange={(e) => onInputChange('googleSettings', 'privateKey', e.target.value)}
              className="form-textarea"
              rows={4}
              placeholder="-----BEGIN PRIVATE KEY-----"
            />
            <button
              className="action-btn"
              onClick={() => onToggleKeyVisibility('privateKey')}
            >
              {showApiKeys['privateKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data?.autoCreateEvents || false}
              onChange={(e) => onInputChange('googleSettings', 'autoCreateEvents', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            予約を自動でカレンダーに追加
          </label>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data?.syncExistingEvents || false}
              onChange={(e) => onInputChange('googleSettings', 'syncExistingEvents', e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            既存の予約を同期
          </label>
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('googleSettings')}
          disabled={saving}
        >
          <Save size={18} />
          Google設定を保存
        </button>
      </div>
    </div>
  );
};

export default GoogleSettingsTab;