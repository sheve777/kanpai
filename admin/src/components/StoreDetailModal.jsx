import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MenuManagementPanel from './MenuManagementPanel';
import {
  X,
  Store,
  Phone,
  MapPin,
  Clock,
  Key,
  MessageSquare,
  Calendar,
  Brain,
  CreditCard,
  Shield,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink,
  Menu,
  Edit
} from 'lucide-react';

const StoreDetailModal = ({ isOpen, onClose, storeId, mode = 'view' }) => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [editedData, setEditedData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    if (isOpen && storeId) {
      fetchStoreDetails();
    }
  }, [isOpen, storeId]);

  const fetchStoreDetails = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockStoreDetails = {
          basicInfo: {
            id: storeId,
            name: '居酒屋 花まる',
            phone: '03-1234-5678',
            address: '東京都渋谷区道玄坂1-2-3',
            concept: '新鮮な魚介類と日本酒が自慢のアットホームな居酒屋',
            operatingHours: {
              mon: { open: '17:00', close: '23:00' },
              tue: { open: '17:00', close: '23:00' },
              wed: { open: '17:00', close: '23:00' },
              thu: { open: '17:00', close: '23:00' },
              fri: { open: '17:00', close: '24:00' },
              sat: { open: '16:00', close: '24:00' },
              sun: { open: '16:00', close: '22:00' }
            },
            seatingCapacity: 45,
            plan: 'standard',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-12-20T15:30:00Z'
          },
          lineSettings: {
            channelId: '1234567890',
            channelSecret: 'abc123def456ghi789jkl012mno345pqr678',
            accessToken: 'CHANNEL_ACCESS_TOKEN_HERE_XXXXXXXXXXXXXXXXX',
            webhookUrl: 'https://kanpai-plus.jp/api/line/webhook',
            richMenuEnabled: true,
            autoReplyEnabled: true,
            broadcastEnabled: true
          },
          googleSettings: {
            calendarId: 'store123@group.calendar.google.com',
            serviceAccountEmail: 'kanpai-service@project.iam.gserviceaccount.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\nPRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----',
            timezone: 'Asia/Tokyo',
            autoCreateEvents: true,
            syncExistingEvents: false
          },
          aiSettings: {
            personality: 'friendly',
            tone: 'casual',
            language: 'ja',
            customPrompt: 'お客様に親しみやすく、居酒屋らしい温かみのある対応をしてください。',
            useCommonKey: true,
            customApiKey: '',
            enableAutoReply: true,
            enableLearning: true,
            temperature: 0.7,
            maxTokens: 1000
          },
          usage: {
            currentMonth: {
              apiCalls: 1234,
              lineMessages: 567,
              reservations: 89,
              reports: 12,
              totalCost: 3456
            },
            limit: {
              apiCalls: 5000,
              lineMessages: 1000,
              reservations: 200,
              reports: 50
            }
          },
          billing: {
            plan: 'standard',
            monthlyFee: 9800,
            nextBillingDate: '2025-01-01',
            paymentMethod: 'credit_card',
            cardLast4: '1234'
          }
        };
        
        setStoreData(mockStoreDetails);
        setEditedData(mockStoreDetails);
        setLoading(false);
        return;
      }
      
      // 本番APIから取得
      const response = await api.get(`/stores/${storeId}/details`);
      if (response.data.success) {
        setStoreData(response.data.store);
        setEditedData(response.data.store);
      }
    } catch (error) {
      console.error('店舗詳細取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    // 重要な変更には確認ダイアログを表示
    if (['lineSettings', 'googleSettings', 'aiSettings'].includes(section)) {
      setConfirmDialog({
        title: '設定変更の確認',
        message: `${getSectionName(section)}を変更しますか？この操作により、関連するサービスの動作に影響する可能性があります。`,
        storeName: storeData.basicInfo.name,
        onConfirm: () => performSave(section)
      });
    } else {
      performSave(section);
    }
  };

  const performSave = async (section) => {
    try {
      setSaving(true);
      
      // ローカル環境では保存をシミュレート
      if (isLocalEnv) {
        console.log('💾 保存データ（ローカルシミュレーション）:', {
          section,
          data: editedData[section]
        });
        
        // 成功メッセージ表示
        alert(`${getSectionName(section)}を保存しました（ローカル環境）`);
        setSaving(false);
        setConfirmDialog(null);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.patch(`/stores/${storeId}/${section}`, editedData[section]);
      if (response.data.success) {
        alert(`${getSectionName(section)}を保存しました`);
        fetchStoreDetails(); // 最新データを再取得
      }
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
      setConfirmDialog(null);
    }
  };

  const getSectionName = (section) => {
    const sectionNames = {
      basicInfo: '基本情報',
      lineSettings: 'LINE設定',
      googleSettings: 'Google設定',
      aiSettings: 'AI設定'
    };
    return sectionNames[section] || section;
  };

  const toggleKeyVisibility = (key) => {
    setShowApiKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label}をクリップボードにコピーしました`);
  };

  const handleInputChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // タブ定義 - 2025-01-19 更新
  const tabs = [
    { id: 'basic', label: '基本情報', icon: Store },
    { id: 'menus', label: 'メニュー管理', icon: Menu },
    { id: 'line', label: 'LINE設定', icon: MessageSquare },
    { id: 'google', label: 'Google設定', icon: Calendar },
    { id: 'ai', label: 'AI設定', icon: Brain },
    { id: 'usage', label: '利用状況', icon: CreditCard },
    { id: 'security', label: 'セキュリティ', icon: Shield }
  ];

  // デバッグ用ログ出力
  console.log('🔍 StoreDetailModal - tabs定義:', tabs);
  console.log('🔍 StoreDetailModal - activeTab:', activeTab);
  console.log('🔍 StoreDetailModal - isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container store-detail-modal" onClick={e => e.stopPropagation()}>
        {loading ? (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p>店舗情報を読み込み中...</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="modal-header">
              <h2>
                <Store size={24} />
                {storeData?.basicInfo?.name || '店舗詳細'}
              </h2>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="modal-content">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="tab-content">
                  <h3>基本情報</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>店舗名</label>
                      <input
                        type="text"
                        value={editedData.basicInfo?.name || ''}
                        onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="form-group">
                      <label>電話番号</label>
                      <input
                        type="tel"
                        value={editedData.basicInfo?.phone || ''}
                        onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>住所</label>
                      <input
                        type="text"
                        value={editedData.basicInfo?.address || ''}
                        onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>コンセプト</label>
                      <textarea
                        value={editedData.basicInfo?.concept || ''}
                        onChange={(e) => handleInputChange('basicInfo', 'concept', e.target.value)}
                        disabled={mode === 'view'}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  {mode === 'edit' && (
                    <div className="tab-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSave('basicInfo')}
                        disabled={saving}
                      >
                        <Save size={18} />
                        基本情報を保存
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Menu Management Tab */}
              {activeTab === 'menus' && (
                <div className="tab-content">
                  <h3>メニュー管理</h3>
                  <MenuManagementPanel storeId={storeId} />
                </div>
              )}

              {/* LINE Settings Tab */}
              {activeTab === 'line' && (
                <div className="tab-content">
                  <h3>LINE設定</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Channel ID</label>
                      <div className="input-with-action">
                        <input
                          type="text"
                          value={editedData.lineSettings?.channelId || ''}
                          onChange={(e) => handleInputChange('lineSettings', 'channelId', e.target.value)}
                          disabled={mode === 'view'}
                        />
                        <button
                          className="action-btn"
                          onClick={() => copyToClipboard(editedData.lineSettings?.channelId, 'Channel ID')}
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
                          value={editedData.lineSettings?.channelSecret || ''}
                          onChange={(e) => handleInputChange('lineSettings', 'channelSecret', e.target.value)}
                          disabled={mode === 'view'}
                        />
                        <button
                          className="action-btn"
                          onClick={() => toggleKeyVisibility('channelSecret')}
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
                          value={editedData.lineSettings?.accessToken || ''}
                          onChange={(e) => handleInputChange('lineSettings', 'accessToken', e.target.value)}
                          disabled={mode === 'view'}
                        />
                        <button
                          className="action-btn"
                          onClick={() => toggleKeyVisibility('accessToken')}
                        >
                          {showApiKeys['accessToken'] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Webhook URL</label>
                      <div className="info-box">
                        <code>{editedData.lineSettings?.webhookUrl || 'https://kanpai-plus.jp/api/line/webhook'}</code>
                        <button
                          className="action-btn"
                          onClick={() => copyToClipboard(editedData.lineSettings?.webhookUrl, 'Webhook URL')}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {mode === 'edit' && (
                    <div className="tab-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSave('lineSettings')}
                        disabled={saving}
                      >
                        <Save size={18} />
                        LINE設定を保存
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Google Settings Tab */}
              {activeTab === 'google' && (
                <div className="tab-content">
                  <h3>Google Calendar設定</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Calendar ID</label>
                      <input
                        type="text"
                        value={editedData.googleSettings?.calendarId || ''}
                        onChange={(e) => handleInputChange('googleSettings', 'calendarId', e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Service Account Email</label>
                      <input
                        type="email"
                        value={editedData.googleSettings?.serviceAccountEmail || ''}
                        onChange={(e) => handleInputChange('googleSettings', 'serviceAccountEmail', e.target.value)}
                        disabled={mode === 'view'}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Private Key</label>
                      <div className="input-with-action">
                        <textarea
                          value={showApiKeys['privateKey'] ? editedData.googleSettings?.privateKey || '' : '••••••••••••••••'}
                          onChange={(e) => handleInputChange('googleSettings', 'privateKey', e.target.value)}
                          disabled={mode === 'view'}
                          rows={4}
                        />
                        <button
                          className="action-btn"
                          onClick={() => toggleKeyVisibility('privateKey')}
                        >
                          {showApiKeys['privateKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editedData.googleSettings?.autoCreateEvents || false}
                          onChange={(e) => handleInputChange('googleSettings', 'autoCreateEvents', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        予約時に自動でカレンダーイベントを作成
                      </label>
                    </div>
                  </div>
                  
                  {mode === 'edit' && (
                    <div className="tab-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSave('googleSettings')}
                        disabled={saving}
                      >
                        <Save size={18} />
                        Google設定を保存
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AI Settings Tab */}
              {activeTab === 'ai' && (
                <div className="tab-content">
                  <h3>AI設定</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>性格設定</label>
                      <select
                        value={editedData.aiSettings?.personality || 'friendly'}
                        onChange={(e) => handleInputChange('aiSettings', 'personality', e.target.value)}
                        disabled={mode === 'view'}
                      >
                        <option value="friendly">フレンドリー</option>
                        <option value="professional">プロフェッショナル</option>
                        <option value="casual">カジュアル</option>
                        <option value="enthusiastic">元気</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>口調</label>
                      <select
                        value={editedData.aiSettings?.tone || 'casual'}
                        onChange={(e) => handleInputChange('aiSettings', 'tone', e.target.value)}
                        disabled={mode === 'view'}
                      >
                        <option value="polite">丁寧語</option>
                        <option value="casual">カジュアル</option>
                        <option value="friendly">フレンドリー</option>
                      </select>
                    </div>
                    
                    <div className="form-group full-width">
                      <label>カスタムプロンプト</label>
                      <textarea
                        value={editedData.aiSettings?.customPrompt || ''}
                        onChange={(e) => handleInputChange('aiSettings', 'customPrompt', e.target.value)}
                        disabled={mode === 'view'}
                        rows={4}
                        placeholder="AIの応答をカスタマイズするための追加指示..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editedData.aiSettings?.useCommonKey || false}
                          onChange={(e) => handleInputChange('aiSettings', 'useCommonKey', e.target.checked)}
                          disabled={mode === 'view'}
                        />
                        共通APIキーを使用
                      </label>
                    </div>
                    
                    {!editedData.aiSettings?.useCommonKey && (
                      <div className="form-group full-width">
                        <label>カスタムAPIキー</label>
                        <div className="input-with-action">
                          <input
                            type={showApiKeys['customApiKey'] ? 'text' : 'password'}
                            value={editedData.aiSettings?.customApiKey || ''}
                            onChange={(e) => handleInputChange('aiSettings', 'customApiKey', e.target.value)}
                            disabled={mode === 'view'}
                            placeholder="sk-..."
                          />
                          <button
                            className="action-btn"
                            onClick={() => toggleKeyVisibility('customApiKey')}
                          >
                            {showApiKeys['customApiKey'] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {mode === 'edit' && (
                    <div className="tab-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleSave('aiSettings')}
                        disabled={saving}
                      >
                        <Save size={18} />
                        AI設定を保存
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Usage Tab */}
              {activeTab === 'usage' && (
                <div className="tab-content">
                  <h3>今月の利用状況</h3>
                  <div className="usage-stats">
                    <div className="usage-card">
                      <h4>API呼び出し</h4>
                      <div className="usage-progress">
                        <div className="usage-numbers">
                          <span className="current">{storeData?.usage?.currentMonth?.apiCalls || 0}</span>
                          <span className="limit">/ {storeData?.usage?.limit?.apiCalls || 0}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(storeData?.usage?.currentMonth?.apiCalls / storeData?.usage?.limit?.apiCalls * 100) || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="usage-card">
                      <h4>LINEメッセージ</h4>
                      <div className="usage-progress">
                        <div className="usage-numbers">
                          <span className="current">{storeData?.usage?.currentMonth?.lineMessages || 0}</span>
                          <span className="limit">/ {storeData?.usage?.limit?.lineMessages || 0}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(storeData?.usage?.currentMonth?.lineMessages / storeData?.usage?.limit?.lineMessages * 100) || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="usage-card">
                      <h4>予約処理</h4>
                      <div className="usage-progress">
                        <div className="usage-numbers">
                          <span className="current">{storeData?.usage?.currentMonth?.reservations || 0}</span>
                          <span className="limit">/ {storeData?.usage?.limit?.reservations || 0}</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${(storeData?.usage?.currentMonth?.reservations / storeData?.usage?.limit?.reservations * 100) || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="billing-info">
                    <h4>請求情報</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>現在のプラン</label>
                        <span>{storeData?.billing?.plan || 'スタンダード'}</span>
                      </div>
                      <div className="info-item">
                        <label>月額料金</label>
                        <span>¥{(storeData?.billing?.monthlyFee || 0).toLocaleString()}</span>
                      </div>
                      <div className="info-item">
                        <label>次回請求日</label>
                        <span>{storeData?.billing?.nextBillingDate ? new Date(storeData.billing.nextBillingDate).toLocaleDateString('ja-JP') : '-'}</span>
                      </div>
                      <div className="info-item">
                        <label>支払方法</label>
                        <span>カード末尾 {storeData?.billing?.cardLast4 || '****'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <h3>セキュリティ設定</h3>
                  <div className="security-actions">
                    <div className="action-card">
                      <h4>
                        <Key size={20} />
                        APIキーの再生成
                      </h4>
                      <p>LINE Channel Secretやアクセストークンを再生成します。</p>
                      <button className="btn-secondary">
                        キーを再生成
                      </button>
                    </div>
                    
                    <div className="action-card">
                      <h4>
                        <Shield size={20} />
                        アクセス制限
                      </h4>
                      <p>特定のIPアドレスからのみアクセスを許可します。</p>
                      <button className="btn-secondary">
                        IP制限を設定
                      </button>
                    </div>
                    
                    <div className="action-card">
                      <h4>
                        <AlertTriangle size={20} />
                        データエクスポート
                      </h4>
                      <p>店舗の全データをJSON形式でエクスポートします。</p>
                      <button className="btn-secondary">
                        データをエクスポート
                      </button>
                    </div>
                  </div>
                  
                  <div className="activity-log">
                    <h4>最近のアクティビティ</h4>
                    <div className="log-entries">
                      <div className="log-entry">
                        <CheckCircle size={16} className="success" />
                        <span>LINE設定が更新されました</span>
                        <time>2024-12-20 15:30</time>
                      </div>
                      <div className="log-entry">
                        <CheckCircle size={16} className="success" />
                        <span>管理者がログインしました</span>
                        <time>2024-12-20 14:00</time>
                      </div>
                      <div className="log-entry">
                        <AlertTriangle size={16} className="warning" />
                        <span>API利用上限に近づいています</span>
                        <time>2024-12-19 18:45</time>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              {mode === 'view' && (
                <button className="btn-primary" onClick={() => {}}>
                  <Edit size={18} />
                  編集モード
                </button>
              )}
              <button className="btn-secondary" onClick={onClose}>
                閉じる
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>{confirmDialog.title}</h3>
            <p>{confirmDialog.message}</p>
            <div className="store-name-confirm">
              <label>確認のため店舗名を入力してください:</label>
              <input
                type="text"
                placeholder={confirmDialog.storeName}
                onChange={(e) => {
                  const input = e.target.value;
                  const confirmBtn = document.getElementById('confirm-btn');
                  if (input === confirmDialog.storeName) {
                    confirmBtn.disabled = false;
                  } else {
                    confirmBtn.disabled = true;
                  }
                }}
              />
            </div>
            <div className="dialog-actions">
              <button
                id="confirm-btn"
                className="btn-primary"
                disabled={true}
                onClick={confirmDialog.onConfirm}
              >
                変更を実行
              </button>
              <button
                className="btn-secondary"
                onClick={() => setConfirmDialog(null)}
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetailModal;