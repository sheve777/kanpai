// C:\Users\acmsh\kanpAI\frontend\src\components\MenuList.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const MenuList = ({ storeId }) => {
    const [menus, setMenus] = useState([]);
    const [editingMenuId, setEditingMenuId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMenuData, setNewMenuData] = useState({ name: '', category: '', price: '', description: '' });
    useEffect(() => {
        const fetchMenus = async () => {
            if (!storeId) return;
            try {
                const response = await api.get(`/api/stores/${storeId}/menus`);
                setMenus(response.data);
            } catch (error) { console.error("メニューの取得に失敗しました:", error); }
        };
        fetchMenus();
    }, [storeId]);
    const handleEditClick = (menu) => { setEditingMenuId(menu.id); setEditFormData({ price: menu.price, description: menu.description || '' }); };
    const handleCancelClick = () => { setEditingMenuId(null); };
    const handleEditFormChange = (e) => { setEditFormData({ ...editFormData, [e.target.name]: e.target.value }); };
    const handleSaveClick = async (menuId) => { try { const response = await api.put(`/api/menus/${menuId}`, { price: parseInt(editFormData.price, 10), description: editFormData.description }); setMenus(menus.map(menu => (menu.id === response.data.id ? response.data : menu))); setEditingMenuId(null); } catch (error) { alert("メニューの更新に失敗しました。"); } };
    const handleNewFormChange = (e) => { setNewMenuData({ ...newMenuData, [e.target.name]: e.target.value }); };
    const handleAddNewMenu = async (e) => { e.preventDefault(); try { const response = await api.post(`/api/stores/${storeId}/menus`, { ...newMenuData, price: parseInt(newMenuData.price, 10) }); setMenus([response.data, ...menus]); setNewMenuData({ name: '', category: '', price: '', description: '' }); setShowAddForm(false); } catch (error) { alert("新規メニューの追加に失敗しました。"); } };
    const handleDeleteMenu = async (menuId) => { if (!window.confirm("このメニューを本当に削除しますか？")) return; try { await api.delete(`/api/menus/${menuId}`); setMenus(menus.filter(menu => menu.id !== menuId)); } catch (error) { alert("メニューの削除に失敗しました。"); } };
    return (
        <div className="card menu-list-container">
            <div className="card-header"><div className="summary-icon">📖</div><h2>メニュー管理</h2></div>
            <div className="add-menu-container"><button onClick={() => setShowAddForm(!showAddForm)} className="add-button">{showAddForm ? '閉じる' : '＋ 新規メニュー追加'}</button>
                {showAddForm && (<form onSubmit={handleAddNewMenu} className="add-menu-form"><input type="text" name="category" value={newMenuData.category} onChange={handleNewFormChange} placeholder="カテゴリ" required /><input type="text" name="name" value={newMenuData.name} onChange={handleNewFormChange} placeholder="メニュー名" required /><input type="number" name="price" value={newMenuData.price} onChange={handleNewFormChange} placeholder="価格" required /><textarea name="description" value={newMenuData.description} onChange={handleNewFormChange} placeholder="説明"></textarea><button type="submit" className="save-button">登録する</button></form>)}
            </div>
            <table className="management-table">
                <thead><tr><th>カテゴリ</th><th>メニュー名</th><th>価格</th><th>説明</th><th>操作</th></tr></thead>
                <tbody>
                    {menus.map(menu => (<tr key={menu.id}>
                        {editingMenuId === menu.id ? (<><td>{menu.category}</td><td>{menu.name}</td><td><input type="number" name="price" value={editFormData.price} onChange={handleEditFormChange} /></td><td><textarea name="description" value={editFormData.description} onChange={handleEditFormChange}></textarea></td><td className="action-buttons"><button className="save-button" onClick={() => handleSaveClick(menu.id)}>保存</button><button className="cancel-button" onClick={handleCancelClick}>中止</button></td></>) : (<><td>{menu.category}</td><td>{menu.name}</td><td>{menu.price}円</td><td>{menu.description}</td><td className="action-buttons"><button className="edit-button" onClick={() => handleEditClick(menu)}>編集</button><button className="delete-button" onClick={() => handleDeleteMenu(menu.id)}>削除</button></td></>)}
                    </tr>))}
                </tbody>
            </table>
        </div>
    );
};
export default MenuList;
