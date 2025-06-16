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
        <h2>📦 新規バックアップ作成</h2>
        <div className="backup-form-table">
          <table className="backup-config-table">
            <thead>
              <tr>
                <th>バックアップタイプ</th>
                <th>対象データ</th>
                <th>推定サイズ</th>
                <th>対象店舗</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              <tr className={exportType === 'all' ? 'selected' : ''} onClick={() => setExportType('all')}>
                <td>
                  <div className="backup-type-cell">
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportType === 'all'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <Database size={16} />
                    <span>全店舗データ</span>
                  </div>
                </td>
                <td>すべての店舗の完全なデータ（設定・予約・メニュー・ユーザー）</td>
                <td><span className="size-estimate">~45-60 MB</span></td>
                <td><span className="store-count">全5店舗</span></td>
                <td>
                  {exportType === 'all' && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={handleCreateBackup}
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          作成中...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          作成
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
              
              <tr className={exportType === 'settings' ? 'selected' : ''} onClick={() => setExportType('settings')}>
                <td>
                  <div className="backup-type-cell">
                    <input
                      type="radio"
                      name="exportType"
                      value="settings"
                      checked={exportType === 'settings'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <Settings size={16} />
                    <span>設定データのみ</span>
                  </div>
                </td>
                <td>APIキー・店舗設定・LINE設定・Google設定のみ</td>
                <td><span className="size-estimate">~2-5 MB</span></td>
                <td><span className="store-count">全5店舗</span></td>
                <td>
                  {exportType === 'settings' && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={handleCreateBackup}
                      disabled={creating}
                    >
                      {creating ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          作成中...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          作成
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
              
              <tr className={exportType === 'selective' ? 'selected' : ''} onClick={() => setExportType('selective')}>
                <td>
                  <div className="backup-type-cell">
                    <input
                      type="radio"
                      name="exportType"
                      value="selective"
                      checked={exportType === 'selective'}
                      onChange={(e) => setExportType(e.target.value)}
                    />
                    <Archive size={16} />
                    <span>店舗選択</span>
                  </div>
                </td>
                <td>選択した店舗の完全データ</td>
                <td><span className="size-estimate">~{selectedStores.length * 10}-{selectedStores.length * 15} MB</span></td>
                <td>
                  {exportType === 'selective' ? (
                    <div className="store-selection-inline">
                      {['居酒屋 花まる', '海鮮居酒屋 大漁丸', '創作和食 風花'].map((store, index) => (
                        <label key={index} className="store-checkbox-inline">
                          <input
                            type="checkbox"
                            checked={selectedStores.includes(index)}
                            onChange={(e) => {
                              e.stopPropagation();
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
                  ) : (
                    <span className="store-count">選択可能</span>
                  )}
                </td>
                <td>
                  {exportType === 'selective' && (
                    <button
                      className="btn-primary btn-sm"
                      onClick={handleCreateBackup}
                      disabled={creating || selectedStores.length === 0}
                    >
                      {creating ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          作成中...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          作成
                        </>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* バックアップ一覧 */}
      <div className="backup-list-section">
        <div className="section-header">
          <h2>📋 バックアップ履歴</h2>
          <button
            className="btn-secondary"
            onClick={fetchBackups}
            disabled={loading}
          >
            <RefreshCw size={18} />
            更新
          </button>
        </div>

        <div className="backup-table-container">
          <table className="backup-table">
            <thead>
              <tr>
                <th>バックアップ名</th>
                <th>タイプ</th>
                <th>ファイルサイズ</th>
                <th>対象店舗</th>
                <th>作成日時</th>
                <th>ステータス</th>
                <th>アクション</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(backup => {
                const TypeIcon = getTypeIcon(backup.type);
                
                return (
                  <tr key={backup.id}>
                    <td className="backup-name-cell">
                      <div className="backup-name-content">
                        <TypeIcon size={16} />
                        <span className="backup-name">{backup.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="backup-type-badge">{getBackupTypeName(backup.type)}</span>
                    </td>
                    <td>
                      <span className="file-size">{backup.size}</span>
                    </td>
                    <td>
                      <span className="store-count-badge">{backup.stores}店舗</span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={12} />
                        <span>{new Date(backup.createdAt).toLocaleDateString('ja-JP')}</span>
                        <small>{new Date(backup.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                    </td>
                    <td>
                      <span className="status-badge status-completed">
                        <CheckCircle size={14} />
                        完了
                      </span>
                    </td>
                    <td>
                      <div className="backup-actions">
                        <button
                          className="action-btn primary"
                          onClick={() => handleDownloadBackup(backup)}
                          title="ダウンロード"
                        >
                          <Download size={14} />
                          DL
                        </button>
                        <button
                          className="action-btn secondary"
                          onClick={() => handleRestoreBackup(backup)}
                          disabled={restoring}
                          title="復元"
                        >
                          <RefreshCw size={14} />
                          復元
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {backups.length === 0 && (
            <div className="empty-state">
              <HardDrive size={48} />
              <h3>バックアップがありません</h3>
              <p>上のテーブルから新しいバックアップを作成してください</p>
            </div>
          )}
        </div>
      </div>

      {/* インポート・自動バックアップ設定 */}
      <div className="backup-settings-section">
        <div className="settings-row">
          {/* インポートセクション */}
          <div className="import-section">
            <h2>📤 バックアップインポート</h2>
            <table className="import-table">
              <thead>
                <tr>
                  <th>ファイル選択</th>
                  <th>対応形式</th>
                  <th>最大サイズ</th>
                  <th>注意事項</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="file-upload-cell">
                      <input
                        type="file"
                        accept=".zip,.json"
                        onChange={(e) => handleImportBackup(e.target.files[0])}
                        id="backup-file"
                        className="file-input"
                      />
                      <label htmlFor="backup-file" className="btn-secondary btn-sm">
                        <Upload size={14} />
                        ファイル選択
                      </label>
                    </div>
                  </td>
                  <td>
                    <div className="format-list">
                      <span className="format-badge">.zip</span>
                      <span className="format-badge">.json</span>
                    </div>
                  </td>
                  <td>
                    <span className="size-limit">100 MB</span>
                  </td>
                  <td>
                    <div className="warning-cell">
                      <AlertTriangle size={14} />
                      <span>現在のデータが上書きされます</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 自動バックアップ設定 */}
          <div className="auto-backup-section">
            <h2>⚙️ 自動バックアップ設定</h2>
            <table className="auto-backup-table">
              <thead>
                <tr>
                  <th>設定項目</th>
                  <th>現在の値</th>
                  <th>変更</th>
                  <th>説明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="setting-name">
                      <Shield size={16} />
                      <span>自動バックアップ</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge status-active">有効</span>
                  </td>
                  <td>
                    <label className="switch-label">
                      <input type="checkbox" defaultChecked />
                      <div className="switch-slider"></div>
                    </label>
                  </td>
                  <td>定期的な自動バックアップの実行</td>
                </tr>
                <tr>
                  <td>
                    <div className="setting-name">
                      <Clock size={16} />
                      <span>実行頻度</span>
                    </div>
                  </td>
                  <td>
                    <span className="current-value">毎日</span>
                  </td>
                  <td>
                    <select className="form-select compact">
                      <option value="daily">毎日</option>
                      <option value="weekly">毎週</option>
                      <option value="monthly">毎月</option>
                    </select>
                  </td>
                  <td>バックアップの実行間隔</td>
                </tr>
                <tr>
                  <td>
                    <div className="setting-name">
                      <Calendar size={16} />
                      <span>実行時刻</span>
                    </div>
                  </td>
                  <td>
                    <span className="current-value">03:00</span>
                  </td>
                  <td>
                    <input type="time" defaultValue="03:00" className="form-input compact" />
                  </td>
                  <td>バックアップ開始時刻</td>
                </tr>
                <tr>
                  <td>
                    <div className="setting-name">
                      <Archive size={16} />
                      <span>保存期間</span>
                    </div>
                  </td>
                  <td>
                    <span className="current-value">30日</span>
                  </td>
                  <td>
                    <select className="form-select compact">
                      <option value="30">30日</option>
                      <option value="90">90日</option>
                      <option value="365">1年</option>
                    </select>
                  </td>
                  <td>古いバックアップの自動削除</td>
                </tr>
              </tbody>
            </table>
            
            <div className="settings-actions">
              <button className="btn-primary">
                <Shield size={18} />
                設定を保存
              </button>
              <button className="btn-secondary">
                <RefreshCw size={18} />
                手動実行
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupExport;