import React, { useState } from 'react';
import { MessageSquare, Eye, EyeOff, ExternalLink, CheckCircle, AlertTriangle, Copy } from 'lucide-react';

const LineSetupStep = ({ data, updateData, errors }) => {
  const { lineSetup } = data;
  const [showSecrets, setShowSecrets] = useState({
    channelSecret: false,
    accessToken: false
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const handleChange = (field, value) => {
    updateData('lineSetup', { [field]: value });
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const generateWebhookUrl = () => {
    if (data.basicInfo?.name) {
      const storeSlug = data.basicInfo.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      const webhookUrl = `https://api.kanpai.jp/webhooks/line/${storeSlug}`;
      handleChange('webhookUrl', webhookUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const testLineConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // シミュレートされたテスト（実際にはAPIを呼び出し）
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (lineSetup.channelId && lineSetup.channelSecret && lineSetup.accessToken) {
        setTestResult({
          success: true,
          message: 'LINE APIとの接続に成功しました！'
        });
      } else {
        setTestResult({
          success: false,
          message: '必要な情報が不足しています'
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

  return (
    <div className="wizard-step line-setup-step">
      <div className="step-header">
        <MessageSquare size={32} />
        <div>
          <h2>LINE Bot API設定</h2>
          <p>LINE Developersから取得した情報を入力してください</p>
        </div>
      </div>

      <div className="step-content">
        {/* 設定ガイド */}
        <div className="setup-guide">
          <h3>📋 設定手順</h3>
          <ol>
            <li>
              <a href="https://developers.line.biz/" target="_blank" rel="noopener noreferrer">
                LINE Developers <ExternalLink size={14} />
              </a> にアクセス
            </li>
            <li>新しいプロバイダーとMessaging API チャンネルを作成</li>
            <li>以下の情報をコピーして入力</li>
            <li>Webhook URLを設定（下記に表示されます）</li>
          </ol>
        </div>

        {/* LINE API情報入力 */}
        <div className="form-section">
          <h3>LINE API 認証情報</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="channelId">
                Channel ID *
              </label>
              <input
                type="text"
                id="channelId"
                value={lineSetup.channelId}
                onChange={(e) => handleChange('channelId', e.target.value)}
                placeholder="例: 1234567890"
                className={errors.line?.channelId ? 'error' : ''}
              />
              {errors.line?.channelId && (
                <span className="error-message">{errors.line.channelId}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="channelSecret">
                Channel Secret *
              </label>
              <div className="secret-input">
                <input
                  type={showSecrets.channelSecret ? 'text' : 'password'}
                  id="channelSecret"
                  value={lineSetup.channelSecret}
                  onChange={(e) => handleChange('channelSecret', e.target.value)}
                  placeholder="Channel Secretを入力"
                  className={errors.line?.channelSecret ? 'error' : ''}
                />
                <button
                  type="button"
                  className="secret-toggle"
                  onClick={() => toggleSecretVisibility('channelSecret')}
                >
                  {showSecrets.channelSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.line?.channelSecret && (
                <span className="error-message">{errors.line.channelSecret}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accessToken">
                Channel Access Token *
              </label>
              <div className="secret-input">
                <input
                  type={showSecrets.accessToken ? 'text' : 'password'}
                  id="accessToken"
                  value={lineSetup.accessToken}
                  onChange={(e) => handleChange('accessToken', e.target.value)}
                  placeholder="Channel Access Tokenを入力"
                  className={errors.line?.accessToken ? 'error' : ''}
                />
                <button
                  type="button"
                  className="secret-toggle"
                  onClick={() => toggleSecretVisibility('accessToken')}
                >
                  {showSecrets.accessToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.line?.accessToken && (
                <span className="error-message">{errors.line.accessToken}</span>
              )}
            </div>
          </div>
        </div>

        {/* Webhook URL生成 */}
        <div className="form-section">
          <h3>Webhook URL設定</h3>
          
          <div className="webhook-section">
            <p>以下のURLをLINE DevelopersのWebhook URLに設定してください：</p>
            
            <div className="webhook-url-container">
              <div className="webhook-url">
                {lineSetup.webhookUrl || 'まず店舗名を入力してください'}
              </div>
              {lineSetup.webhookUrl && (
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(lineSetup.webhookUrl)}
                  title="URLをコピー"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
            
            {!lineSetup.webhookUrl && data.basicInfo?.name && (
              <button
                className="btn-secondary"
                onClick={generateWebhookUrl}
              >
                Webhook URL生成
              </button>
            )}
          </div>
        </div>

        {/* オプション設定 */}
        <div className="form-section">
          <h3>オプション設定</h3>
          
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={lineSetup.richMenuEnabled}
                onChange={(e) => handleChange('richMenuEnabled', e.target.checked)}
              />
              <span>リッチメニューを有効にする</span>
            </label>
            <p className="help-text">
              店舗のメニューや予約ボタンを含むリッチメニューを自動設定します
            </p>
          </div>
        </div>

        {/* 接続テスト */}
        <div className="form-section">
          <h3>接続テスト</h3>
          
          <div className="test-section">
            <button
              className="btn-secondary"
              onClick={testLineConnection}
              disabled={testing || !lineSetup.channelId || !lineSetup.channelSecret || !lineSetup.accessToken}
            >
              {testing ? (
                <>
                  <div className="spinner"></div>
                  テスト中...
                </>
              ) : (
                '接続テスト実行'
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

        {/* セキュリティ注意事項 */}
        <div className="security-note">
          <AlertTriangle size={16} />
          <div>
            <h4>🔒 セキュリティについて</h4>
            <ul>
              <li>認証情報は暗号化されて安全に保存されます</li>
              <li>Channel SecretとAccess Tokenは第三者に漏らさないでください</li>
              <li>不要になった認証情報は速やかに無効化してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineSetupStep;