// C:\Users\acmsh\kanpAI\frontend\src\components\MenuList.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const MenuList = ({ storeId }) => {
    const [menus, setMenus] = useState([]);
    const [editingMenuId, setEditingMenuId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMenuData, setNewMenuData] = useState({ 
        name: '', 
        category: '', 
        price: '', 
        description: '' 
    });

    useEffect(() => {
        const fetchMenus = async () => {
            if (!storeId) return;
            try {
                const response = await api.get(`/api/stores/${storeId}/menus`);
                setMenus(response.data);
            } catch (error) { 
                console.error("メニューの取得に失敗しました:", error); 
            }
        };
        fetchMenus();
    }, [storeId]);

    const handleEditClick = (menu) => {
        setEditingMenuId(menu.id);
        setEditFormData({ 
            price: menu.price, 
            description: menu.description || '' 
        });
    };

    const handleCancelClick = () => {
        setEditingMenuId(null);
    };

    const handleEditFormChange = (e) => {
        setEditFormData({ 
            ...editFormData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSaveClick = async (menuId) => {
        try {
            const response = await api.put(`/api/menus/${menuId}`, {
                price: parseInt(editFormData.price, 10),
                description: editFormData.description
            });
            setMenus(menus.map(menu => 
                menu.id === response.data.id ? response.data : menu
            ));
            setEditingMenuId(null);
        } catch (error) {
            alert("メニューの更新に失敗しました。");
        }
    };

    const handleNewFormChange = (e) => {
        setNewMenuData({ 
            ...newMenuData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleAddNewMenu = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(`/api/stores/${storeId}/menus`, {
                ...newMenuData,
                price: parseInt(newMenuData.price, 10)
            });
            setMenus([response.data, ...menus]);
            setNewMenuData({ 
                name: '', 
                category: '', 
                price: '', 
                description: '' 
            });
            setShowAddForm(false);
        } catch (error) {
            alert("新規メニューの追加に失敗しました。");
        }
    };

    const handleDeleteMenu = async (menuId) => {
        if (!window.confirm("このメニューを本当に削除しますか？")) return;
        try {
            await api.delete(`/api/menus/${menuId}`);
            setMenus(menus.filter(menu => menu.id !== menuId));
        } catch (error) {
            alert("メニューの削除に失敗しました。");
        }
    };

    const getCategoryIcon = (category) => {
        const icons = {
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
        return icons[category] || '🍽️';
    };

    const MenuCard = ({ menu }) => (
        <div className="info-card menu-card" style={{ textAlign: 'left' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px' 
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>
                            {getCategoryIcon(menu.category)}
                        </span>
                        <span className="status-badge info" style={{ fontSize: '0.7rem' }}>
                            {menu.category}
                        </span>
                    </div>
                    <h4 style={{ 
                        margin: '0 0 4px 0', 
                        color: 'var(--color-text)',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}>
                        {menu.name}
                    </h4>
                    <div className="stat-number" style={{ 
                        fontSize: '1.2rem', 
                        margin: '4px 0' 
                    }}>
                        ¥{menu.price.toLocaleString()}
                    </div>
                    {menu.description && (
                        <p style={{ 
                            margin: 0, 
                            fontSize: '0.85rem', 
                            color: 'var(--color-text)',
                            opacity: 0.8,
                            lineHeight: 1.4
                        }}>
                            {menu.description}
                        </p>
                    )}
                </div>
            </div>
            <div className="action-button-group" style={{ marginTop: '16px' }}>
                <button 
                    className="action-button"
                    onClick={() => handleEditClick(menu)}
                    style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                >
                    ✏️ 編集
                </button>
                <button 
                    className="action-button"
                    onClick={() => handleDeleteMenu(menu.id)}
                    style={{ 
                        fontSize: '0.8rem', 
                        padding: '8px 12px',
                        borderColor: 'var(--color-negative)',
                        color: 'var(--color-negative)'
                    }}
                >
                    🗑️ 削除
                </button>
            </div>
        </div>
    );

    const EditMenuCard = ({ menu }) => (
        <div className="info-card menu-card" style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '8px' 
                }}>
                    <span style={{ fontSize: '1.2rem' }}>
                        {getCategoryIcon(menu.category)}
                    </span>
                    <span className="status-badge info" style={{ fontSize: '0.7rem' }}>
                        {menu.category}
                    </span>
                </div>
                <h4 style={{ 
                    margin: '0 0 12px 0', 
                    color: 'var(--color-text)',
                    fontSize: '1rem',
                    fontWeight: '600'
                }}>
                    {menu.name}
                </h4>
                
                <div style={{ marginBottom: '12px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: 'var(--color-text)'
                    }}>
                        価格 (円)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditFormChange}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid var(--color-border)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontFamily: 'var(--font-body)',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        color: 'var(--color-text)'
                    }}>
                        説明
                    </label>
                    <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleEditFormChange}
                        rows="3"
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '2px solid var(--color-border)',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontFamily: 'var(--font-body)',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            resize: 'vertical'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-accent)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                    />
                </div>
            </div>
            
            <div className="action-button-group">
                <button 
                    className="action-button"
                    onClick={() => handleSaveClick(menu.id)}
                    style={{ 
                        fontSize: '0.8rem', 
                        padding: '8px 16px',
                        backgroundColor: 'var(--color-positive)',
                        borderColor: 'var(--color-positive)',
                        color: 'white'
                    }}
                >
                    💾 保存
                </button>
                <button 
                    className="action-button"
                    onClick={handleCancelClick}
                    style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                >
                    ❌ キャンセル
                </button>
            </div>
        </div>
    );

    return (
        <div className="card menu-list-container">
            <div className="card-header">
                <div className="summary-icon">🍽️</div>
                <h2>メニュー管理</h2>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="secondary-button"
                    style={{ marginLeft: 'auto' }}
                >
                    {showAddForm ? '❌ 閉じる' : '➕ 新規メニュー追加'}
                </button>
            </div>

            {showAddForm && (
                <div className="info-card" style={{ marginBottom: '24px' }}>
                    <h4 style={{ 
                        margin: '0 0 16px 0',
                        color: 'var(--color-text)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ➕ 新しいメニューを追加
                    </h4>
                    
                    <form onSubmit={handleAddNewMenu}>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '16px',
                            marginBottom: '16px'
                        }}>
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: 'var(--color-text)'
                                }}>
                                    カテゴリ
                                </label>
                                <select
                                    name="category"
                                    value={newMenuData.category}
                                    onChange={handleNewFormChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-body)',
                                        outline: 'none',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="">カテゴリを選択</option>
                                    <option value="ドリンク">🍺 ドリンク</option>
                                    <option value="揚げ物">🍤 揚げ物</option>
                                    <option value="焼き鳥">🍗 焼き鳥</option>
                                    <option value="刺身">🐟 刺身</option>
                                    <option value="サラダ">🥗 サラダ</option>
                                    <option value="ご飯物">🍚 ご飯物</option>
                                    <option value="デザート">🍮 デザート</option>
                                    <option value="おつまみ">🥜 おつまみ</option>
                                    <option value="麺類">🍜 麺類</option>
                                    <option value="鍋料理">🍲 鍋料理</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '4px',
                                    fontSize: '0.9rem',
                                    fontWeight: '500',
                                    color: 'var(--color-text)'
                                }}>
                                    価格 (円)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newMenuData.price}
                                    onChange={handleNewFormChange}
                                    placeholder="価格を入力"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '2px solid var(--color-border)',
                                        borderRadius: '8px',
                                        fontSize: '1rem',
                                        fontFamily: 'var(--font-body)',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '4px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: 'var(--color-text)'
                            }}>
                                メニュー名
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={newMenuData.name}
                                onChange={handleNewFormChange}
                                placeholder="メニュー名を入力"
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontFamily: 'var(--font-body)',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ 
                                display: 'block', 
                                marginBottom: '4px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: 'var(--color-text)'
                            }}>
                                説明 (任意)
                            </label>
                            <textarea
                                name="description"
                                value={newMenuData.description}
                                onChange={handleNewFormChange}
                                placeholder="メニューの説明を入力してください"
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '2px solid var(--color-border)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    fontFamily: 'var(--font-body)',
                                    outline: 'none',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="secondary-button"
                            style={{ width: '100%' }}
                        >
                            ✨ メニューを登録する
                        </button>
                    </form>
                </div>
            )}

            {menus.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    backgroundColor: 'rgba(253, 250, 244, 0.5)',
                    borderRadius: '12px',
                    border: '2px dashed var(--color-border)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-text)' }}>
                        まだメニューが登録されていません
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                        上の「新規メニュー追加」ボタンから始めましょう！
                    </p>
                </div>
            ) : (
                <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                    {menus.map(menu => (
                        editingMenuId === menu.id ? 
                            <EditMenuCard key={menu.id} menu={menu} /> : 
                            <MenuCard key={menu.id} menu={menu} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MenuList;