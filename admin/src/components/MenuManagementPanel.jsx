import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye
} from 'lucide-react';

const MenuManagementPanel = ({ storeId }) => {
  const { api } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const [notification, setNotification] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    is_recommended: false,
    is_available: true
  });

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  // 新規メニューフォームの初期値
  const [newMenuForm, setNewMenuForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    is_recommended: false,
    is_available: true
  });

  // カテゴリアイコンマッピング（フロントエンドと統一）
  const categoryIcons = {
    'ドリンク': '🍺',
    '揚げ物': '🍤',
    '焼き鳥': '🍗',
    '刺身': '🐟',
    'サラダ': '🥗',
    'ご飯物': '🍚',
    'デザート': '🍮',
    'おつまみ': '🥜',
    '麺類': '🍜',
    '鍋料理': '🍲'
  };

  useEffect(() => {
    fetchMenus();
  }, [storeId]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      
      if (isLocalEnv) {
        // ローカル環境ではモックデータを使用
        const mockMenus = [
          {
            id: 'menu-001',
            name: '生ビール',
            category: 'ドリンク',
            price: 500,
            description: 'キンキンに冷えた生ビール',
            is_recommended: true,
            is_available: true
          },
          {
            id: 'menu-002',
            name: '唐揚げ',
            category: '揚げ物',
            price: 600,
            description: 'ジューシーな鶏の唐揚げ',
            is_recommended: false,
            is_available: true
          },
          {
            id: 'menu-003',
            name: '焼き鳥盛り合わせ',
            category: '焼き鳥',
            price: 800,
            description: '串5本の盛り合わせ',
            is_recommended: true,
            is_available: true
          },
          {
            id: 'menu-004',
            name: '海鮮サラダ',
            category: 'サラダ',
            price: 650,
            description: '新鮮野菜とシーフードのサラダ',
            is_recommended: false,
            is_available: true
          },
          {
            id: 'menu-005',
            name: '親子丼',
            category: 'ご飯物',
            price: 750,
            description: 'ふわとろ卵の親子丼',
            is_recommended: true,
            is_available: true
          },
          {
            id: 'menu-006',
            name: '枝豆',
            category: 'おつまみ',
            price: 350,
            description: '塩茹でした枝豆',
            is_recommended: false,
            is_available: true
          },
          {
            id: 'menu-007',
            name: 'ラーメン',
            category: '麺類',
            price: 680,
            description: '醤油ベースのラーメン',
            is_recommended: false,
            is_available: true
          },
          {
            id: 'menu-008',
            name: 'もつ鍋',
            category: '鍋料理',
            price: 1200,
            description: '九州風もつ鍋（2人前）',
            is_recommended: true,
            is_available: true
          },
          {
            id: 'menu-009',
            name: 'アイスクリーム',
            category: 'デザート',
            price: 400,
            description: 'バニラアイスクリーム',
            is_recommended: false,
            is_available: true
          }
        ];
        setMenus(mockMenus);
      } else {
        const response = await api.get(`/api/stores/${storeId}/menus`);
        setMenus(response.data);
      }
    } catch (error) {
      console.error('メニュー取得エラー:', error);
      showNotification('メニューの取得に失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 通知表示
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // フィルタリング
  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         menu.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || menu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // カテゴリ一覧の取得
  const categories = [...new Set(menus.map(menu => menu.category))];

  // 新規メニュー追加
  const handleAddMenu = async (e) => {
    e.preventDefault();
    try {
      const menuData = {
        ...newMenuForm,
        price: parseInt(newMenuForm.price, 10)
      };

      if (isLocalEnv) {
        // ローカル環境ではモックで追加
        const newMenu = {
          id: `menu-${Date.now()}`,
          ...menuData
        };
        setMenus([newMenu, ...menus]);
        showNotification('メニューを追加しました');
      } else {
        const response = await api.post(`/api/stores/${storeId}/menus`, menuData);
        setMenus([response.data, ...menus]);
        showNotification('メニューを追加しました');
      }

      setNewMenuForm({
        name: '',
        category: '',
        price: '',
        description: '',
        is_recommended: false,
        is_available: true
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('メニュー追加エラー:', error);
      showNotification('メニューの追加に失敗しました', 'error');
    }
  };

  // 編集モーダルを開く
  const handleEditClick = (menu) => {
    setEditForm({
      name: menu.name,
      category: menu.category,
      price: menu.price.toString(),
      description: menu.description || '',
      is_recommended: menu.is_recommended,
      is_available: menu.is_available
    });
    setEditingMenu(menu);
  };

  // メニュー編集
  const handleEditMenu = async () => {
    if (!editingMenu) return;
    
    try {
      const menuData = {
        ...editForm,
        price: parseInt(editForm.price, 10)
      };

      if (isLocalEnv) {
        // ローカル環境ではモックで更新
        setMenus(menus.map(menu => 
          menu.id === editingMenu.id ? { ...menu, ...menuData } : menu
        ));
        showNotification('メニューを更新しました');
      } else {
        const response = await api.put(`/api/menus/${editingMenu.id}`, menuData);
        setMenus(menus.map(menu => 
          menu.id === editingMenu.id ? response.data : menu
        ));
        showNotification('メニューを更新しました');
      }
      setEditingMenu(null);
    } catch (error) {
      console.error('メニュー更新エラー:', error);
      showNotification('メニューの更新に失敗しました', 'error');
    }
  };

  // メニュー削除
  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('このメニューを削除しますか？')) return;

    try {
      if (isLocalEnv) {
        // ローカル環境ではモックで削除
        setMenus(menus.filter(menu => menu.id !== menuId));
        showNotification('メニューを削除しました');
      } else {
        await api.delete(`/api/menus/${menuId}`);
        setMenus(menus.filter(menu => menu.id !== menuId));
        showNotification('メニューを削除しました');
      }
    } catch (error) {
      console.error('メニュー削除エラー:', error);
      showNotification('メニューの削除に失敗しました', 'error');
    }
  };

  // JSONエクスポート
  const handleExportJson = () => {
    const exportData = {
      store_id: storeId,
      export_date: new Date().toISOString().split('T')[0],
      menus: menus.map(menu => ({
        name: menu.name,
        category: menu.category,
        price: menu.price,
        description: menu.description,
        is_recommended: menu.is_recommended,
        is_available: menu.is_available
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `menus-${storeId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('メニューデータをエクスポートしました');
  };

  // JSONインポート
  const handleImportJson = async () => {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.menus || !Array.isArray(importData.menus)) {
        throw new Error('無効なJSONフォーマットです');
      }

      // バリデーション
      for (const menu of importData.menus) {
        if (!menu.name || !menu.category || !menu.price) {
          throw new Error('必須フィールドが不足しています');
        }
      }

      if (isLocalEnv) {
        // ローカル環境ではモックでインポート
        const newMenus = importData.menus.map(menu => ({
          id: `menu-${Date.now()}-${Math.random()}`,
          ...menu
        }));
        setMenus([...newMenus, ...menus]);
        showNotification(`${importData.menus.length}件のメニューをインポートしました`);
      } else {
        // 本番環境では一括登録APIを呼び出し
        const response = await api.post(`/api/stores/${storeId}/menus/bulk`, {
          menus: importData.menus
        });
        await fetchMenus(); // 最新データを取得
        showNotification(`${importData.menus.length}件のメニューをインポートしました`);
      }

      setShowJsonModal(false);
      setJsonData('');
    } catch (error) {
      console.error('JSONインポートエラー:', error);
      showNotification(`インポートエラー: ${error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="menu-management-loading">
        <div className="loading-spinner"></div>
        <p>メニューデータを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="menu-management-panel">
      {/* 通知 */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {notification.message}
        </div>
      )}

      {/* ヘッダーアクション */}
      <div className="menu-header">
        <div className="search-filter">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="メニューを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">全カテゴリ</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {categoryIcons[category] || '🍽️'} {category}
              </option>
            ))}
          </select>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={handleExportJson}
            title="JSONエクスポート"
          >
            <Download size={16} />
            エクスポート
          </button>
          <button
            className="btn-secondary"
            onClick={() => setShowJsonModal(true)}
            title="JSONインポート"
          >
            <Upload size={16} />
            インポート
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            新規メニュー
          </button>
        </div>
      </div>

      {/* メニュー統計 */}
      <div className="menu-stats">
        <div className="stat-item">
          <span className="stat-label">総メニュー数</span>
          <span className="stat-value">{menus.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">おすすめメニュー</span>
          <span className="stat-value">{menus.filter(m => m.is_recommended).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">有効メニュー</span>
          <span className="stat-value">{menus.filter(m => m.is_available).length}</span>
        </div>
      </div>

      {/* メニュー一覧 */}
      <div className="menu-list">
        {filteredMenus.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>メニューがありません</h3>
            <p>新しいメニューを追加するか、検索条件を変更してください</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredMenus.map(menu => (
              <div key={menu.id} className="menu-card">
                <div className="menu-header">
                  <div className="menu-info">
                    <span className="category-icon">
                      {categoryIcons[menu.category] || '🍽️'}
                    </span>
                    <div>
                      <h4>{menu.name}</h4>
                      <span className="category">{menu.category}</span>
                    </div>
                  </div>
                  <div className="menu-actions">
                    <button
                      onClick={() => handleEditClick(menu)}
                      className="action-btn edit"
                      title="編集"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu.id)}
                      className="action-btn delete"
                      title="削除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="menu-content">
                  <div className="price">¥{menu.price.toLocaleString()}</div>
                  {menu.description && (
                    <div className="description">{menu.description}</div>
                  )}
                  <div className="menu-flags">
                    {menu.is_recommended && (
                      <span className="flag recommended">おすすめ</span>
                    )}
                    {!menu.is_available && (
                      <span className="flag unavailable">提供停止</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 新規メニューフォーム */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>新規メニュー追加</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddMenu} className="menu-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>メニュー名 *</label>
                  <input
                    type="text"
                    value={newMenuForm.name}
                    onChange={(e) => setNewMenuForm({...newMenuForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>カテゴリ *</label>
                  <select
                    value={newMenuForm.category}
                    onChange={(e) => setNewMenuForm({...newMenuForm, category: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    {Object.keys(categoryIcons).map(category => (
                      <option key={category} value={category}>
                        {categoryIcons[category]} {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>価格 *</label>
                  <input
                    type="number"
                    value={newMenuForm.price}
                    onChange={(e) => setNewMenuForm({...newMenuForm, price: e.target.value})}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group full-width">
                  <label>説明</label>
                  <textarea
                    value={newMenuForm.description}
                    onChange={(e) => setNewMenuForm({...newMenuForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newMenuForm.is_recommended}
                      onChange={(e) => setNewMenuForm({...newMenuForm, is_recommended: e.target.checked})}
                    />
                    おすすめメニューとして表示
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newMenuForm.is_available}
                      onChange={(e) => setNewMenuForm({...newMenuForm, is_available: e.target.checked})}
                    />
                    提供可能
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSONインポートモーダル */}
      {showJsonModal && (
        <div className="modal-overlay">
          <div className="modal-container large">
            <div className="modal-header">
              <h3>JSONインポート</h3>
              <button onClick={() => setShowJsonModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="json-import-content">
              <div className="import-instructions">
                <h4>インポート形式:</h4>
                <pre>{`{
  "store_id": "店舗ID",
  "export_date": "2024-12-18",
  "menus": [
    {
      "name": "メニュー名",
      "category": "カテゴリ",
      "price": 500,
      "description": "説明",
      "is_recommended": true,
      "is_available": true
    }
  ]
}`}</pre>
              </div>
              <div className="json-input">
                <label>JSONデータ</label>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder="JSONデータを貼り付けてください..."
                  rows={15}
                />
              </div>
              <div className="form-actions">
                <button onClick={() => setShowJsonModal(false)} className="btn-secondary">
                  キャンセル
                </button>
                <button onClick={handleImportJson} className="btn-primary">
                  <Upload size={16} />
                  インポート
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingMenu && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>メニューを編集</h3>
              <button onClick={() => setEditingMenu(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEditMenu(); }} className="menu-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>メニュー名 *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>カテゴリ *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    required
                  >
                    <option value="">選択してください</option>
                    {Object.keys(categoryIcons).map(category => (
                      <option key={category} value={category}>
                        {categoryIcons[category]} {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>価格 *</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group full-width">
                  <label>説明</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.is_recommended}
                      onChange={(e) => setEditForm({...editForm, is_recommended: e.target.checked})}
                    />
                    おすすめメニューとして表示
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editForm.is_available}
                      onChange={(e) => setEditForm({...editForm, is_available: e.target.checked})}
                    />
                    提供可能
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setEditingMenu(null)} className="btn-secondary">
                  キャンセル
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagementPanel;