import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Plus,
  Filter,
  Search,
  Edit3,
  Copy,
  Trash2,
  Calendar,
  Target,
  FileText,
  Settings,
  Bell,
  Zap,
  ChevronRight,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

const BroadcastMessage = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState('list'); // list, create, history
  const [broadcastData, setBroadcastData] = useState({
    target: {
      type: 'all', // all, plan, individual, region, status
      planIds: [],
      storeIds: [],
      regions: [],
      status: 'active'
    },
    message: {
      type: 'text', // text, template
      content: '',
      templateId: null
    },
    schedule: {
      immediate: true,
      datetime: null
    }
  });
  const [stores, setStores] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  const [selectedStores, setSelectedStores] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [sending, setSending] = useState(false);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モック一斉配信データを使用');
        
        const mockStores = [
          { id: 'store-001', name: '居酒屋 花まる 渋谷店', plan: 'standard', region: '東京都', status: 'active' },
          { id: 'store-002', name: '海鮮居酒屋 大漁丸', plan: 'pro', region: '東京都', status: 'active' },
          { id: 'store-003', name: '創作和食 風花', plan: 'entry', region: '神奈川県', status: 'active' },
          { id: 'store-004', name: '串焼き専門店 炭火屋', plan: 'standard', region: '大阪府', status: 'inactive' },
          { id: 'store-005', name: 'のんべえ横丁', plan: 'entry', region: '東京都', status: 'active' }
        ];

        const mockTemplates = [
          {
            id: 'template-001',
            name: 'システムメンテナンス通知',
            category: 'system',
            content: '【重要】システムメンテナンスのお知らせ\n\n平素よりkanpAIをご利用いただき、ありがとうございます。\n\n下記日程にてシステムメンテナンスを実施いたします。\n\n日時：{datetime}\n影響：一時的なサービス停止（約30分）\n\nご不便をおかけいたしますが、よろしくお願いいたします。'
          },
          {
            id: 'template-002', 
            name: '新機能リリース案内',
            category: 'feature',
            content: '🎉 新機能リリースのお知らせ\n\nkanpAIに新しい機能が追加されました！\n\n✨ 新機能：{feature_name}\n📅 リリース日：{release_date}\n\n詳細は管理画面よりご確認ください。\n今後ともkanpAIをよろしくお願いいたします。'
          },
          {
            id: 'template-003',
            name: '月次レポート配信完了',
            category: 'report', 
            content: '📊 月次レポートの配信が完了しました\n\n{month}月分のレポートをお送りしました。\n\n📈 売上分析\n🎯 予約状況\n💬 チャット分析\n\n詳細は管理画面からご確認ください。'
          }
        ];

        const mockHistory = [
          {
            id: 'broadcast-001',
            title: 'システムメンテナンス通知',
            target: { type: 'all', count: 12 },
            status: 'completed',
            sentAt: new Date(Date.now() - 86400000).toISOString(),
            results: { success: 12, failed: 0, total: 12 }
          },
          {
            id: 'broadcast-002', 
            title: '新機能リリース案内',
            target: { type: 'plan', plan: 'pro', count: 3 },
            status: 'completed',
            sentAt: new Date(Date.now() - 172800000).toISOString(),
            results: { success: 3, failed: 0, total: 3 }
          },
          {
            id: 'broadcast-003',
            title: '重要なお知らせ',
            target: { type: 'individual', count: 5 },
            status: 'failed',
            sentAt: new Date(Date.now() - 259200000).toISOString(),
            results: { success: 3, failed: 2, total: 5 }
          }
        ];

        setStores(mockStores);
        setTemplates(mockTemplates);
        setBroadcastHistory(mockHistory);
        setLoading(false);
        return;
      }

      // 本番API呼び出し
      const [storesRes, templatesRes, historyRes] = await Promise.all([
        api.get('/stores'),
        api.get('/broadcast/templates'),
        api.get('/broadcast/history')
      ]);

      setStores(storesRes.data.stores || []);
      setTemplates(templatesRes.data.templates || []);
      setBroadcastHistory(historyRes.data.history || []);
    } catch (error) {
      console.error('一斉配信データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetStores = () => {
    const { target } = broadcastData;
    
    switch (target.type) {
      case 'all':
        return stores.filter(store => store.status === 'active');
      case 'plan':
        return stores.filter(store => 
          target.planIds.includes(store.plan) && store.status === 'active'
        );
      case 'individual':
        return stores.filter(store => target.storeIds.includes(store.id));
      case 'region':
        return stores.filter(store => 
          target.regions.includes(store.region) && store.status === 'active'
        );
      case 'status':
        return stores.filter(store => store.status === target.status);
      default:
        return [];
    }
  };

  const handleSendButtonClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    try {
      setSending(true);
      const targetStores = getTargetStores();
      
      if (isLocalEnv) {
        console.log('📢 一斉配信シミュレーション:', {
          target: targetStores.length,
          message: broadcastData.message.content,
          schedule: broadcastData.schedule
        });
        
        // シミュレーション用の遅延
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`${targetStores.length}店舗に配信しました！（ローカル環境）`);
        setShowConfirmDialog(false);
        setActiveStep('list');
        fetchInitialData(); // 履歴を更新
        return;
      }

      const response = await api.post('/broadcast/send', {
        targetStoreIds: targetStores.map(store => store.id),
        message: broadcastData.message,
        schedule: broadcastData.schedule
      });

      if (response.data.success) {
        alert('配信が完了しました！');
        setShowConfirmDialog(false);
        setActiveStep('list');
        fetchInitialData();
      }
    } catch (error) {
      console.error('配信エラー:', error);
      alert('配信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const handleCancelSend = () => {
    setShowConfirmDialog(false);
  };

  const handleViewBroadcastDetail = (broadcast) => {
    if (isLocalEnv) {
      alert(`配信詳細表示:\n\nタイトル: ${broadcast.title}\n配信日時: ${new Date(broadcast.sentAt).toLocaleString('ja-JP')}\n対象: ${broadcast.target.count}店舗\nステータス: ${broadcast.status}\n成功: ${broadcast.results.success}件\n失敗: ${broadcast.results.failed}件`);
      return;
    }
    // 本番では詳細ページに遷移
    console.log('配信詳細表示:', broadcast);
  };

  const handleResendBroadcast = async (broadcast) => {
    const confirmMessage = `「${broadcast.title}」を再送信しますか？\n\n対象: ${broadcast.target.count}店舗\n\n※ 同じ内容で再度配信されます。`;
    
    if (window.confirm(confirmMessage)) {
      try {
        if (isLocalEnv) {
          console.log('📢 再送信シミュレーション:', broadcast);
          
          // シミュレーション用の遅延
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          alert(`再送信完了！\n\n「${broadcast.title}」\n対象: ${broadcast.target.count}店舗（ローカル環境）`);
          
          // 履歴を更新（新しい配信エントリを追加）
          const newBroadcast = {
            ...broadcast,
            id: `broadcast-${Date.now()}`,
            sentAt: new Date().toISOString(),
            status: 'completed'
          };
          
          setBroadcastHistory(prev => [newBroadcast, ...prev]);
          return;
        }
        
        // 本番では再送信API呼び出し
        const response = await api.post(`/broadcast/${broadcast.id}/resend`);
        if (response.data.success) {
          alert('再送信が完了しました！');
          fetchInitialData(); // 履歴を更新
        }
      } catch (error) {
        console.error('再送信エラー:', error);
        alert('再送信に失敗しました');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, label: '送信完了', className: 'status-success', color: 'var(--success-500)' };
      case 'failed':
        return { icon: AlertCircle, label: '送信失敗', className: 'status-error', color: 'var(--error-500)' };
      case 'pending':
        return { icon: Clock, label: '送信予定', className: 'status-pending', color: 'var(--warning-500)' };
      default:
        return { icon: Clock, label: '不明', className: 'status-unknown', color: 'var(--text-secondary)' };
    }
  };

  const getTargetTypeLabel = (target) => {
    switch (target.type) {
      case 'all': return '全店舗';
      case 'plan': return `${target.plan}プラン`;
      case 'individual': return '個別選択';
      case 'region': return '地域別';
      case 'status': return `${target.status}店舗`;
      default: return '不明';
    }
  };

  if (loading) {
    return (
      <div className="broadcast-loading">
        <div className="loading-spinner"></div>
        <p>一斉配信データを読み込み中...</p>
      </div>
    );
  }

  // ステップ別レンダリング
  if (activeStep === 'create') {
    return (
      <div className="broadcast-message">
        <div className="page-header">
          <button 
            className="back-button"
            onClick={() => setActiveStep('list')}
          >
            <ArrowLeft size={20} />
            一覧に戻る
          </button>
          <div className="header-content">
            <h1>📢 新規一斉配信</h1>
            <p>配信対象とメッセージを設定してください</p>
          </div>
        </div>

        {/* 配信作成フォーム */}
        <div className="broadcast-form">
          {/* 配信対象選択 */}
          <div className="form-section">
            <h2>🎯 配信対象選択</h2>
            <div className="target-options">
              <label className="target-option">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={broadcastData.target.type === 'all'}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    target: { ...prev.target, type: e.target.value }
                  }))}
                />
                <div className="option-content">
                  <Users size={20} />
                  <span>全店舗（アクティブのみ）</span>
                  <small>{stores.filter(s => s.status === 'active').length}店舗</small>
                </div>
              </label>

              <label className="target-option">
                <input
                  type="radio"
                  name="targetType"
                  value="plan"
                  checked={broadcastData.target.type === 'plan'}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    target: { ...prev.target, type: e.target.value }
                  }))}
                />
                <div className="option-content">
                  <Target size={20} />
                  <span>プラン別配信</span>
                  <small>サブスクプラン別</small>
                </div>
              </label>

              <label className="target-option">
                <input
                  type="radio"
                  name="targetType"
                  value="individual"
                  checked={broadcastData.target.type === 'individual'}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    target: { ...prev.target, type: e.target.value }
                  }))}
                />
                <div className="option-content">
                  <CheckCircle size={20} />
                  <span>個別選択</span>
                  <small>店舗を個別指定</small>
                </div>
              </label>
            </div>

            {/* プラン選択 */}
            {broadcastData.target.type === 'plan' && (
              <div className="plan-selection">
                <h3>対象プラン選択</h3>
                <div className="plan-checkboxes">
                  {['entry', 'standard', 'pro'].map(plan => (
                    <label key={plan} className="plan-checkbox">
                      <input
                        type="checkbox"
                        checked={broadcastData.target.planIds.includes(plan)}
                        onChange={(e) => {
                          const planIds = e.target.checked
                            ? [...broadcastData.target.planIds, plan]
                            : broadcastData.target.planIds.filter(p => p !== plan);
                          setBroadcastData(prev => ({
                            ...prev,
                            target: { ...prev.target, planIds }
                          }));
                        }}
                      />
                      <span className="plan-name">
                        {plan === 'entry' ? 'エントリー' : 
                         plan === 'standard' ? 'スタンダード' : 'プロ'}
                      </span>
                      <small>
                        {stores.filter(s => s.plan === plan && s.status === 'active').length}店舗
                      </small>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 個別店舗選択 */}
            {broadcastData.target.type === 'individual' && (
              <div className="store-selection">
                <h3>対象店舗選択</h3>
                <div className="store-list">
                  {stores.map(store => (
                    <label key={store.id} className="store-checkbox">
                      <input
                        type="checkbox"
                        checked={broadcastData.target.storeIds.includes(store.id)}
                        onChange={(e) => {
                          const storeIds = e.target.checked
                            ? [...broadcastData.target.storeIds, store.id]
                            : broadcastData.target.storeIds.filter(id => id !== store.id);
                          setBroadcastData(prev => ({
                            ...prev,
                            target: { ...prev.target, storeIds }
                          }));
                        }}
                      />
                      <div className="store-info">
                        <span className="store-name">{store.name}</span>
                        <small className="store-details">
                          {store.plan} | {store.region} | {store.status}
                        </small>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="target-summary">
              <strong>配信対象: {getTargetStores().length}店舗</strong>
            </div>
          </div>

          {/* メッセージ作成 */}
          <div className="form-section">
            <h2>💬 メッセージ作成</h2>
            
            <div className="message-type-tabs">
              <button
                className={`tab-btn ${broadcastData.message.type === 'text' ? 'active' : ''}`}
                onClick={() => setBroadcastData(prev => ({
                  ...prev,
                  message: { ...prev.message, type: 'text' }
                }))}
              >
                <Edit3 size={16} />
                テキスト入力
              </button>
              <button
                className={`tab-btn ${broadcastData.message.type === 'template' ? 'active' : ''}`}
                onClick={() => setBroadcastData(prev => ({
                  ...prev,
                  message: { ...prev.message, type: 'template' }
                }))}
              >
                <FileText size={16} />
                テンプレート
              </button>
            </div>

            {broadcastData.message.type === 'text' ? (
              <div className="text-input-section">
                <textarea
                  className="message-textarea"
                  placeholder="配信するメッセージを入力してください..."
                  value={broadcastData.message.content}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    message: { ...prev.message, content: e.target.value }
                  }))}
                  rows={8}
                />
                <div className="message-info">
                  <small>文字数: {broadcastData.message.content.length}/1000</small>
                </div>
              </div>
            ) : (
              <div className="template-selection">
                <div className="template-grid">
                  {templates.map(template => (
                    <div
                      key={template.id}
                      className={`template-card ${broadcastData.message.templateId === template.id ? 'selected' : ''}`}
                      onClick={() => setBroadcastData(prev => ({
                        ...prev,
                        message: {
                          ...prev.message,
                          templateId: template.id,
                          content: template.content
                        }
                      }))}
                    >
                      <h4>{template.name}</h4>
                      <small className="template-category">{template.category}</small>
                      <p className="template-preview">
                        {template.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
                
                {broadcastData.message.templateId && (
                  <div className="template-edit">
                    <h4>メッセージ編集</h4>
                    <textarea
                      className="message-textarea"
                      value={broadcastData.message.content}
                      onChange={(e) => setBroadcastData(prev => ({
                        ...prev,
                        message: { ...prev.message, content: e.target.value }
                      }))}
                      rows={8}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 送信設定 */}
          <div className="form-section">
            <h2>⏰ 送信設定</h2>
            <div className="schedule-options">
              <label className="schedule-option">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={broadcastData.schedule.immediate}
                  onChange={() => setBroadcastData(prev => ({
                    ...prev,
                    schedule: { immediate: true, datetime: null }
                  }))}
                />
                <div className="option-content">
                  <Zap size={20} />
                  <span>即座に送信</span>
                </div>
              </label>

              <label className="schedule-option">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={!broadcastData.schedule.immediate}
                  onChange={() => setBroadcastData(prev => ({
                    ...prev,
                    schedule: { immediate: false, datetime: new Date().toISOString().slice(0, 16) }
                  }))}
                />
                <div className="option-content">
                  <Calendar size={20} />
                  <span>送信予約</span>
                </div>
              </label>
            </div>

            {!broadcastData.schedule.immediate && (
              <div className="datetime-input">
                <input
                  type="datetime-local"
                  value={broadcastData.schedule.datetime || ''}
                  onChange={(e) => setBroadcastData(prev => ({
                    ...prev,
                    schedule: { ...prev.schedule, datetime: e.target.value }
                  }))}
                  className="form-input"
                />
              </div>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="form-actions">
            <button
              className="btn-secondary"
              onClick={() => setActiveStep('list')}
            >
              キャンセル
            </button>
            <button
              className="btn-primary"
              onClick={handleSendButtonClick}
              disabled={!broadcastData.message.content || getTargetStores().length === 0}
            >
              <Send size={16} />
              {broadcastData.schedule.immediate ? '送信する' : '送信予約'}
            </button>
          </div>
        </div>

        {/* 送信確認ダイアログ */}
        {showConfirmDialog && (
          <div className="confirmation-overlay">
            <div className="confirmation-dialog">
              <div className="dialog-header">
                <h3>📢 配信確認</h3>
                <p>以下の内容で配信を実行します。よろしいですか？</p>
              </div>
              
              <div className="dialog-content">
                <div className="confirm-section">
                  <h4>🎯 配信対象</h4>
                  <div className="confirm-detail">
                    <span className="detail-label">対象タイプ:</span>
                    <span className="detail-value">
                      {broadcastData.target.type === 'all' ? '全店舗（アクティブのみ）' :
                       broadcastData.target.type === 'plan' ? `プラン別（${broadcastData.target.planIds.join(', ')}）` :
                       broadcastData.target.type === 'individual' ? '個別選択' : '不明'}
                    </span>
                  </div>
                  <div className="confirm-detail">
                    <span className="detail-label">配信店舗数:</span>
                    <span className="detail-value highlight">{getTargetStores().length}店舗</span>
                  </div>
                </div>

                <div className="confirm-section">
                  <h4>💬 メッセージ内容</h4>
                  <div className="message-preview">
                    {broadcastData.message.content.substring(0, 200)}
                    {broadcastData.message.content.length > 200 && '...'}
                  </div>
                  <div className="confirm-detail">
                    <span className="detail-label">文字数:</span>
                    <span className="detail-value">{broadcastData.message.content.length}文字</span>
                  </div>
                </div>

                <div className="confirm-section">
                  <h4>⏰ 送信設定</h4>
                  <div className="confirm-detail">
                    <span className="detail-label">送信タイミング:</span>
                    <span className="detail-value">
                      {broadcastData.schedule.immediate ? 
                        '即座に送信' : 
                        `予約送信 (${new Date(broadcastData.schedule.datetime).toLocaleString('ja-JP')})`
                      }
                    </span>
                  </div>
                </div>

                {broadcastData.target.type === 'individual' && (
                  <div className="confirm-section">
                    <h4>📋 対象店舗一覧</h4>
                    <div className="target-stores-list">
                      {getTargetStores().slice(0, 5).map(store => (
                        <div key={store.id} className="target-store-item">
                          {store.name}
                        </div>
                      ))}
                      {getTargetStores().length > 5 && (
                        <div className="more-stores">
                          他 {getTargetStores().length - 5}店舗
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="dialog-actions">
                <button
                  className="btn-secondary"
                  onClick={handleCancelSend}
                  disabled={sending}
                >
                  キャンセル
                </button>
                <button
                  className="btn-primary"
                  onClick={handleConfirmSend}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      {broadcastData.schedule.immediate ? '送信実行' : '送信予約実行'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // メイン一覧画面
  return (
    <div className="broadcast-message">
      <div className="page-header">
        <div className="header-content">
          <h1>📢 一斉配信管理</h1>
          <p>全店舗への重要なお知らせやシステム通知を配信</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setActiveStep('create')}
          >
            <Plus size={18} />
            新規配信
          </button>
        </div>
      </div>

      {/* 配信統計サマリー（横一列） */}
      <div className="broadcast-summary-bar">
        <div className="summary-container">
          <div className="summary-title">📊 配信統計サマリー</div>
          <div className="summary-stats">
            <div className="summary-stat-item">
              <Send size={18} style={{ color: 'var(--info-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{broadcastHistory.length}</span>
                <span className="stat-label">総配信数</span>
              </div>
              <div className="stat-detail">
                <span>今月: {broadcastHistory.filter(b => new Date(b.sentAt).getMonth() === new Date().getMonth()).length}件</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <CheckCircle size={18} style={{ color: 'var(--success-500)' }} />
              <div className="stat-content">
                <span className="stat-value">
                  {broadcastHistory.filter(b => b.status === 'completed').length}
                </span>
                <span className="stat-label">配信成功</span>
              </div>
              <div className="stat-detail">
                <span>成功率: {broadcastHistory.length > 0 ? Math.round((broadcastHistory.filter(b => b.status === 'completed').length / broadcastHistory.length) * 100) : 0}%</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <Users size={18} style={{ color: 'var(--warning-500)' }} />
              <div className="stat-content">
                <span className="stat-value">{stores.filter(s => s.status === 'active').length}</span>
                <span className="stat-label">アクティブ店舗</span>
              </div>
              <div className="stat-detail">
                <span>総店舗: {stores.length}店舗</span>
              </div>
            </div>
            
            <div className="summary-stat-item">
              <AlertCircle size={18} style={{ color: 'var(--error-500)' }} />
              <div className="stat-content">
                <span className="stat-value">
                  {broadcastHistory.filter(b => b.status === 'failed').length}
                </span>
                <span className="stat-label">配信失敗</span>
              </div>
              <div className="stat-detail">
                <span>要確認: {broadcastHistory.filter(b => b.status === 'failed').length > 0 ? '有り' : '無し'}</span>
              </div>
            </div>
          </div>
          <div className="summary-actions">
            <span className="update-time">
              <Clock size={14} />
              最終更新: {new Date().toLocaleTimeString('ja-JP')}
            </span>
          </div>
        </div>
      </div>

      {/* 配信履歴テーブル */}
      <div className="broadcast-history-section">
        <h2>📋 配信履歴</h2>
        <div className="table-container">
          <table className="broadcast-table">
            <thead>
              <tr>
                <th>配信内容</th>
                <th>配信対象</th>
                <th>配信日時</th>
                <th>ステータス</th>
                <th>結果</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {broadcastHistory.map(broadcast => {
                const statusInfo = getStatusBadge(broadcast.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <tr key={broadcast.id}>
                    <td>
                      <div className="broadcast-title-cell">
                        <MessageSquare size={16} />
                        <span>{broadcast.title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="target-cell">
                        <span className="target-type">
                          {getTargetTypeLabel(broadcast.target)}
                        </span>
                        <small>{broadcast.target.count}店舗</small>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={12} />
                        <span>{new Date(broadcast.sentAt).toLocaleString('ja-JP')}</span>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={`status-badge compact ${statusInfo.className}`}
                        style={{ color: statusInfo.color }}
                      >
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      <div className="results-cell">
                        <span className="success-count">
                          成功: {broadcast.results.success}
                        </span>
                        {broadcast.results.failed > 0 && (
                          <span className="failed-count">
                            失敗: {broadcast.results.failed}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn primary" 
                          title="詳細表示"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBroadcastDetail(broadcast);
                          }}
                        >
                          <Eye size={14} />
                          詳細
                        </button>
                        <button 
                          className={`action-btn ${broadcast.status === 'failed' ? 'warning' : 'secondary'}`}
                          title={broadcast.status === 'failed' ? '配信に失敗しました - 再送信してください' : '再送信'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResendBroadcast(broadcast);
                          }}
                        >
                          <Copy size={14} />
                          {broadcast.status === 'failed' ? '再送信' : '再送信'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {broadcastHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state-cell">
                    <div className="empty-broadcast">
                      <Send size={48} />
                      <h3>配信履歴がありません</h3>
                      <p>「新規配信」ボタンから最初の配信を作成してください</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BroadcastMessage;