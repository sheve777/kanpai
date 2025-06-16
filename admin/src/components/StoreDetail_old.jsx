import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
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
  Upload,
  Download,
  Smartphone,
  Palette,
  BarChart3,
  FileText,
  RefreshCw,
  Send,
  Settings,
  Image,
  Menu as MenuIcon
} from 'lucide-react';

const StoreDetail = ({ storeId, onBack }) => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [editedData, setEditedData] = useState({});
  const [richMenuPreview, setRichMenuPreview] = useState(null);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    if (storeId) {
      fetchStoreDetails();
    }
  }, [storeId]);

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
          richMenu: {
            active: true,
            template: 'izakaya_standard',
            design: {
              backgroundColor: '#D2691E',
              textColor: '#FFFFFF',
              accentColor: '#FFD700'
            },
            buttons: [
              {
                id: 'reserve',
                position: { x: 0, y: 0 },
                text: '予約する',
                icon: '📅',
                action: 'chat_reserve',
                businessHoursBehavior: {
                  during: 'chatbot',
                  outside: 'webform'
                }
              },
              {
                id: 'chat',
                position: { x: 1, y: 0 },
                text: 'チャット',
                icon: '💬',
                action: 'chat',
                businessHoursBehavior: {
                  during: 'full_features',
                  outside: 'limited_mode'
                }
              },
              {
                id: 'menu',
                position: { x: 2, y: 0 },
                text: 'メニュー表',
                icon: '🍽️',
                action: 'show_menu',
                menuPdf: 'menu_2024_12.pdf'
              },
              {
                id: 'hours',
                position: { x: 0, y: 1 },
                text: '営業時間',
                icon: '🕐',
                action: 'show_hours',
                autoSync: true
              },
              {
                id: 'location',
                position: { x: 1, y: 1 },
                text: '店舗案内',
                icon: '📍',
                action: 'show_map'
              },
              {
                id: 'phone',
                position: { x: 2, y: 1 },
                text: '電話する',
                icon: '📞',
                action: 'call'
              }
            ],
            analytics: {
              totalClicks: 1234,
              buttonClicks: {
                reserve: 456,
                chat: 234,
                menu: 189,
                hours: 123,
                location: 98,
                phone: 134
              },
              conversionRate: 0.67
            }
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
              totalCost: 3456,
              richMenuClicks: 1234
            },
            limit: {
              apiCalls: 5000,
              lineMessages: 1000,
              reservations: 200,
              reports: 50
            }
          },
          reports: {
            monthlyPerformance: {
              revenue: 892000,
              reservations: 156,
              customers: 312,
              avgSpend: 5718
            },
            lineAnalytics: {
              totalMessages: 567,
              responseRate: 0.94,
              richMenuUsage: 1234,
              popularButtons: ['reserve', 'chat', 'menu']
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
    try {
      setSaving(true);
      
      // ローカル環境では保存をシミュレート
      if (isLocalEnv) {
        console.log('💾 保存データ（ローカルシミュレーション）:', {
          section,
          data: editedData[section]
        });
        
        alert(`${getSectionName(section)}を保存しました（ローカル環境）`);
        setSaving(false);
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
    }
  };

  const getSectionName = (section) => {
    const sectionNames = {
      basicInfo: '基本情報',
      lineSettings: 'LINE設定',
      richMenu: 'LINEリッチメニュー',
      googleSettings: 'Google設定',
      aiSettings: 'AI設定',
      usage: '利用状況',
      security: 'セキュリティ',
      reports: 'レポート'
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

  const handleRichMenuButtonChange = (buttonId, field, value) => {
    setEditedData(prev => ({
      ...prev,
      richMenu: {
        ...prev.richMenu,
        buttons: prev.richMenu.buttons.map(button => 
          button.id === buttonId ? { ...button, [field]: value } : button
        )
      }
    }));
  };

  const deployRichMenu = async () => {
    try {
      setSaving(true);
      
      if (isLocalEnv) {
        console.log('🚀 リッチメニューデプロイシミュレーション');
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert('リッチメニューをLINEに配信しました！');
        return;
      }
      
      const response = await api.post(`/stores/${storeId}/rich-menu/deploy`, editedData.richMenu);
      if (response.data.success) {
        alert('リッチメニューをLINEに配信しました');
        fetchStoreDetails();
      }
    } catch (error) {
      console.error('デプロイエラー:', error);
      alert('デプロイに失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '基本情報', icon: Store },
    { id: 'line', label: 'LINE設定', icon: MessageSquare },
    { id: 'richmenu', label: 'リッチメニュー', icon: Smartphone },
    { id: 'google', label: 'Google設定', icon: Calendar },
    { id: 'ai', label: 'AI設定', icon: Brain },
    { id: 'usage', label: '利用状況', icon: BarChart3 },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'reports', label: 'レポート', icon: FileText }
  ];

  if (loading) {
    return (
      <div className="store-detail-loading">
        <div className="loading-spinner"></div>
        <p>店舗情報を読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="store-detail">
      {/* Header */}
      <div className="page-header">
        <div className="header-nav">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            店舗管理に戻る
          </button>
          <div className="breadcrumb">
            店舗管理 &gt; {storeData?.basicInfo?.name || '店舗詳細'} &gt; 詳細管理
          </div>
        </div>
        <h1>
          <Store size={28} />
          {storeData?.basicInfo?.name || '店舗詳細管理'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
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
                  value={editedData.basicInfo?.name || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>電話番号</label>
                <input
                  type="tel"
                  value={editedData.basicInfo?.phone || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'phone', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group full-width">
                <label>住所</label>
                <input
                  type="text"
                  value={editedData.basicInfo?.address || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'address', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group full-width">
                <label>コンセプト</label>
                <textarea
                  value={editedData.basicInfo?.concept || ''}
                  onChange={(e) => handleInputChange('basicInfo', 'concept', e.target.value)}
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="panel-actions">
              <button 
                className="btn-primary"
                onClick={() => handleSave('basicInfo')}
                disabled={saving}
              >
                <Save size={18} />
                基本情報を保存
              </button>
            </div>
          </div>
        )}

        {/* Rich Menu Tab */}
        {activeTab === 'richmenu' && (
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
                      backgroundColor: editedData.richMenu?.design?.backgroundColor || '#D2691E'
                    }}>
                      {editedData.richMenu?.buttons?.map((button) => (
                        <div 
                          key={button.id} 
                          className="richmenu-button"
                          style={{
                            color: editedData.richMenu?.design?.textColor || '#FFFFFF'
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
                      value={editedData.richMenu?.design?.backgroundColor || '#D2691E'}
                      onChange={(e) => handleInputChange('richMenu', 'design', {
                        ...editedData.richMenu?.design,
                        backgroundColor: e.target.value
                      })}
                      className="color-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>文字色</label>
                    <input
                      type="color"
                      value={editedData.richMenu?.design?.textColor || '#FFFFFF'}
                      onChange={(e) => handleInputChange('richMenu', 'design', {
                        ...editedData.richMenu?.design,
                        textColor: e.target.value
                      })}
                      className="color-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>アクセント色</label>
                    <input
                      type="color"
                      value={editedData.richMenu?.design?.accentColor || '#FFD700'}
                      onChange={(e) => handleInputChange('richMenu', 'design', {
                        ...editedData.richMenu?.design,
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
                  {editedData.richMenu?.buttons?.map((button) => (
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
                              onChange={(e) => handleRichMenuButtonChange(button.id, 'text', e.target.value)}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label>アイコン</label>
                            <input
                              type="text"
                              value={button.icon}
                              onChange={(e) => handleRichMenuButtonChange(button.id, 'icon', e.target.value)}
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
                                  onChange={(e) => handleRichMenuButtonChange(button.id, 'businessHoursBehavior', {
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
                                  onChange={(e) => handleRichMenuButtonChange(button.id, 'businessHoursBehavior', {
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
                  <div className="metric-value">{editedData.richMenu?.analytics?.totalClicks?.toLocaleString() || '0'}</div>
                </div>
                <div className="analytics-card">
                  <h4>コンバージョン率</h4>
                  <div className="metric-value">{((editedData.richMenu?.analytics?.conversionRate || 0) * 100).toFixed(1)}%</div>
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
                    {Object.entries(editedData.richMenu?.analytics?.buttonClicks || {}).map(([buttonId, clicks]) => {
                      const button = editedData.richMenu?.buttons?.find(b => b.id === buttonId);
                      const percentage = editedData.richMenu?.analytics?.totalClicks ? 
                        (clicks / editedData.richMenu.analytics.totalClicks * 100).toFixed(1) : 0;
                      
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
                onClick={() => handleSave('richMenu')}
                disabled={saving}
              >
                <Save size={18} />
                リッチメニュー設定を保存
              </button>
              <button 
                className="btn-success"
                onClick={deployRichMenu}
                disabled={saving}
              >
                <Send size={18} />
                LINEに配信
              </button>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>店舗レポート</h2>
              <p>この店舗の詳細な分析レポート</p>
            </div>
            
            {/* Performance Summary */}
            <div className="report-summary">
              <div className="summary-cards">
                <div className="summary-card">
                  <h4>月間売上</h4>
                  <div className="summary-value">
                    ¥{(storeData?.reports?.monthlyPerformance?.revenue || 0).toLocaleString()}
                  </div>
                </div>
                <div className="summary-card">
                  <h4>予約数</h4>
                  <div className="summary-value">
                    {storeData?.reports?.monthlyPerformance?.reservations || 0}件
                  </div>
                </div>
                <div className="summary-card">
                  <h4>顧客数</h4>
                  <div className="summary-value">
                    {storeData?.reports?.monthlyPerformance?.customers || 0}人
                  </div>
                </div>
                <div className="summary-card">
                  <h4>客単価</h4>
                  <div className="summary-value">
                    ¥{(storeData?.reports?.monthlyPerformance?.avgSpend || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* LINE Analytics */}
            <div className="line-analytics-section">
              <h3>LINE分析</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>指標</th>
                    <th>値</th>
                    <th>前月比</th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>総メッセージ数</td>
                    <td>{storeData?.reports?.lineAnalytics?.totalMessages || 0}</td>
                    <td className="positive">+12.5%</td>
                    <td>送受信合計</td>
                  </tr>
                  <tr>
                    <td>応答率</td>
                    <td>{((storeData?.reports?.lineAnalytics?.responseRate || 0) * 100).toFixed(1)}%</td>
                    <td className="positive">+2.1%</td>
                    <td>AI自動応答率</td>
                  </tr>
                  <tr>
                    <td>リッチメニュー利用</td>
                    <td>{storeData?.reports?.lineAnalytics?.richMenuUsage || 0}</td>
                    <td className="positive">+18.3%</td>
                    <td>月間クリック数</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="panel-actions">
              <button className="btn-primary">
                <Download size={18} />
                PDFレポート出力
              </button>
              <button className="btn-secondary">
                <FileText size={18} />
                CSVデータ出力
              </button>
            </div>
          </div>
        )}

        {/* LINE Settings Tab */}
        {activeTab === 'line' && (
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
                    value={editedData.lineSettings?.channelId || ''}
                    onChange={(e) => handleInputChange('lineSettings', 'channelId', e.target.value)}
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                <div className="input-with-action">
                  <input
                    type="text"
                    value={editedData.lineSettings?.webhookUrl || 'https://kanpai-plus.jp/api/line/webhook'}
                    readOnly
                    className="form-input"
                    style={{ backgroundColor: '#f8fafc' }}
                  />
                  <button
                    className="action-btn"
                    onClick={() => copyToClipboard(editedData.lineSettings?.webhookUrl, 'Webhook URL')}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="panel-actions">
              <button 
                className="btn-primary"
                onClick={() => handleSave('lineSettings')}
                disabled={saving}
              >
                <Save size={18} />
                LINE設定を保存
              </button>
            </div>
          </div>
        )}

        {/* Google Settings Tab */}
        {activeTab === 'google' && (
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
                  value={editedData.googleSettings?.calendarId || ''}
                  onChange={(e) => handleInputChange('googleSettings', 'calendarId', e.target.value)}
                  className="form-input"
                  placeholder="store123@group.calendar.google.com"
                />
              </div>
              
              <div className="form-group">
                <label>Service Account Email</label>
                <input
                  type="email"
                  value={editedData.googleSettings?.serviceAccountEmail || ''}
                  onChange={(e) => handleInputChange('googleSettings', 'serviceAccountEmail', e.target.value)}
                  className="form-input"
                  placeholder="kanpai-service@project.iam.gserviceaccount.com"
                />
              </div>
              
              <div className="form-group full-width">
                <label>Private Key</label>
                <div className="input-with-action">
                  <textarea
                    value={showApiKeys['privateKey'] ? editedData.googleSettings?.privateKey || '' : '••••••••••••••••'}
                    onChange={(e) => handleInputChange('googleSettings', 'privateKey', e.target.value)}
                    className="form-textarea"
                    rows={4}
                    placeholder="-----BEGIN PRIVATE KEY-----"
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
                <label>
                  <input
                    type="checkbox"
                    checked={editedData.googleSettings?.autoCreateEvents || false}
                    onChange={(e) => handleInputChange('googleSettings', 'autoCreateEvents', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  予約時に自動でカレンダーイベントを作成
                </label>
              </div>
            </div>
            
            <div className="panel-actions">
              <button 
                className="btn-primary"
                onClick={() => handleSave('googleSettings')}
                disabled={saving}
              >
                <Save size={18} />
                Google設定を保存
              </button>
            </div>
          </div>
        )}

        {/* AI Settings Tab */}
        {activeTab === 'ai' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>AI設定</h2>
              <p>チャットボットの性格や応答設定を管理</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>性格設定</label>
                <select
                  value={editedData.aiSettings?.personality || 'friendly'}
                  onChange={(e) => handleInputChange('aiSettings', 'personality', e.target.value)}
                  className="form-select"
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
                  className="form-select"
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
                  className="form-textarea"
                  rows={4}
                  placeholder="AIの応答をカスタマイズするための追加指示..."
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editedData.aiSettings?.useCommonKey || false}
                    onChange={(e) => handleInputChange('aiSettings', 'useCommonKey', e.target.checked)}
                    style={{ marginRight: '8px' }}
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
                      className="form-input"
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
            
            <div className="panel-actions">
              <button 
                className="btn-primary"
                onClick={() => handleSave('aiSettings')}
                disabled={saving}
              >
                <Save size={18} />
                AI設定を保存
              </button>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>利用状況</h2>
              <p>この店舗の今月の利用状況とプラン詳細</p>
            </div>
            
            <div className="report-summary">
              <div className="summary-cards">
                <div className="summary-card">
                  <h4>API呼び出し</h4>
                  <div className="summary-value">
                    {storeData?.usage?.currentMonth?.apiCalls || 0} / {storeData?.usage?.limit?.apiCalls || 0}
                  </div>
                  <div className="usage-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(storeData?.usage?.currentMonth?.apiCalls / storeData?.usage?.limit?.apiCalls * 100) || 0}%`,
                          backgroundColor: '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="summary-card">
                  <h4>LINEメッセージ</h4>
                  <div className="summary-value">
                    {storeData?.usage?.currentMonth?.lineMessages || 0} / {storeData?.usage?.limit?.lineMessages || 0}
                  </div>
                  <div className="usage-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(storeData?.usage?.currentMonth?.lineMessages / storeData?.usage?.limit?.lineMessages * 100) || 0}%`,
                          backgroundColor: '#10b981'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="summary-card">
                  <h4>予約処理</h4>
                  <div className="summary-value">
                    {storeData?.usage?.currentMonth?.reservations || 0} / {storeData?.usage?.limit?.reservations || 0}
                  </div>
                  <div className="usage-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(storeData?.usage?.currentMonth?.reservations / storeData?.usage?.limit?.reservations * 100) || 0}%`,
                          backgroundColor: '#f59e0b'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="summary-card">
                  <h4>リッチメニュークリック</h4>
                  <div className="summary-value">
                    {storeData?.usage?.currentMonth?.richMenuClicks || 0}
                  </div>
                  <small>今月の総クリック数</small>
                </div>
              </div>
            </div>
            
            <div className="line-analytics-section">
              <h3>請求情報</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>項目</th>
                    <th>値</th>
                    <th>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>現在のプラン</td>
                    <td>{storeData?.billing?.plan || 'スタンダード'}</td>
                    <td>月額制プラン</td>
                  </tr>
                  <tr>
                    <td>月額料金</td>
                    <td>¥{(storeData?.billing?.monthlyFee || 0).toLocaleString()}</td>
                    <td>基本料金</td>
                  </tr>
                  <tr>
                    <td>次回請求日</td>
                    <td>{storeData?.billing?.nextBillingDate ? new Date(storeData.billing.nextBillingDate).toLocaleDateString('ja-JP') : '-'}</td>
                    <td>自動課金</td>
                  </tr>
                  <tr>
                    <td>支払方法</td>
                    <td>カード末尾 {storeData?.billing?.cardLast4 || '****'}</td>
                    <td>クレジットカード</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>セキュリティ設定</h2>
              <p>アクセス制限とセキュリティ管理</p>
            </div>
            
            <div className="line-analytics-section">
              <h3>セキュリティアクション</h3>
              <div className="summary-cards">
                <div className="summary-card">
                  <h4>
                    <Key size={20} style={{ marginBottom: '8px' }} />
                    APIキーの再生成
                  </h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                    LINE Channel Secretやアクセストークンを再生成します。
                  </p>
                  <button className="btn-secondary">
                    キーを再生成
                  </button>
                </div>
                
                <div className="summary-card">
                  <h4>
                    <Shield size={20} style={{ marginBottom: '8px' }} />
                    アクセス制限
                  </h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                    特定のIPアドレスからのみアクセスを許可します。
                  </p>
                  <button className="btn-secondary">
                    IP制限を設定
                  </button>
                </div>
                
                <div className="summary-card">
                  <h4>
                    <Download size={20} style={{ marginBottom: '8px' }} />
                    データエクスポート
                  </h4>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                    店舗の全データをJSON形式でエクスポートします。
                  </p>
                  <button className="btn-secondary">
                    データをエクスポート
                  </button>
                </div>
              </div>
              
              <h3 style={{ marginTop: '40px' }}>最近のアクティビティ</h3>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>アクション</th>
                    <th>日時</th>
                    <th>ステータス</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>LINE設定が更新されました</td>
                    <td>2024-12-20 15:30</td>
                    <td className="positive">成功</td>
                  </tr>
                  <tr>
                    <td>管理者がログインしました</td>
                    <td>2024-12-20 14:00</td>
                    <td className="positive">成功</td>
                  </tr>
                  <tr>
                    <td>API利用上限に近づいています</td>
                    <td>2024-12-19 18:45</td>
                    <td style={{ color: '#f59e0b', fontWeight: '600' }}>警告</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreDetail;