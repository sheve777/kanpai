import React from 'react';
import { Save, Copy, Eye, EyeOff } from 'lucide-react';

const LineSettingsTab = ({ data, onInputChange, onSave, saving, showApiKeys, onToggleKeyVisibility, onCopyToClipboard }) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>LINE設定</h2>
        <p>LINE Bot API の設定を管理します</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>Channel ID</label>
          <div className="input-with-action">
            <input
              type="text"
              value={data?.channelId || ''}
              onChange={(e) => onInputChange('lineSettings', 'channelId', e.target.value)}
              className="form-input"
            />
            <button
              className="action-btn"
              onClick={() => onCopyToClipboard(data?.channelId, 'Channel ID')}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="form-group">
          <label>Channel Secret</label>
          <div className="input-with-action">
            <input
              type={showApiKeys['channelSecret'] ? 'text' : 'password'}
              value={data?.channelSecret || ''}
              onChange={(e) => onInputChange('lineSettings', 'channelSecret', e.target.value)}
              className="form-input"
            />
            <button
              className="action-btn"
              onClick={() => onToggleKeyVisibility('channelSecret')}
            >
              {showApiKeys['channelSecret'] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Access Token</label>
          <div className="input-with-action">
            <input
              type={showApiKeys['accessToken'] ? 'text' : 'password'}
              value={data?.accessToken || ''}
              onChange={(e) => onInputChange('lineSettings', 'accessToken', e.target.value)}
              className="form-input"
            />
            <button
              className="action-btn"
              onClick={() => onToggleKeyVisibility('accessToken')}
            >
              {showApiKeys['accessToken'] ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Webhook URL</label>
          <div className="input-with-action">
            <input
              type="text"
              value={data?.webhookUrl || 'https://kanpai-plus.jp/api/line/webhook'}
              readOnly
              className="form-input"
              style={{ backgroundColor: '#f8fafc' }}
            />
            <button
              className="action-btn"
              onClick={() => onCopyToClipboard(data?.webhookUrl || 'https://kanpai-plus.jp/api/line/webhook', 'Webhook URL')}
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('lineSettings')}
          disabled={saving}
        >
          <Save size={18} />
          LINE設定を保存
        </button>
      </div>
    </div>
  );
};

export default LineSettingsTab;