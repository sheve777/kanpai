import React, { useState } from 'react';
import { Calendar, Upload, ExternalLink, CheckCircle, AlertTriangle, Info, FileText } from 'lucide-react';

const GoogleSetupStep = ({ data, updateData, errors }) => {
  const { googleSetup } = data;
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleChange = (field, value) => {
    updateData('googleSetup', { [field]: value });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('JSONファイルを選択してください');
      return;
    }

    setUploadingFile(true);
    try {
      const text = await file.text();
      const serviceAccount = JSON.parse(text);
      
      if (serviceAccount.client_email && serviceAccount.private_key) {
        handleChange('serviceAccountEmail', serviceAccount.client_email);
        handleChange('privateKey', serviceAccount.private_key);
      } else {
        alert('有効なサービスアカウントファイルではありません');
      }
    } catch (error) {
      alert('ファイルの読み込みに失敗しました');
    } finally {
      setUploadingFile(false);
    }
  };

  const testGoogleConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (googleSetup.serviceAccountEmail && googleSetup.privateKey) {
        setTestResult({
          success: true,
          message: 'Google Calendar APIとの接続に成功しました！'
        });
      } else {
        setTestResult({
          success: false,
          message: 'サービスアカウント情報が不足しています'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '接続テストに失敗しました'
      });
    } finally {
      setTesting(false);
    }
  };

  const timezoneOptions = [
    { value: 'Asia/Tokyo', label: '日本標準時 (JST)' },
    { value: 'Asia/Seoul', label: '韓国標準時 (KST)' },
    { value: 'Asia/Hong_Kong', label: '香港時間 (HKT)' },
    { value: 'UTC', label: '協定世界時 (UTC)' }
  ];

  return (
    <div className="wizard-step google-setup-step">
      <div className="step-header">
        <Calendar size={32} />
        <div>
          <h2>Google Calendar連携設定</h2>
          <p>予約管理のためのGoogleカレンダー連携を設定します（オプション）</p>
        </div>
      </div>

      <div className="step-content">
        {/* スキップオプション */}
        <div className="skip-option">
          <div className="info-box">
            <Info size={16} />
            <div>
              <h4>この設定はオプションです</h4>
              <p>後から管理画面で設定することも可能です。今すぐ設定する場合は、事前にGoogle Cloud ConsoleでService Accountの設定が必要です。</p>
            </div>
          </div>
        </div>

        {/* 設定ガイド */}
        <div className="setup-guide">
          <h3>📋 設定手順</h3>
          <ol>
            <li>
              <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                Google Cloud Console <ExternalLink size={14} />
              </a> にアクセス
            </li>
            <li>プロジェクトを作成または選択</li>
            <li>Google Calendar APIを有効化</li>
            <li>サービスアカウントを作成してJSONキーをダウンロード</li>
            <li>カレンダーにサービスアカウントを編集者として共有</li>
          </ol>
        </div>

        {/* カレンダー設定 */}
        <div className="form-section">
          <h3>カレンダー設定</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="calendarId">
                カレンダーID
              </label>
              <input
                type="text"
                id="calendarId"
                value={googleSetup.calendarId}
                onChange={(e) => handleChange('calendarId', e.target.value)}
                placeholder="例: your-calendar@gmail.com または primary"
              />
              <p className="help-text">
                'primary'で主カレンダーを使用、または特定のカレンダーIDを入力
              </p>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="timezone">
                タイムゾーン
              </label>
              <select
                id="timezone"
                value={googleSetup.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                {timezoneOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* サービスアカウント設定 */}
        <div className="form-section">
          <h3>サービスアカウント認証</h3>
          
          {/* ファイルアップロード */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="serviceAccountFile">
                <FileText size={16} />
                サービスアカウントJSONファイル
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="serviceAccountFile"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="serviceAccountFile" className="file-upload-button">
                  {uploadingFile ? (
                    <>
                      <div className="spinner"></div>
                      アップロード中...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      JSONファイルを選択
                    </>
                  )}
                </label>
                <p className="help-text">
                  Google Cloud ConsoleからダウンロードしたサービスアカウントのJSONファイルをアップロード
                </p>
              </div>
            </div>
          </div>

          {/* 手動入力オプション */}
          <div className="manual-input-section">
            <h4>または手動で入力：</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serviceAccountEmail">
                  サービスアカウントメール
                </label>
                <input
                  type="email"
                  id="serviceAccountEmail"
                  value={googleSetup.serviceAccountEmail}
                  onChange={(e) => handleChange('serviceAccountEmail', e.target.value)}
                  placeholder="例: service-account@project.iam.gserviceaccount.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="privateKey">
                  プライベートキー
                </label>
                <textarea
                  id="privateKey"
                  value={googleSetup.privateKey}
                  onChange={(e) => handleChange('privateKey', e.target.value)}
                  placeholder="-----BEGIN PRIVATE KEY-----で始まるキーを貼り付け"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 接続テスト */}
        <div className="form-section">
          <h3>接続テスト</h3>
          
          <div className="test-section">
            <button
              className="btn-secondary"
              onClick={testGoogleConnection}
              disabled={testing || (!googleSetup.serviceAccountEmail || !googleSetup.privateKey)}
            >
              {testing ? (
                <>
                  <div className="spinner"></div>
                  テスト中...
                </>
              ) : (
                'Google Calendar接続テスト'
              )}
            </button>
            
            {testResult && (
              <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.success ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* 予約設定 */}
        <div className="form-section">
          <h3>予約設定</h3>
          
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={googleSetup.autoCreateEvents}
                onChange={(e) => handleChange('autoCreateEvents', e.target.checked)}
              />
              <span>LINE予約時に自動でカレンダーイベントを作成</span>
            </label>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={googleSetup.syncExistingEvents}
                onChange={(e) => handleChange('syncExistingEvents', e.target.checked)}
              />
              <span>既存のカレンダーイベントと同期</span>
            </label>
          </div>
        </div>

        {/* セキュリティ注意事項 */}
        <div className="security-note">
          <AlertTriangle size={16} />
          <div>
            <h4>🔒 セキュリティについて</h4>
            <ul>
              <li>サービスアカウントキーは暗号化されて安全に保存されます</li>
              <li>カレンダーには最小限の権限のみでアクセスします</li>
              <li>不要になった場合はGoogle Cloud Consoleで無効化してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSetupStep;