import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Bookmark,
  Star,
  Clock,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FolderPlus,
  Folder,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';

const BookmarkManager = ({ isWidget = false }) => {
  const { api } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    title: '',
    url: '',
    description: '',
    folder: 'default',
    tags: ''
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchBookmarks();
    fetchRecentActivity();
  }, []);

  const fetchBookmarks = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockBookmarks = [
          {
            id: 1,
            title: '居酒屋 花まる - 店舗設定',
            url: '/stores/1',
            description: 'よく編集する店舗の設定画面',
            folder: 'stores',
            tags: ['設定', '居酒屋'],
            createdAt: new Date().toISOString(),
            lastVisited: new Date(Date.now() - 3600000).toISOString(),
            visitCount: 15
          },
          {
            id: 2,
            title: '月次レポート - 2024年12月',
            url: '/reports/monthly/202412',
            description: '12月の月次レポート詳細',
            folder: 'reports',
            tags: ['レポート', '月次'],
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            lastVisited: new Date(Date.now() - 1800000).toISOString(),
            visitCount: 8
          },
          {
            id: 3,
            title: 'システム設定 - API設定',
            url: '/system#api',
            description: 'APIキー管理画面',
            folder: 'system',
            tags: ['システム', 'API'],
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            lastVisited: new Date(Date.now() - 86400000).toISOString(),
            visitCount: 5
          },
          {
            id: 4,
            title: '収益分析 - 店舗別ランキング',
            url: '/revenue#ranking',
            description: '店舗別収益ランキング画面',
            folder: 'reports',
            tags: ['収益', '分析'],
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            lastVisited: new Date(Date.now() - 3600000 * 6).toISOString(),
            visitCount: 12
          }
        ];

        const mockFolders = [
          { id: 'stores', name: '店舗管理', count: 1, color: '#3b82f6' },
          { id: 'reports', name: 'レポート', count: 2, color: '#10b981' },
          { id: 'system', name: 'システム', count: 1, color: '#f59e0b' },
          { id: 'default', name: 'その他', count: 0, color: '#6b7280' }
        ];

        setBookmarks(mockBookmarks);
        setFolders(mockFolders);
        return;
      }

      // 本番API呼び出し
      const response = await api.get('/bookmarks');
      if (response.data.success) {
        setBookmarks(response.data.bookmarks);
        setFolders(response.data.folders);
      }
    } catch (error) {
      console.error('ブックマーク取得エラー:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        const mockActivity = [
          {
            id: 1,
            action: 'visited',
            target: '居酒屋 花まる - 店舗設定',
            timestamp: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 2,
            action: 'created',
            target: '月次レポート - 2024年12月',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 3,
            action: 'edited',
            target: 'システム設定 - API設定',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        setRecentActivity(mockActivity);
        return;
      }

      // 本番API呼び出し
      const response = await api.get('/activity/recent');
      if (response.data.success) {
        setRecentActivity(response.data.activity);
      }
    } catch (error) {
      console.error('履歴取得エラー:', error);
    }
  };

  const handleAddBookmark = async (e) => {
    e.preventDefault();
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        const bookmark = {
          id: Date.now(),
          ...newBookmark,
          tags: newBookmark.tags.split(',').map(tag => tag.trim()),
          createdAt: new Date().toISOString(),
          lastVisited: new Date().toISOString(),
          visitCount: 1
        };
        
        setBookmarks(prev => [bookmark, ...prev]);
        setNewBookmark({ title: '', url: '', description: '', folder: 'default', tags: '' });
        setShowAddForm(false);
        return;
      }

      // 本番API呼び出し
      const response = await api.post('/bookmarks', newBookmark);
      if (response.data.success) {
        setBookmarks(prev => [response.data.bookmark, ...prev]);
        setNewBookmark({ title: '', url: '', description: '', folder: 'default', tags: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('ブックマーク追加エラー:', error);
    }
  };

  const handleDeleteBookmark = async (id) => {
    if (!confirm('このブックマークを削除しますか？')) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
        return;
      }

      // 本番API呼び出し
      const response = await api.delete(`/bookmarks/${id}`);
      if (response.data.success) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
      }
    } catch (error) {
      console.error('ブックマーク削除エラー:', error);
    }
  };

  const handleVisitBookmark = async (bookmark) => {
    try {
      // 訪問回数を更新
      setBookmarks(prev => prev.map(b => 
        b.id === bookmark.id 
          ? { ...b, visitCount: b.visitCount + 1, lastVisited: new Date().toISOString() }
          : b
      ));

      // 履歴に追加
      setRecentActivity(prev => [{
        id: Date.now(),
        action: 'visited',
        target: bookmark.title,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);

      // ページ遷移
      if (bookmark.url.startsWith('http')) {
        window.open(bookmark.url, '_blank');
      } else {
        window.location.href = bookmark.url;
      }
    } catch (error) {
      console.error('ブックマーク訪問エラー:', error);
    }
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      if (selectedFolder !== 'all' && bookmark.folder !== selectedFolder) return false;
      if (searchQuery && !bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !bookmark.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited));

  const getActionIcon = (action) => {
    switch (action) {
      case 'visited': return <ExternalLink size={12} />;
      case 'created': return <Plus size={12} />;
      case 'edited': return <Edit size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'visited': return '訪問';
      case 'created': return '作成';
      case 'edited': return '編集';
      default: return action;
    }
  };

  if (isWidget) {
    // ウィジェット表示（ダッシュボード用）
    return (
      <div className="bookmarks-widget">
        <div className="widget-header">
          <h3>🔖 最近のブックマーク</h3>
          <button 
            className="btn-sm"
            onClick={() => window.location.href = '/bookmarks'}
          >
            すべて表示
          </button>
        </div>
        <div className="recent-bookmarks">
          {filteredBookmarks.slice(0, 5).map(bookmark => (
            <div key={bookmark.id} className="bookmark-item-small">
              <button
                className="bookmark-link"
                onClick={() => handleVisitBookmark(bookmark)}
              >
                <Bookmark size={14} />
                <span>{bookmark.title}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          ))}
          {filteredBookmarks.length === 0 && (
            <div className="empty-bookmarks">
              <Bookmark size={24} />
              <p>ブックマークがありません</p>
            </div>
          )}
        </div>
        <div className="recent-activity">
          <h4>最近の操作</h4>
          {recentActivity.slice(0, 3).map(activity => (
            <div key={activity.id} className="activity-item-small">
              {getActionIcon(activity.action)}
              <span>{getActionText(activity.action)}: {activity.target}</span>
              <span className="time">{new Date(activity.timestamp).toLocaleTimeString('ja-JP')}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // フルページ表示
  return (
    <div className="bookmark-manager">
      <div className="page-header">
        <h1>ブックマーク管理</h1>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} />
          新規ブックマーク
        </button>
      </div>

      {/* 検索・フィルター */}
      <div className="bookmark-controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="ブックマークを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="folder-filter">
          <Filter size={16} />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="folder-select"
          >
            <option value="all">すべてのフォルダ</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>
                {folder.name} ({folder.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* フォルダ一覧 */}
      <div className="folders-section">
        <h2>フォルダ</h2>
        <div className="folders-grid">
          {folders.map(folder => (
            <div 
              key={folder.id} 
              className={`folder-card ${selectedFolder === folder.id ? 'active' : ''}`}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <Folder size={24} style={{ color: folder.color }} />
              <div className="folder-info">
                <h4>{folder.name}</h4>
                <span>{folder.count}件</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ブックマーク一覧 */}
      <div className="bookmarks-section">
        <h2>ブックマーク ({filteredBookmarks.length}件)</h2>
        <div className="bookmarks-list">
          {filteredBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bookmark-card">
              <div className="bookmark-header">
                <h3 
                  className="bookmark-title"
                  onClick={() => handleVisitBookmark(bookmark)}
                >
                  <Bookmark size={16} />
                  {bookmark.title}
                  <ExternalLink size={14} />
                </h3>
                <div className="bookmark-actions">
                  <button className="action-btn">
                    <Edit size={14} />
                  </button>
                  <button 
                    className="action-btn danger"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="bookmark-content">
                <p className="bookmark-description">{bookmark.description}</p>
                <div className="bookmark-meta">
                  <span className="bookmark-url">{bookmark.url}</span>
                  <div className="bookmark-tags">
                    {bookmark.tags?.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bookmark-stats">
                <span>
                  <Clock size={12} />
                  最終訪問: {new Date(bookmark.lastVisited).toLocaleString('ja-JP')}
                </span>
                <span>
                  <Star size={12} />
                  {bookmark.visitCount}回訪問
                </span>
              </div>
            </div>
          ))}
          
          {filteredBookmarks.length === 0 && (
            <div className="empty-state">
              <Bookmark size={48} />
              <h3>ブックマークが見つかりません</h3>
              <p>検索条件を変更するか、新しいブックマークを作成してください</p>
            </div>
          )}
        </div>
      </div>

      {/* 新規ブックマーク追加フォーム */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>新規ブックマーク</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddBookmark} className="bookmark-form">
              <div className="form-group">
                <label>タイトル</label>
                <input
                  type="text"
                  value={newBookmark.title}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input"
                  placeholder="ブックマークのタイトル"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>URL</label>
                <input
                  type="text"
                  value={newBookmark.url}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, url: e.target.value }))}
                  className="form-input"
                  placeholder="/stores または https://example.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>説明</label>
                <textarea
                  value={newBookmark.description}
                  onChange={(e) => setNewBookmark(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea"
                  placeholder="このブックマークの説明"
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>フォルダ</label>
                  <select
                    value={newBookmark.folder}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, folder: e.target.value }))}
                    className="form-select"
                  >
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>タグ</label>
                  <input
                    type="text"
                    value={newBookmark.tags}
                    onChange={(e) => setNewBookmark(prev => ({ ...prev, tags: e.target.value }))}
                    className="form-input"
                    placeholder="タグ1, タグ2, タグ3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  <Bookmark size={18} />
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

export default BookmarkManager;