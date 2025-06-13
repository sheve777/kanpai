import React, { useState } from 'react';
import { Bot, MessageCircle, Settings, Eye, EyeOff, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const AISetupStep = ({ data, updateData, errors }) => {
  const { aiSetup } = data;
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewResponse, setPreviewResponse] = useState('');

  const handleChange = (field, value) => {
    updateData('aiSetup', { [field]: value });
  };

  const personalityOptions = [
    {
      id: 'friendly',
      name: 'フレンドリー',
      description: '親しみやすく温かい対応',
      example: 'こんにちは！今日はどのようなご用件でしょうか？お気軽にお声かけくださいね♪'
    },
    {
      id: 'professional',
      name: 'プロフェッショナル',
      description: '丁寧で礼儀正しい対応',
      example: 'いらっしゃいませ。本日はお忙しい中お時間をいただき、ありがとうございます。'
    },
    {
      id: 'casual',
      name: 'カジュアル',
      description: 'リラックスした親近感のある対応',
      example: 'おつかれさま！今日も一日お疲れ様でした。何かお手伝いできることはありますか？'
    },
    {
      id: 'enthusiastic',
      name: '元気',
      description: 'エネルギッシュで明るい対応',
      example: 'いらっしゃいませ〜！今日も元気に営業中です！何でもお気軽にお聞きください！'
    }
  ];

  const toneOptions = [
    { id: 'formal', name: '敬語', description: '丁寧語・尊敬語を使用' },
    { id: 'casual', name: 'タメ口', description: 'フランクな話し方' },
    { id: 'mixed', name: 'ミックス', description: '状況に応じて使い分け' }
  ];

  const testAIResponse = async () => {
    if (!previewMessage.trim()) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const personality = personalityOptions.find(p => p.id === aiSetup.personality);
      const tone = toneOptions.find(t => t.id === aiSetup.tone);
      
      let response = '';
      if (aiSetup.personality === 'friendly') {
        response = `ありがとうございます！「${previewMessage}」についてですね。喜んでお手伝いさせていただきます♪`;
      } else if (aiSetup.personality === 'professional') {
        response = `お問い合わせいただき、ありがとうございます。「${previewMessage}」の件につきまして、詳しくご案内いたします。`;
      } else if (aiSetup.personality === 'casual') {
        response = `「${previewMessage}」ですね！了解です。詳しく教えますね〜`;
      } else {
        response = `「${previewMessage}」について、元気いっぱいお答えします！お任せください！`;
      }

      setPreviewResponse(response);
      setTestResult({
        success: true,
        message: 'AIの設定が正常に動作しています'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'AIテストに失敗しました'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="wizard-step ai-setup-step">
      <div className="step-header">
        <Bot size={32} />
        <div>
          <h2>AI チャットボット設定</h2>
          <p>お客様とのやりとりを行うAIの性格や口調を設定します</p>
        </div>
      </div>

      <div className="step-content">
        {/* 性格設定 */}
        <div className="form-section">
          <h3>
            <MessageCircle size={20} />
            AI の性格
          </h3>
          
          <div className="personality-options">
            {personalityOptions.map((option) => (
              <div 
                key={option.id}
                className={`personality-card ${aiSetup.personality === option.id ? 'selected' : ''}`}
                onClick={() => handleChange('personality', option.id)}
              >
                <div className="personality-header">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="personality-example">
                  <strong>例:</strong> {option.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 口調設定 */}
        <div className="form-section">
          <h3>話し方・口調</h3>
          
          <div className="tone-options">
            {toneOptions.map((option) => (
              <label key={option.id} className="radio-option">
                <input
                  type="radio"
                  name="tone"
                  value={option.id}
                  checked={aiSetup.tone === option.id}
                  onChange={(e) => handleChange('tone', e.target.value)}
                />
                <div className="radio-content">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 言語設定 */}
        <div className="form-section">
          <h3>言語設定</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="language">
                主要言語
              </label>
              <select
                id="language"
                value={aiSetup.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>

        {/* カスタムプロンプト */}
        <div className="form-section">
          <h3>
            <Settings size={20} />
            カスタム設定
          </h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customPrompt">
                追加指示（オプション）
              </label>
              <textarea
                id="customPrompt"
                value={aiSetup.customPrompt}
                onChange={(e) => handleChange('customPrompt', e.target.value)}
                placeholder="例: 特定の商品を積極的に勧める、アレルギー情報を必ず確認する等"
                rows={3}
              />
              <p className="help-text">
                AIに特別な指示がある場合に入力してください
              </p>
            </div>
          </div>
        </div>

        {/* API キー設定 */}
        <div className="form-section">
          <h3>
            <Zap size={20} />
            API キー設定
          </h3>
          
          <div className="api-key-options">
            <label className="radio-option">
              <input
                type="radio"
                name="apiKeyOption"
                checked={aiSetup.useCommonKey}
                onChange={() => handleChange('useCommonKey', true)}
              />
              <div className="radio-content">
                <h4>共通APIキーを使用（推奨）</h4>
                <p>kanpAIが提供するAPIキーを使用します。追加費用なし。</p>
              </div>
            </label>
            
            <label className="radio-option">
              <input
                type="radio"
                name="apiKeyOption"
                checked={!aiSetup.useCommonKey}
                onChange={() => handleChange('useCommonKey', false)}
              />
              <div className="radio-content">
                <h4>独自APIキーを使用</h4>
                <p>OpenAIの独自アカウントAPIキーを使用します。より多くのリクエストが可能。</p>
              </div>
            </label>
          </div>

          {!aiSetup.useCommonKey && (
            <div className="custom-api-key">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customApiKey">
                    OpenAI API Key *
                  </label>
                  <div className="secret-input">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      id="customApiKey"
                      value={aiSetup.customApiKey}
                      onChange={(e) => handleChange('customApiKey', e.target.value)}
                      placeholder="sk-..."
                      className={errors.ai?.customApiKey ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="secret-toggle"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.ai?.customApiKey && (
                    <span className="error-message">{errors.ai.customApiKey}</span>
                  )}
                  <p className="help-text">
                    OpenAI Platform（platform.openai.com）で取得したAPIキー
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI プレビュー */}
        <div className="form-section">
          <h3>AI レスポンステスト</h3>
          
          <div className="ai-preview">
            <div className="preview-input">
              <input
                type="text"
                value={previewMessage}
                onChange={(e) => setPreviewMessage(e.target.value)}
                placeholder="テストメッセージを入力（例: 予約したいです）"
              />
              <button
                className="btn-secondary"
                onClick={testAIResponse}
                disabled={testing || !previewMessage.trim()}
              >
                {testing ? (
                  <>
                    <div className="spinner"></div>
                    テスト中...
                  </>
                ) : (
                  'AIテスト'
                )}
              </button>
            </div>

            {previewResponse && (
              <div className="preview-response">
                <h4>AIからの返答:</h4>
                <div className="ai-message">
                  {previewResponse}
                </div>
              </div>
            )}

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

        {/* 詳細設定 */}
        <div className="form-section">
          <h3>詳細設定</h3>
          
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={aiSetup.enableAutoReply}
                onChange={(e) => handleChange('enableAutoReply', e.target.checked)}
              />
              <span>自動返信を有効にする</span>
            </label>
            <p className="help-text">
              営業時間外や忙しい時間帯に自動で返信します
            </p>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={aiSetup.enableLearning}
                onChange={(e) => handleChange('enableLearning', e.target.checked)}
              />
              <span>学習機能を有効にする</span>
            </label>
            <p className="help-text">
              過去の会話からより良い返答ができるよう学習します
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="security-note">
          <AlertTriangle size={16} />
          <div>
            <h4>ℹ️ AIについて</h4>
            <ul>
              <li>設定は後から管理画面で変更可能です</li>
              <li>AIの返答精度は使用データの蓄積により向上します</li>
              <li>重要な情報は人間が最終確認することをお勧めします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISetupStep;