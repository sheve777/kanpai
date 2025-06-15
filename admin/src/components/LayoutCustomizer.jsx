import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Layout,
  Grid,
  Move,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Settings,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Copy,
  Trash2
} from 'lucide-react';

// デフォルトレイアウトを先に定義
const getDefaultLayout = () => ({
  sections: [
    {
      id: 'stats',
      type: 'stats-cards',
      title: '統計カード',
      visible: true,
      order: 0,
      size: 'full',
      config: {
        columns: 4,
        showTrends: true
      }
    },
    {
      id: 'favorites',
      type: 'favorite-stores',
      title: 'お気に入り店舗',
      visible: true,
      order: 1,
      size: 'third',
      config: {
        maxItems: 3
      }
    },
    {
      id: 'todos',
      type: 'todo-list',
      title: '今日やるべきこと',
      visible: true,
      order: 2,
      size: 'third',
      config: {
        showPriority: true,
        maxItems: 5
      }
    },
    {
      id: 'bookmarks',
      type: 'bookmarks',
      title: 'ブックマーク',
      visible: true,
      order: 3,
      size: 'third',
      config: {
        showRecent: true,
        maxItems: 5
      }
    },
    {
      id: 'hourly-chart',
      type: 'hourly-chart',
      title: '時間帯別利用状況',
      visible: true,
      order: 4,
      size: 'full',
      config: {
        height: 250,
        showLegend: true
      }
    },
    {
      id: 'store-health',
      type: 'store-health',
      title: '店舗別健康状態',
      visible: true,
      order: 5,
      size: 'full',
      config: {
        showMetrics: true,
        columns: 2
      }
    },
    {
      id: 'alerts',
      type: 'system-alerts',
      title: 'システム通知',
      visible: true,
      order: 6,
      size: 'half',
      config: {
        maxItems: 3,
        showTime: true
      }
    },
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'クイックアクション',
      visible: true,
      order: 7,
      size: 'half',
      config: {
        layout: 'grid'
      }
    }
  ]
});

const getCompactLayout = () => ({
  sections: [
    {
      id: 'stats',
      type: 'stats-cards',
      title: '統計カード',
      visible: true,
      order: 0,
      size: 'full',
      config: { columns: 6, showTrends: false }
    },
    {
      id: 'combined',
      type: 'combined-widget',
      title: 'ダッシュボード',
      visible: true,
      order: 1,
      size: 'full',
      config: { 
        widgets: ['favorites', 'todos', 'bookmarks', 'alerts'],
        columns: 4
      }
    },
    {
      id: 'store-health',
      type: 'store-health',
      title: '店舗状態',
      visible: true,
      order: 2,
      size: 'full',
      config: { showMetrics: false, columns: 3 }
    }
  ]
});

const getSimpleLayout = () => ({
  sections: [
    {
      id: 'stats',
      type: 'stats-cards',
      title: '統計',
      visible: true,
      order: 0,
      size: 'full',
      config: { columns: 2, showTrends: false }
    },
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'アクション',
      visible: true,
      order: 1,
      size: 'full',
      config: { layout: 'list' }
    }
  ]
});

