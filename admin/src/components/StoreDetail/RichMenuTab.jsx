import React from 'react';
import { Palette, Menu as MenuIcon, Upload, Save, Send } from 'lucide-react';

const RichMenuTab = ({ data, onInputChange, onSave, onDeploy, saving }) => {
  const handleButtonChange = (buttonId, field, value) => {
    const updatedButtons = data?.buttons?.map(button => 
      button.id === buttonId ? { ...button, [field]: value } : button
    );
    onInputChange('richMenu', 'buttons', updatedButtons);
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>LINEリッチメニュー管理</h2>
        <p>お客様がLINEで利用するリッチメニューの設定</p>
      </div>
      
      {/* Rich Menu Preview */}
      <div className="richmenu-preview-section">
        <h3>リッチメニュープレビュー</h3>
        <div className="richmenu-preview">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="richmenu-grid" style={{
                backgroundColor: data?.design?.backgroundColor || '#D2691E'
              }}>
                {data?.buttons?.map((button) => (
                  <div 
                    key={button.id} 
                    className="richmenu-button"
                    style={{
                      color: data?.design?.textColor || '#FFFFFF'
                    }}
                  >
                    <div className="button-icon">{button.icon}</div>
                    <div className="button-text">{button.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rich Menu Configuration */}
      <div className="richmenu-config-section">
        <h3>リッチメニュー設定</h3>
        
        {/* Design Settings */}
        <div className="config-subsection">
          <h4>
            <Palette size={18} />
            デザイン設定
          </h4>
          <div className="design-grid">
            <div className="form-group">
              <label>背景色</label>
              <input
                type="color"
                value={data?.design?.backgroundColor || '#D2691E'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  backgroundColor: e.target.value
                })}
                className="color-input"
              />
            </div>
            <div className="form-group">
              <label>文字色</label>
              <input
                type="color"
                value={data?.design?.textColor || '#FFFFFF'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  textColor: e.target.value
                })}
                className="color-input"
              />
            </div>
            <div className="form-group">
              <label>アクセント色</label>
              <input
                type="color"
                value={data?.design?.accentColor || '#FFD700'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  accentColor: e.target.value
                })}
                className="color-input"
              />
            </div>
          </div>
        </div>

        {/* Button Configuration */}
        <div className="config-subsection">
          <h4>
            <MenuIcon size={18} />
            ボタン設定
          </h4>
          <div className="buttons-config">
            {data?.buttons?.map((button) => (
              <div key={button.id} className="button-config-card">
                <div className="button-config-header">
                  <span className="button-icon-preview">{button.icon}</span>
                  <span className="button-name">{button.text}</span>
                </div>
                <div className="button-config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>ボタンテキスト</label>
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => handleButtonChange(button.id, 'text', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>アイコン</label>
                      <input
                        type="text"
                        value={button.icon}
                        onChange={(e) => handleButtonChange(button.id, 'icon', e.target.value)}
                        className="form-input"
                        placeholder="絵文字"
                      />
                    </div>
                  </div>
                  
                  {button.id === 'reserve' && (
                    <div className="business-hours-config">
                      <h5>営業時間連動設定</h5>
                      <div className="form-row">
                        <div className="form-group">
                          <label>営業時間内</label>
                          <select
                            value={button.businessHoursBehavior?.during || 'chatbot'}
                            onChange={(e) => handleButtonChange(button.id, 'businessHoursBehavior', {
                              ...button.businessHoursBehavior,
                              during: e.target.value
                            })}
                            className="form-select"
                          >
                            <option value="chatbot">チャットボット予約</option>
                            <option value="webform">Web予約フォーム</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>営業時間外</label>
                          <select
                            value={button.businessHoursBehavior?.outside || 'webform'}
                            onChange={(e) => handleButtonChange(button.id, 'businessHoursBehavior', {
                              ...button.businessHoursBehavior,
                              outside: e.target.value
                            })}
                            className="form-select"
                          >
                            <option value="webform">Web予約フォーム</option>
                            <option value="message">営業時間案内メッセージ</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {button.id === 'menu' && (
                    <div className="menu-pdf-config">
                      <h5>メニューPDF設定</h5>
                      <div className="file-upload-section">
                        <div className="current-file">
                          <span>現在のファイル: {button.menuPdf || 'なし'}</span>
                        </div>
                        <button className="btn-secondary">
                          <Upload size={16} />
                          PDFをアップロード
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rich Menu Analytics */}
      <div className="richmenu-analytics-section">
        <h3>リッチメニュー分析</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>総クリック数</h4>
            <div className="metric-value">{data?.analytics?.totalClicks?.toLocaleString() || '0'}</div>
          </div>
          <div className="analytics-card">
            <h4>コンバージョン率</h4>
            <div className="metric-value">{((data?.analytics?.conversionRate || 0) * 100).toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="button-analytics">
          <h4>ボタン別クリック数</h4>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>ボタン</th>
                <th>クリック数</th>
                <th>割合</th>
                <th>トレンド</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data?.analytics?.buttonClicks || {}).map(([buttonId, clicks]) => {
                const button = data?.buttons?.find(b => b.id === buttonId);
                const percentage = data?.analytics?.totalClicks ? 
                  (clicks / data.analytics.totalClicks * 100).toFixed(1) : 0;
                
                return (
                  <tr key={buttonId}>
                    <td>
                      <div className="button-analytics-cell">
                        <span className="button-icon">{button?.icon}</span>
                        <span>{button?.text}</span>
                      </div>
                    </td>
                    <td>{clicks.toLocaleString()}</td>
                    <td>
                      <div className="percentage-bar">
                        <div className="percentage-fill" style={{ width: `${percentage}%` }}></div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="trend-indicator">📈</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('richMenu')}
          disabled={saving}
        >
          <Save size={18} />
          リッチメニュー設定を保存
        </button>
        <button 
          className="btn-success"
          onClick={onDeploy}
          disabled={saving}
        >
          <Send size={18} />
          LINEに配信
        </button>
      </div>
    </div>
  );
};

export default RichMenuTab;