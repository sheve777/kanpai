import React from 'react';
import { Save } from 'lucide-react';

const BasicInfoTab = ({ data, onInputChange, onSave, saving }) => {
  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>基本情報</h2>
        <p>店舗の基本的な情報を管理します</p>
      </div>
      <div className="form-grid">
        <div className="form-group">
          <label>店舗名</label>
          <input
            type="text"
            value={data?.name || ''}
            onChange={(e) => onInputChange('basicInfo', 'name', e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>電話番号</label>
          <input
            type="tel"
            value={data?.phone || ''}
            onChange={(e) => onInputChange('basicInfo', 'phone', e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group full-width">
          <label>住所</label>
          <input
            type="text"
            value={data?.address || ''}
            onChange={(e) => onInputChange('basicInfo', 'address', e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group full-width">
          <label>コンセプト</label>
          <textarea
            value={data?.concept || ''}
            onChange={(e) => onInputChange('basicInfo', 'concept', e.target.value)}
            className="form-textarea"
            rows={3}
          />
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('basicInfo')}
          disabled={saving}
        >
          <Save size={18} />
          基本情報を保存
        </button>
      </div>
    </div>
  );
};

export default BasicInfoTab;