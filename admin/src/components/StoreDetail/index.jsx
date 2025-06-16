import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
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
  BarChart3,
  Smartphone
} from 'lucide-react';

// Import tab components
import BasicInfoTab from './BasicInfoTab';
import LineSettingsTab from './LineSettingsTab';
import GoogleSettingsTab from './GoogleSettingsTab';
import AISettingsTab from './AISettingsTab';
import UsageTab from './UsageTab';
import ReportsTab from './ReportsTab';
import BillingTab from './BillingTab';
import RichMenuTab from './RichMenuTab';

const StoreDetail = ({ storeId, onBack }) => {
  const { api } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [editedData, setEditedData] = useState({});

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  // Tab configuration
  const tabs = [
    { id: 'basic', label: '基本情報', icon: Store },
    { id: 'richmenu', label: 'リッチメニュー', icon: Smartphone },
    { id: 'line', label: 'LINE設定', icon: MessageSquare },
    { id: 'google', label: 'Google設定', icon: Calendar },
    { id: 'ai', label: 'AI設定', icon: Brain },
    { id: 'usage', label: '利用状況', icon: BarChart3 },
    { id: 'reports', label: 'レポート', icon: Shield },
    { id: 'billing', label: '請求情報', icon: CreditCard }
  ];

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
        console.log('🏠 ローカル環境：モック店舗詳細データを使用');
        
        const mockStoreDetails = {
          id: storeId,
          basicInfo: {
            name: '居酒屋 花まる 渋谷店',
            phone: '03-1234-5678',
            address: '東京都渋谷区渋谷1-1-1',
            concept: '新鮮な魚介と焼き鳥が自慢の居酒屋です。アットホームな雰囲気でお客様をお迎えします。'
          },
          lineSettings: {
            channelId: '1234567890',
            channelSecret: 'abcdef1234567890abcdef1234567890',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            webhookUrl: 'https://kanpai-plus.jp/api/line/webhook'
          },
          richMenu: {
            design: {
              backgroundColor: '#D2691E',
              textColor: '#FFFFFF',
              accentColor: '#FFD700'
            },
            buttons: [
              { id: 'reserve', text: '予約する', icon: '🍽️', businessHoursBehavior: { during: 'chatbot', outside: 'webform' } },
              { id: 'chat', text: 'チャット', icon: '💬' },
              { id: 'menu', text: 'メニュー', icon: '📋', menuPdf: 'menu_2024.pdf' },
              { id: 'access', text: 'アクセス', icon: '🗺️' },
              { id: 'phone', text: '電話', icon: '📞' },
              { id: 'news', text: 'お知らせ', icon: '📢' }
            ],
            analytics: {
              totalClicks: 1234,
              conversionRate: 0.67,
              buttonClicks: {
                reserve: 456,
                chat: 234,
                menu: 189,
                access: 123,
                phone: 134,
                news: 98
              }
            }
          },
          googleSettings: {
            calendarId: 'store123@group.calendar.google.com',
            serviceAccountEmail: 'kanpai-service@project.iam.gserviceaccount.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\\nPRIVATE_KEY_CONTENT_HERE\\n-----END PRIVATE KEY-----',
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

  const handleInputChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
        setStoreData(prev => ({ ...prev, [section]: editedData[section] }));
      }
    } catch (error) {
      console.error(`${section}保存エラー:`, error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const getSectionName = (section) => {
    const names = {
      basicInfo: '基本情報',
      lineSettings: 'LINE設定',
      googleSettings: 'Google設定',
      aiSettings: 'AI設定',
      richMenu: 'リッチメニュー設定'
    };
    return names[section] || section;
  };

  const toggleKeyVisibility = (keyName) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label}をクリップボードにコピーしました`);
  };

  const deployRichMenu = async () => {
    if (isLocalEnv) {
      alert('リッチメニューをLINEに配信しました（ローカル環境）');
      return;
    }
    // 本番API呼び出し
    try {
      const response = await api.post(`/stores/${storeId}/richmenu/deploy`);
      if (response.data.success) {
        alert('リッチメニューをLINEに配信しました');
      }
    } catch (error) {
      console.error('リッチメニュー配信エラー:', error);
      alert('配信に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="store-detail-loading">
        <div className="loading-spinner"></div>
        <p>店舗詳細を読み込み中...</p>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="store-detail-error">
        <p>店舗データが見つかりません</p>
        <button onClick={onBack} className="btn-secondary">戻る</button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            data={editedData.basicInfo}
            onInputChange={handleInputChange}
            onSave={handleSave}
            saving={saving}
          />
        );
      case 'line':
        return (
          <LineSettingsTab
            data={editedData.lineSettings}
            onInputChange={handleInputChange}
            onSave={handleSave}
            saving={saving}
            showApiKeys={showApiKeys}
            onToggleKeyVisibility={toggleKeyVisibility}
            onCopyToClipboard={copyToClipboard}
          />
        );
      case 'google':
        return (
          <GoogleSettingsTab
            data={editedData.googleSettings}
            onInputChange={handleInputChange}
            onSave={handleSave}
            saving={saving}
            showApiKeys={showApiKeys}
            onToggleKeyVisibility={toggleKeyVisibility}
          />
        );
      case 'ai':
        return (
          <AISettingsTab
            data={editedData.aiSettings}
            onInputChange={handleInputChange}
            onSave={handleSave}
            saving={saving}
            showApiKeys={showApiKeys}
            onToggleKeyVisibility={toggleKeyVisibility}
          />
        );
      case 'usage':
        return <UsageTab data={storeData.usage} />;
      case 'reports':
        return <ReportsTab data={storeData.reports} />;
      case 'billing':
        return <BillingTab data={storeData.billing} />;
      case 'richmenu':
        return (
          <RichMenuTab
            data={editedData.richMenu}
            onInputChange={handleInputChange}
            onSave={handleSave}
            onDeploy={deployRichMenu}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="store-detail">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          店舗一覧に戻る
        </button>
        <div className="store-info">
          <h1>{storeData.basicInfo?.name || '店舗詳細'}</h1>
          <p>{storeData.basicInfo?.address}</p>
        </div>
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
        {renderTabContent()}
      </div>
    </div>
  );
};

export default StoreDetail;