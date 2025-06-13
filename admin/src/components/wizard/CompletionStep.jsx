import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle, 
  Store, 
  MessageSquare, 
  Calendar, 
  Bot, 
  ExternalLink,
  Copy,
  Download,
  Share2,
  QrCode
} from 'lucide-react';

const CompletionStep = ({ data, updateData, errors, isLoading }) => {
  const { basicInfo, lineSetup, googleSetup, aiSetup, completion } = data;
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const generateQRCode = () => {
    // QRコード生成のシミュレーション
    setTimeout(() => setQrCodeGenerated(true), 1000);
  };

  const copyLineUrl = () => {
    const lineUrl = `https://line.me/R/ti/p/@${lineSetup.channelId}`;
    navigator.clipboard.writeText(lineUrl);
  };

  const downloadSetupGuide = () => {
    // セットアップガイドのダウンロード（実際の実装では PDFを生成）
    const guide = `
店舗セットアップ完了ガイド
===================

店舗名: ${basicInfo.name}
セットアップ日: ${new Date().toLocaleDateString('ja-JP')}

LINE Bot設定:
- Channel ID: ${lineSetup.channelId}
- Webhook URL: ${lineSetup.webhookUrl}

次のステップ:
1. LINE Bot の友だち追加URLをお客様に共有
2. 管理画面でメニューや予約設定を確認
3. テスト予約で動作確認

サポート:
support@kanpai.jp
    `;
    
    const blob = new Blob([guide], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${basicInfo.name}_setup_guide.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setupSummary = [
    {
      icon: Store,
      title: '基本情報',
      status: 'completed',
      details: [
        `店舗名: ${basicInfo.name}`,
        `電話番号: ${basicInfo.phone}`,
        `住所: ${basicInfo.address}`,
        `プラン: ${basicInfo.plan === 'entry' ? 'エントリー' : basicInfo.plan === 'standard' ? 'スタンダード' : 'プロ'}プラン`
      ]
    },
    {
      icon: MessageSquare,
      title: 'LINE設定',
      status: lineSetup.channelId ? 'completed' : 'skipped',
      details: [
        `Channel ID: ${lineSetup.channelId || '未設定'}`,
        `Webhook URL: ${lineSetup.webhookUrl || '未設定'}`,
        `リッチメニュー: ${lineSetup.richMenuEnabled ? '有効' : '無効'}`
      ]
    },
    {
      icon: Calendar,
      title: 'Google連携',
      status: googleSetup.serviceAccountEmail ? 'completed' : 'skipped',
      details: [
        `カレンダーID: ${googleSetup.calendarId}`,
        `サービスアカウント: ${googleSetup.serviceAccountEmail || '未設定'}`,
        `タイムゾーン: ${googleSetup.timezone}`
      ]
    },
    {
      icon: Bot,
      title: 'AI設定',
      status: 'completed',
      details: [
        `性格: ${aiSetup.personality === 'friendly' ? 'フレンドリー' : aiSetup.personality === 'professional' ? 'プロフェッショナル' : aiSetup.personality === 'casual' ? 'カジュアル' : '元気'}`,
        `口調: ${aiSetup.tone === 'formal' ? '敬語' : aiSetup.tone === 'casual' ? 'タメ口' : 'ミックス'}`,
        `APIキー: ${aiSetup.useCommonKey ? '共通キー使用' : '独自キー使用'}`
      ]
    }
  ];

  const nextSteps = [
    {
      title: '1. LINE Bot を公開',
      description: '友だち追加URLをお客様に共有してください',
      action: 'LINE URLをコピー',
      onClick: copyLineUrl
    },
    {
      title: '2. QRコードを生成',
      description: '店舗に掲示用のQRコードを作成',
      action: qrCodeGenerated ? 'QRコード生成済み' : 'QRコード生成',
      onClick: generateQRCode,
      disabled: qrCodeGenerated
    },
    {
      title: '3. メニューを設定',
      description: '管理画面でメニューや価格を登録',
      action: '管理画面へ',
      onClick: () => window.open('/menu', '_blank')
    },
    {
      title: '4. テスト予約',
      description: '実際に予約機能をテストしてみる',
      action: 'テスト実行',
      onClick: () => window.open('/test-reservation', '_blank')
    }
  ];

  return (
    <div className="wizard-step completion-step">
      <div className="step-header completion-header">
        <Sparkles size={48} className="completion-icon" />
        <div>
          <h2>🎉 セットアップ完了！</h2>
          <p>{basicInfo.name} の設定が完了しました</p>
        </div>
      </div>

      <div className="step-content">
        {/* 成功メッセージ */}
        {completion.setupComplete && (
          <div className="success-banner">
            <CheckCircle size={24} />
            <div>
              <h3>店舗が正常に作成されました</h3>
              <p>店舗ID: {completion.storeId}</p>
            </div>
          </div>
        )}

        {/* セットアップ概要 */}
        <div className="form-section">
          <h3>セットアップ概要</h3>
          
          <div className="setup-summary">
            {setupSummary.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className={`summary-item ${item.status}`}>
                  <div className="summary-header">
                    <Icon size={20} />
                    <h4>{item.title}</h4>
                    <span className={`status-badge ${item.status}`}>
                      {item.status === 'completed' ? '完了' : 'スキップ'}
                    </span>
                  </div>
                  
                  {showDetails && (
                    <div className="summary-details">
                      {item.details.map((detail, i) => (
                        <p key={i}>{detail}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <button 
            className="btn-link"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '詳細を非表示' : '詳細を表示'}
          </button>
        </div>

        {/* LINE Bot 情報 */}
        {lineSetup.channelId && (
          <div className="form-section">
            <h3>
              <MessageSquare size={20} />
              LINE Bot 情報
            </h3>
            
            <div className="line-bot-info">
              <div className="info-card">
                <h4>友だち追加URL</h4>
                <div className="url-display">
                  <code>https://line.me/R/ti/p/@{lineSetup.channelId}</code>
                  <button 
                    className="copy-btn"
                    onClick={copyLineUrl}
                    title="URLをコピー"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="info-card">
                <h4>Webhook URL</h4>
                <div className="url-display">
                  <code>{lineSetup.webhookUrl}</code>
                  <button 
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(lineSetup.webhookUrl)}
                    title="URLをコピー"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 次のステップ */}
        <div className="form-section">
          <h3>次のステップ</h3>
          
          <div className="next-steps">
            {nextSteps.map((step, index) => (
              <div key={index} className="next-step-card">
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
                <button 
                  className="btn-secondary"
                  onClick={step.onClick}
                  disabled={step.disabled}
                >
                  {step.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* QRコード表示 */}
        {qrCodeGenerated && (
          <div className="form-section">
            <h3>
              <QrCode size={20} />
              QRコード
            </h3>
            
            <div className="qr-code-display">
              <div className="qr-placeholder">
                <QrCode size={120} />
                <p>LINE Bot QRコード</p>
              </div>
              <div className="qr-actions">
                <button className="btn-secondary">
                  <Download size={16} />
                  ダウンロード
                </button>
                <button className="btn-secondary">
                  <Share2 size={16} />
                  シェア
                </button>
              </div>
            </div>
          </div>
        )}

        {/* リソース */}
        <div className="form-section">
          <h3>役立つリソース</h3>
          
          <div className="resource-links">
            <a href="#" onClick={downloadSetupGuide} className="resource-link">
              <Download size={16} />
              <div>
                <h4>セットアップガイド</h4>
                <p>設定内容と次のステップをまとめたファイル</p>
              </div>
            </a>
            
            <a href="/docs" target="_blank" className="resource-link">
              <ExternalLink size={16} />
              <div>
                <h4>ユーザーガイド</h4>
                <p>詳細な使用方法とトラブルシューティング</p>
              </div>
            </a>
            
            <a href="/support" target="_blank" className="resource-link">
              <ExternalLink size={16} />
              <div>
                <h4>サポート</h4>
                <p>技術サポートとお問い合わせ</p>
              </div>
            </a>
          </div>
        </div>

        {/* お疲れ様メッセージ */}
        <div className="completion-message">
          <h3>🎊 お疲れ様でした！</h3>
          <p>
            {basicInfo.name} のセットアップが完了しました。<br />
            これで AI チャットボットを使った予約システムをご利用いただけます。<br />
            ご不明な点がございましたら、いつでもサポートまでお気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompletionStep;