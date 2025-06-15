import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Download,
  Upload,
  HardDrive,
  Shield,
  Calendar,
  FileText,
  Database,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Archive,
  Key
} from 'lucide-react';

const BackupExport = () => {
  const { api } = useAuth();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [exportType, setExportType] = useState('all');
  const [selectedStores, setSelectedStores] = useState([]);

  // ローカル環境判定
  const isLocalEnv = window.location.hostname === 'localhost';

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      
      // ローカル環境でのモックデータ
      if (isLocalEnv) {
        console.log('🏠 ローカル環境：モックバックアップデータを使用');
        const mockBackups = [
          {
            id: 'backup-001',
            name: '全店舗データ_2024-12-20',
            type: 'full',
            size: '45.7 MB',
            stores: 5,
            createdAt: new Date().toISOString(),
            status: 'completed',
            downloadUrl: '/backups/backup-001.zip'
          },
          {
            id: 'backup-002',
            name: '設定データのみ_2024-12-19',
            type: 'settings',
            size: '2.3 MB',
            stores: 5,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'completed',
            downloadUrl: '/backups/backup-002.zip'
          },
          {
            id: 'backup-003',
            name: '店舗選択バックアップ_2024-12-18',
            type: 'selective',
            size: '18.9 MB',
            stores: 2,
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: 'completed',
            downloadUrl: '/backups/backup-003.zip'
          }
        ];
        
        setBackups(mockBackups);
        setLoading(false);
        return;
      }
      
      // 本番API呼び出し
      const response = await api.get('/backups');
      if (response.data.success) {
        setBackups(response.data.backups);
      }
    } catch (error) {
      console.error('バックアップデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('💾 バックアップ作成シミュレーション');
        console.log('タイプ:', exportType);
        console.log('選択店舗:', selectedStores);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const newBackup = {
          id: `backup-${Date.now()}`,
          name: `${getBackupTypeName(exportType)}_${new Date().toISOString().split('T')[0]}`,
          type: exportType,
          size: `${Math.floor(Math.random() * 50 + 5)}.${Math.floor(Math.random() * 9)} MB`,
          stores: exportType === 'all' ? 5 : selectedStores.length,
          createdAt: new Date().toISOString(),
          status: 'completed',
          downloadUrl: `/backups/backup-${Date.now()}.zip`
        };
        
        setBackups(prev => [newBackup, ...prev]);
        alert('バックアップを作成しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post('/backups/create', {
        type: exportType,
        storeIds: selectedStores
      });
      
      if (response.data.success) {
        alert('バックアップを作成しました');
        fetchBackups();
      }
    } catch (error) {
      console.error('バックアップ作成エラー:', error);
      alert('バックアップ作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = (backup) => {
    // ローカル環境でのシミュレーション
    if (isLocalEnv) {
      console.log('📥 バックアップダウンロード:', backup.name);
      alert(`バックアップ「${backup.name}」のダウンロードを開始しました（シミュレーション）`);
      return;
    }
    
    // 実際のダウンロード処理
    window.open(backup.downloadUrl, '_blank');
  };

  const handleRestoreBackup = async (backup) => {
    if (!confirm(`バックアップ「${backup.name}」を復元しますか？\n現在のデータは上書きされます。`)) {
      return;
    }
    
    try {
      setRestoring(true);
      
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('🔄 バックアップ復元シミュレーション:', backup.name);
        await new Promise(resolve => setTimeout(resolve, 5000));
        alert('バックアップの復元が完了しました！');
        return;
      }
      
      // 本番API呼び出し
      const response = await api.post(`/backups/${backup.id}/restore`);
      
      if (response.data.success) {
        alert('復元が完了しました');
      }
    } catch (error) {
      console.error('復元エラー:', error);
      alert('復元に失敗しました');
    } finally {
      setRestoring(false);
    }
  };

  const handleImportBackup = async (file) => {
    if (!file) return;
    
    try {
      // ローカル環境でのシミュレーション
      if (isLocalEnv) {
        console.log('📤 バックアップインポート:', file.name);
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`バックアップファイル「${file.name}」のインポートが完了しました！`);
        return;
      }
      
      const formData = new FormData();
      formData.append('backup', file);
      
      const response = await api.post('/backups/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        alert('インポートが完了しました');
        fetchBackups();
      }
    } catch (error) {
      console.error('インポートエラー:', error);
      alert('インポートに失敗しました');
    }
  };

  const getBackupTypeName = (type) => {
    switch (type) {
      case 'all': return '全店舗データ';
      case 'settings': return '設定データのみ';
      case 'selective': return '店舗選択バックアップ';
      default: return 'バックアップ';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'full':
      case 'all': return Database;
      case 'settings': return Settings;
      case 'selective': return Archive;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="backup-export-loading">
        <div className="loading-spinner"></div>
        <p>バックアップデータを読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="backup-export">
      <div className="page-header">
        <h1>バックアップ・エクスポート</h1>
        <p>データの安全な管理とバックアップ</p>
      </div>

      {/* バックアップ作成セクション */}
      <div className="backup-create-section">
        <h2>新規バックアップ作成</h2>
        <div className="backup-form">
          <div className="form-group">
            <label>バックアップタイプ</label>
            <div className="backup-types">
              <label className="backup-type-option">
                <input
                  type="radio"
                  name="exportType"
                  value="all"
                  checked={exportType === 'all'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <Database size={20} />
                  <span>全店舗データ</span>
                  <small>すべての店舗の完全なデータ</small>
                </div>
              </label>
              
              <label className="backup-type-option">
                <input
                  type="radio"
                  name="exportType"
                  value="settings"
                  checked={exportType === 'settings'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <Settings size={20} />
                  <span>設定データのみ</span>
                  <small>APIキーや設定情報のみ</small>
                </div>
              </label>
              
              <label className="backup-type-option">
                <input
                  type="radio"
                  name="exportType"
                  value="selective"
                  checked={exportType === 'selective'}
                  onChange={(e) => setExportType(e.target.value)}
                />
                <div className="option-content">
                  <Archive size={20} />
                  <span>店舗選択</span>
                  <small>特定の店舗のみ</small>
                </div>
              </label>
            </div>
          </div>

          {exportType === 'selective' && (
            <div className="form-group">
              <label>対象店舗</label>
              <div className="store-selection">
                {['居酒屋 花まる', '海鮮居酒屋 大漁丸', '創作和食 風花'].map((store, index) => (
                  <label key={index} className="store-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(index)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStores([...selectedStores, index]);
                        } else {
                          setSelectedStores(selectedStores.filter(s => s !== index));
                        }
                      }}
                    />
                    <span>{store}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleCreateBackup}
            disabled={creating || (exportType === 'selective' && selectedStores.length === 0)}
          >
            {creating ? (
              <>
                <RefreshCw size={18} className="spin" />
                作成中...
              </>
            ) : (
              <>
                <Download size={18} />
                バックアップ作成
              </>
            )}
          </button>
        </div>
      </div>

      {/* バックアップ一覧 */}
      <div className="backup-list-section">
        <div className="section-header">
          <h2>バックアップ履歴</h2>
          <button
            className="btn-secondary"
            onClick={fetchBackups}
            disabled={loading}
          >
            <RefreshCw size={18} />
            更新
          </button>
        </div>

        <div className="backup-list">
          {backups.map(backup => {
            const TypeIcon = getTypeIcon(backup.type);
            
            return (
              <div key={backup.id} className="backup-item">
                <div className="backup-info">
                  <div className="backup-icon">
                    <TypeIcon size={24} />
                  </div>
                  <div className="backup-details">
                    <h3>{backup.name}</h3>
                    <div className="backup-meta">
                      <span className="backup-size">{backup.size}</span>
                      <span className="backup-stores">{backup.stores}店舗</span>
                      <span className="backup-date">
                        <Calendar size={14} />
                        {new Date(backup.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="backup-status">
                  <span className="status-badge status-completed">
                    <CheckCircle size={16} />
                    完了
                  </span>
                </div>
                
                <div className="backup-actions">
                  <button
                    className="action-btn"
                    onClick={() => handleDownloadBackup(backup)}
                    title="ダウンロード"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleRestoreBackup(backup)}
                    disabled={restoring}
                    title="復元"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {backups.length === 0 && (
            <div className="empty-state">
              <HardDrive size={48} />
              <h3>バックアップがありません</h3>
              <p>上のフォームから新しいバックアップを作成してください</p>
            </div>
          )}
        </div>
      </div>

      {/* インポートセクション */}
      <div className="backup-import-section">
        <h2>バックアップのインポート</h2>
        <div className="import-area">
          <div className="import-dropzone">
            <Upload size={48} />
            <h3>バックアップファイルをドロップ</h3>
            <p>または</p>
            <input
              type="file"
              accept=".zip,.json"
              onChange={(e) => handleImportBackup(e.target.files[0])}
              id="backup-file"
              className="file-input"
            />
            <label htmlFor="backup-file" className="btn-secondary">
              ファイルを選択
            </label>
          </div>
          
          <div className="import-warning">
            <AlertTriangle size={20} />
            <div>
              <h4>⚠️ 注意事項</h4>
              <ul>
                <li>インポート時は現在のデータが上書きされます</li>
                <li>事前に現在のデータのバックアップを作成することを推奨します</li>
                <li>大きなファイルの場合、処理に時間がかかることがあります</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 自動バックアップ設定 */}
      <div className="auto-backup-section">
        <h2>自動バックアップ設定</h2>
        <div className="auto-backup-config">
          <div className="config-option">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>自動バックアップを有効にする</span>
            </label>
          </div>
          
          <div className="config-grid">
            <div className="config-group">
              <label>実行頻度</label>
              <select className="form-select">
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>
            
            <div className="config-group">
              <label>実行時刻</label>
              <input type="time" defaultValue="03:00" className="form-input" />
            </div>
            
            <div className="config-group">
              <label>保存期間</label>
              <select className="form-select">
                <option value="30">30日</option>
                <option value="90">90日</option>
                <option value="365">1年</option>
              </select>
            </div>
          </div>
          
          <button className="btn-primary">
            <Shield size={18} />
            自動バックアップ設定を保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupExport;