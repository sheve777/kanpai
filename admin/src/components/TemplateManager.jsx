import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Copy,
  Save,
  Download,
  Upload,
  Star,
  Trash2,
  Edit,
  Plus,
  FileText,
  Settings,
  Store,
  Zap,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Tag
} from 'lucide-react';

const TemplateManager = () => {
  const { api } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'store',
    config: {},
    tags: ''
  });

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockTemplates = [
          {
            id: 1,
            name: '居酒屋標準設定',
            description: '一般的な居酒屋向けの基本設定テンプレート',
            category: 'store',
            config: {
              openHours: { start: '17:00', end: '24:00' },
              seatTypes: ['カウンター', 'テーブル', '座敷'],
              aiPersonality: 'フレンドリーで親しみやすい居酒屋スタッフ',
              autoReportSchedule: 'daily',
              lineGreeting: 'いらっしゃいませ！ご予約やお問い合わせはこちらから！',
              reservationRules: { maxPartySize: 8, advanceDays: 30 }
            },
            tags: ['居酒屋', '基本', 'おすすめ'],
            usageCount: 15,
            lastUsed: new Date(Date.now() - 86400000).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            isFavorite: true
          },
          {
            id: 2,
            name: '高級料亭設定',
            description: '高級料亭・会席料理店向けの設定テンプレート',
            category: 'store',
            config: {
              openHours: { start: '18:00', end: '22:00' },
              seatTypes: ['個室', '広間'],
              aiPersonality: '丁寧で上品な接客を心がける',
              autoReportSchedule: 'weekly',
              lineGreeting: 'お疲れ様でございます。ご予約承ります。',
              reservationRules: { maxPartySize: 12, advanceDays: 60 }
            },
            tags: ['料亭', '高級', '個室'],
            usageCount: 3,
            lastUsed: new Date(Date.now() - 86400000 * 7).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
            isFavorite: false
          },
          {
            id: 3,
            name: 'カジュアルダイニング',
            description: 'ファミリー向けカジュアルレストランの設定',
            category: 'store',
            config: {
              openHours: { start: '11:00', end: '22:00' },
              seatTypes: ['テーブル', 'ソファ席', 'キッズ席'],
              aiPersonality: '明るく元気で家族連れにも優しい',
              autoReportSchedule: 'daily',
              lineGreeting: 'こんにちは！ファミリーでのお食事はお任せください！',
              reservationRules: { maxPartySize: 6, advanceDays: 14 }
            },
            tags: ['ファミリー', 'カジュアル', 'ランチ'],
            usageCount: 8,
            lastUsed: new Date(Date.now() - 86400000 * 3).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
            isFavorite: false
          },
          {
            id: 4,
            name: 'レポート設定 - 詳細版',
            description: '詳細な分析を含む月次レポートテンプレート',
            category: 'report',
            config: {
              sections: ['売上分析', '顧客動向', 'AI対応履歴', '予約状況', '改善提案'],
              chartTypes: ['売上推移', '時間帯別予約', '人気メニュー'],
              frequency: 'monthly',
              recipients: ['manager@store.com'],
              autoGenerate: true
            },
            tags: ['月次', '詳細', '分析'],
            usageCount: 12,
            lastUsed: new Date(Date.now() - 86400000 * 2).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
            isFavorite: true
          },
          {
            id: 5,
            name: 'システム設定 - セキュア',
            description: 'セキュリティを重視したシステム設定テンプレート',
            category: 'system',
            config: {
              security: {
                sessionTimeout: 1800,
                requireTwoFactor: true,
                ipWhitelist: true
              },
              api: {
                rateLimitPerMinute: 60,
                enableLogging: true
              },
              backup: {
                schedule: 'daily',
                retention: 90,
                encryption: true
              }
            },
            tags: ['セキュリティ', '本番', '推奨'],
            usageCount: 5,
            lastUsed: new Date(Date.now() - 86400000 * 10).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
            isFavorite: false
          }
        ];
        
        setTemplates(mockTemplates);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/templates');
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        const template = {
          id: Date.now(),
          ...newTemplate,
          tags: newTemplate.tags.split(',').map(tag => tag.trim()),
          usageCount: 0,
          lastUsed: null,
          createdAt: new Date().toISOString(),
          isFavorite: false
        };
        
        setTemplates(prev => [template, ...prev]);
        setNewTemplate({ name: '', description: '', category: 'store', config: {}, tags: '' });
        setShowCreateForm(false);
        return;
      }

      // 本番API呼び出し
      const response = await api.post('/templates', newTemplate);
      if (response.data.success) {
        setTemplates(prev => [response.data.template, ...prev]);
        setNewTemplate({ name: '', description: '', category: 'store', config: {}, tags: '' });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('テンプレート作成エラー:', error);
    }
  };

  const handleApplyTemplate = async (template) => {
    if (!confirm(`テンプレート「${template.name}」を適用しますか？`)) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('テンプレート適用:', template);
        
        // 使用回数を更新
        setTemplates(prev => prev.map(t => 
          t.id === template.id 
            ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
            : t
        ));
        
        alert(`テンプレート「${template.name}」を適用しました！`);
        return;
      }

      // 本番API呼び出し
      const response = await api.post(`/templates/${template.id}/apply`);
      if (response.data.success) {
        alert('テンプレートを適用しました');
        fetchTemplates();
      }
    } catch (error) {
      console.error('テンプレート適用エラー:', error);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('このテンプレートを削除しますか？')) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        setTemplates(prev => prev.filter(template => template.id !== id));
        return;
      }

      // 本番API呼び出し
      const response = await api.delete(`/templates/${id}`);
      if (response.data.success) {
        setTemplates(prev => prev.filter(template => template.id !== id));
      }
    } catch (error) {
      console.error('テンプレート削除エラー:', error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        setTemplates(prev => prev.map(template => 
          template.id === id 
            ? { ...template, isFavorite: !template.isFavorite }
            : template
        ));
        return;
      }

      // 本番API呼び出し
      const response = await api.post(`/templates/${id}/favorite`);
      if (response.data.success) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('お気に入り更新エラー:', error);
    }
  };

  const exportTemplate = (template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${template.name}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const categories = [
    { id: 'all', label: 'すべて', icon: FileText },
    { id: 'store', label: '店舗設定', icon: Store },
    { id: 'report', label: 'レポート', icon: FileText },
    { id: 'system', label: 'システム', icon: Settings }
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'store': return Store;
      case 'report': return FileText;
      case 'system': return Settings;
      default: return FileText;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'store': return 'var(--info-500)';
      case 'report': return 'var(--success-500)';
      case 'system': return 'var(--warning-500)';
      default: return 'var(--text-secondary)';
    }
  };

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) return false;
    if (searchQuery && !template.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !template.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const favoriteTemplates = filteredTemplates.filter(t => t.isFavorite);
  const regularTemplates = filteredTemplates.filter(t => !t.isFavorite);

  if (loading) {
    return (
      <div className="template-manager-loading">
        <div className="loading-spinner"></div>
        <p>テンプレートを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="template-manager">
      <div className="page-header">
        <h1>設定テンプレート</h1>
        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => document.getElementById('template-import').click()}
          >
            <Upload size={18} />
            インポート
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={18} />
            新規テンプレート
          </button>
          <input
            id="template-import"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                // インポート処理（実装略）
                console.log('テンプレートインポート:', file.name);
              }
            }}
          />
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="template-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="テンプレートを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="category-filter">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <Icon size={16} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* お気に入りテンプレート */}
      {favoriteTemplates.length > 0 && (
        <div className="favorite-templates-section">
          <h2>⭐ お気に入りテンプレート</h2>
          <div className="templates-grid">
            {favoriteTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onApply={handleApplyTemplate}
                onDelete={handleDeleteTemplate}
                onToggleFavorite={toggleFavorite}
                onExport={exportTemplate}
                getCategoryIcon={getCategoryIcon}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>
        </div>
      )}

      {/* すべてのテンプレート */}
      <div className="all-templates-section">
        <h2>📋 テンプレート一覧 ({filteredTemplates.length}件)</h2>
        <div className="templates-grid">
          {regularTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={handleApplyTemplate}
              onDelete={handleDeleteTemplate}
              onToggleFavorite={toggleFavorite}
              onExport={exportTemplate}
              getCategoryIcon={getCategoryIcon}
              getCategoryColor={getCategoryColor}
            />
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="empty-state">
            <FileText size={48} />
            <h3>テンプレートが見つかりません</h3>
            <p>検索条件を変更するか、新しいテンプレートを作成してください</p>
          </div>
        )}
      </div>

      {/* 新規テンプレート作成フォーム */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新規テンプレート作成</h3>
              <button 
                className="modal-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateTemplate} className="template-form">
              <div className="form-row">
                <div className="form-group">
                  <label>テンプレート名</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    placeholder="テンプレート名"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>カテゴリ</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                    className="form-select"
                  >
                    <option value="store">店舗設定</option>
                    <option value="report">レポート</option>
                    <option value="system">システム</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  placeholder="このテンプレートの用途や特徴"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>設定内容 (JSON)</label>
                <textarea
                  value={JSON.stringify(newTemplate.config, null, 2)}
                  onChange={(e) => {
                    try {
                      const config = JSON.parse(e.target.value);
                      setNewTemplate(prev => ({ ...prev, config }));
                    } catch (error) {
                      // Invalid JSON - ignore
                    }
                  }}
                  className="form-textarea code"
                  placeholder='{"key": "value"}'
                  rows="8"
                />
              </div>
              
              <div className="form-group">
                <label>タグ</label>
                <input
                  type="text"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                  className="form-input"
                  placeholder="タグ1, タグ2, タグ3"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// テンプレートカードコンポーネント
const TemplateCard = ({ 
  template, 
  onApply, 
  onDelete, 
  onToggleFavorite, 
  onExport,
  getCategoryIcon,
  getCategoryColor
}) => {
  const CategoryIcon = getCategoryIcon(template.category);
  
  return (
    <div className="template-card">
      <div className="template-header">
        <div className="template-category">
          <CategoryIcon size={16} style={{ color: getCategoryColor(template.category) }} />
          <span>{template.category}</span>
        </div>
        <div className="template-actions">
          <button
            className={`favorite-btn ${template.isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(template.id)}
          >
            <Star size={16} fill={template.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            className="action-btn"
            onClick={() => onExport(template)}
            title="エクスポート"
          >
            <Download size={14} />
          </button>
          <button
            className="action-btn danger"
            onClick={() => onDelete(template.id)}
            title="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="template-content">
        <h3>{template.name}</h3>
        <p>{template.description}</p>
        
        <div className="template-tags">
          {template.tags?.map((tag, index) => (
            <span key={index} className="tag">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="template-stats">
        <div className="stat">
          <Zap size={12} />
          {template.usageCount}回使用
        </div>
        {template.lastUsed && (
          <div className="stat">
            <Clock size={12} />
            {new Date(template.lastUsed).toLocaleDateString('ja-JP')}
          </div>
        )}
      </div>
      
      <div className="template-footer">
        <button
          className="btn-primary full-width"
          onClick={() => onApply(template)}
        >
          <Copy size={16} />
          適用
        </button>
      </div>
    </div>
  );
};

export default TemplateManager;