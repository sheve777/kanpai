import React from 'react';
import { useNotification } from './NotificationSystem';

// 通知システムの使用例コンポーネント
const NotificationExample = () => {
  const { showSuccess, showError, showWarning, showInfo, confirm } = useNotification();

  const handleSuccess = () => {
    showSuccess(
      'レポート配信完了',
      '居酒屋 花まる 渋谷店のレポートを配信しました'
    );
  };

  const handleError = () => {
    showError(
      'API接続エラー',
      'OpenAI APIに接続できませんでした。しばらく待ってから再試行してください。'
    );
  };

  const handleWarning = () => {
    showWarning(
      'レポート期限超過',
      '串焼き専門店 炭火屋の12月分レポートが未配信です'
    );
  };

  const handleInfo = () => {
    showInfo(
      'システムメンテナンス',
      '明日午前2:00-4:00の間、システムメンテナンスを実施します'
    );
  };

  const handleConfirm = async () => {
    const result = await confirm({
      title: 'レポート配信確認',
      message: '以下のレポートをLINEで配信しますか？\n\n店舗: 居酒屋 花まる 渋谷店\n対象月: 2024年12月\n\n配信後は顧客に自動送信されます。\n本当に配信しますか？',
      confirmText: '配信',
      cancelText: 'キャンセル'
    });

    if (result) {
      showSuccess('配信開始', 'レポートの配信を開始しました');
    } else {
      showInfo('配信キャンセル', 'レポート配信をキャンセルしました');
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <button onClick={handleSuccess} className="btn-primary">
        成功通知
      </button>
      <button onClick={handleError} className="btn-secondary">
        エラー通知
      </button>
      <button onClick={handleWarning} className="btn-warning">
        警告通知
      </button>
      <button onClick={handleInfo} className="btn-info">
        情報通知
      </button>
      <button onClick={handleConfirm} className="btn-primary">
        確認ダイアログ
      </button>
    </div>
  );
};

export default NotificationExample;