const LayoutCustomizer = ({ onLayoutChange, currentLayout }) => {
  const { api } = useAuth();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layout, setLayout] = useState(currentLayout || getDefaultLayout());
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [layoutName, setLayoutName] = useState('');

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    loadSavedLayouts();
  }, []);

  const loadSavedLayouts = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockLayouts = [
          {
            id: 1,
            name: 'デフォルト',
            description: '標準的なレイアウト',
            layout: getDefaultLayout(),
            isDefault: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'コンパクト',
            description: '情報を詰め込んだレイアウト',
            layout: getCompactLayout(),
            isDefault: false,
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            name: 'シンプル',
            description: '必要最小限の情報のみ',
            layout: getSimpleLayout(),
            isDefault: false,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
          }
        ];
        
        setSavedLayouts(mockLayouts);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/layout/saved');
      if (response.data.success) {
        setSavedLayouts(response.data.layouts);
      }
    } catch (error) {
      console.error('レイアウト取得エラー:', error);
    }
  };


  const handleMoveWidget = (widgetId, direction) => {
    setLayout(prev => {
      const sections = [...prev.sections];
      const currentIndex = sections.findIndex(s => s.id === widgetId);
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (targetIndex >= 0 && targetIndex < sections.length) {
        // Swap orders
        const temp = sections[currentIndex].order;
        sections[currentIndex].order = sections[targetIndex].order;
        sections[targetIndex].order = temp;
        
        // Sort by order
        sections.sort((a, b) => a.order - b.order);
      }
      
      return { ...prev, sections };
    });
  };

  const handleToggleVisibility = (widgetId) => {
    setLayout(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === widgetId
          ? { ...section, visible: !section.visible }
          : section
      )
    }));
  };

  const handleSizeChange = (widgetId, newSize) => {
    setLayout(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === widgetId
          ? { ...section, size: newSize }
          : section
      )
    }));
  };

  const handleConfigChange = (widgetId, configKey, value) => {
    setLayout(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === widgetId
          ? { 
              ...section, 
              config: { ...section.config, [configKey]: value }
            }
          : section
      )
    }));
  };

  const handleSaveLayout = async () => {
    if (!layoutName.trim()) {
      alert('レイアウト名を入力してください');
      return;
    }

    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        const newLayout = {
          id: Date.now(),
          name: layoutName,
          description: `カスタムレイアウト - ${new Date().toLocaleDateString('ja-JP')}`,
          layout,
          isDefault: false,
          createdAt: new Date().toISOString()
        };
        
        setSavedLayouts(prev => [newLayout, ...prev]);
        setLayoutName('');
        setShowSaveDialog(false);
        alert('レイアウトを保存しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/layout/save', {
        name: layoutName,
        layout
      });
      
      if (response.data.success) {
        alert('レイアウトを保存しました');
        setLayoutName('');
        setShowSaveDialog(false);
        loadSavedLayouts();
      }
    } catch (error) {
      console.error('レイアウト保存エラー:', error);
      alert('レイアウトの保存に失敗しました');
    }
  };

  const handleLoadLayout = (savedLayout) => {
    setLayout(savedLayout.layout);
    setIsCustomizing(false);
    if (onLayoutChange) {
      onLayoutChange(savedLayout.layout);
    }
  };

  const handleApplyLayout = () => {
    setIsCustomizing(false);
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  const handleResetLayout = () => {
    if (confirm('レイアウトをデフォルトに戻しますか？')) {
      const defaultLayout = getDefaultLayout();
      setLayout(defaultLayout);
      if (onLayoutChange) {
        onLayoutChange(defaultLayout);
      }
    }
  };

  const sizeOptions = [
    { value: 'quarter', label: '1/4', width: '25%' },
    { value: 'third', label: '1/3', width: '33.33%' },
    { value: 'half', label: '1/2', width: '50%' },
    { value: 'two-thirds', label: '2/3', width: '66.66%' },
    { value: 'three-quarters', label: '3/4', width: '75%' },
    { value: 'full', label: '全幅', width: '100%' }
  ];

  const previewModes = [
    { id: 'desktop', label: 'デスクトップ', icon: Monitor, width: '100%' },
    { id: 'tablet', label: 'タブレット', icon: Tablet, width: '768px' },
    { id: 'mobile', label: 'モバイル', icon: Smartphone, width: '375px' }
  ];

  const getWidgetPreview = (section) => {
    const baseStyle = {
      width: sizeOptions.find(s => s.value === section.size)?.width || '100%',
      opacity: section.visible ? 1 : 0.5,
      minHeight: '120px',
      border: selectedWidget === section.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px',
      backgroundColor: section.visible ? '#ffffff' : '#f9fafb',
      cursor: 'pointer'
    };

    return (
      <div
        key={section.id}
        style={baseStyle}
        onClick={() => setSelectedWidget(section.id)}
        className="widget-preview"
      >
        <div className="widget-header">
          <h4>{section.title}</h4>
          <div className="widget-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMoveWidget(section.id, 'up');
              }}
              disabled={section.order === 0}
            >
              <ArrowUp size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMoveWidget(section.id, 'down');
              }}
              disabled={section.order === layout.sections.length - 1}
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(section.id);
              }}
            >
              {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>
        <div className="widget-content">
          <div className="widget-type">{section.type}</div>
          <div className="widget-size">サイズ: {sizeOptions.find(s => s.value === section.size)?.label}</div>
        </div>
      </div>
    );
  };

  if (!isCustomizing) {
    return (
      <div className="layout-customizer-trigger">
        <button
          className="customize-btn"
          onClick={() => setIsCustomizing(true)}
        >
          <Layout size={16} />
          レイアウトをカスタマイズ
        </button>
      </div>
    );
  }

  return (
    <div className="layout-customizer">
      <div className="customizer-header">
        <h2>レイアウトカスタマイザ</h2>
        <div className="header-actions">
          <div className="preview-mode-selector">
            {previewModes.map(mode => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  className={`preview-btn ${previewMode === mode.id ? 'active' : ''}`}
                  onClick={() => setPreviewMode(mode.id)}
                >
                  <Icon size={16} />
                  {mode.label}
                </button>
              );
            })}
          </div>
          
          <div className="action-buttons">
            <button
              className="btn-secondary"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save size={16} />
              保存
            </button>
            
            <button
              className="btn-secondary"
              onClick={handleResetLayout}
            >
              <RotateCcw size={16} />
              リセット
            </button>
            
            <button
              className="btn-primary"
              onClick={handleApplyLayout}
            >
              <Settings size={16} />
              適用
            </button>
            
            <button
              className="btn-ghost"
              onClick={() => setIsCustomizing(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>

      <div className="customizer-content">
        {/* 左パネル: 設定 */}
        <div className="customizer-sidebar">
          <div className="sidebar-section">
            <h3>保存済みレイアウト</h3>
            <div className="saved-layouts">
              {savedLayouts.map(savedLayout => (
                <div key={savedLayout.id} className="saved-layout-item">
                  <div className="layout-info">
                    <h4>{savedLayout.name}</h4>
                    <p>{savedLayout.description}</p>
                    {savedLayout.isDefault && (
                      <span className="default-badge">デフォルト</span>
                    )}
                  </div>
                  <div className="layout-actions">
                    <button
                      className="btn-sm"
                      onClick={() => handleLoadLayout(savedLayout)}
                    >
                      読み込み
                    </button>
                    {!savedLayout.isDefault && (
                      <button className="btn-sm danger">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedWidget && (
            <div className="sidebar-section">
              <h3>ウィジェット設定</h3>
              <div className="widget-settings">
                {(() => {
                  const widget = layout.sections.find(s => s.id === selectedWidget);
                  if (!widget) return null;

                  return (
                    <div>
                      <div className="form-group">
                        <label>サイズ</label>
                        <select
                          value={widget.size}
                          onChange={(e) => handleSizeChange(widget.id, e.target.value)}
                          className="form-select"
                        >
                          {sizeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={widget.visible}
                            onChange={() => handleToggleVisibility(widget.id)}
                          />
                          <span>表示する</span>
                        </label>
                      </div>

                      {/* ウィジェット固有の設定 */}
                      {widget.type === 'stats-cards' && (
                        <>
                          <div className="form-group">
                            <label>列数</label>
                            <input
                              type="number"
                              min="2"
                              max="6"
                              value={widget.config.columns || 4}
                              onChange={(e) => handleConfigChange(widget.id, 'columns', parseInt(e.target.value))}
                              className="form-input"
                            />
                          </div>
                          <div className="form-group">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={widget.config.showTrends || false}
                                onChange={(e) => handleConfigChange(widget.id, 'showTrends', e.target.checked)}
                              />
                              <span>トレンドを表示</span>
                            </label>
                          </div>
                        </>
                      )}

                      {widget.type === 'hourly-chart' && (
                        <div className="form-group">
                          <label>高さ (px)</label>
                          <input
                            type="number"
                            min="200"
                            max="500"
                            step="50"
                            value={widget.config.height || 250}
                            onChange={(e) => handleConfigChange(widget.id, 'height', parseInt(e.target.value))}
                            className="form-input"
                          />
                        </div>
                      )}

                      {(widget.type === 'todo-list' || widget.type === 'bookmarks' || widget.type === 'system-alerts') && (
                        <div className="form-group">
                          <label>最大表示数</label>
                          <input
                            type="number"
                            min="3"
                            max="10"
                            value={widget.config.maxItems || 5}
                            onChange={(e) => handleConfigChange(widget.id, 'maxItems', parseInt(e.target.value))}
                            className="form-input"
                          />
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* 右パネル: プレビュー */}
        <div className="customizer-preview">
          <div className="preview-container" style={{ maxWidth: previewModes.find(m => m.id === previewMode)?.width }}>
            <div className="preview-content">
              {layout.sections
                .sort((a, b) => a.order - b.order)
                .map(section => getWidgetPreview(section))}
            </div>
          </div>
        </div>
      </div>

      {/* 保存ダイアログ */}
      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>レイアウトを保存</h3>
              <button 
                className="modal-close"
                onClick={() => setShowSaveDialog(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>レイアウト名</label>
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="form-input"
                  placeholder="マイレイアウト"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowSaveDialog(false)}
              >
                キャンセル
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSaveLayout}
              >
                <Save size={16} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutCustomizer;