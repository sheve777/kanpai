// C:\Users\acmsh\kanpAI\frontend\src\components\LineBroadcast.js (修正版)
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const LineBroadcast = ({ storeId }) => {
    const [message, setMessage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', text: '' });
    
    // ★★★ NEW: LINE制限関連のstate ★★★
    const [lineUsageStatus, setLineUsageStatus] = useState(null);
    const [showLimitWarning, setShowLimitWarning] = useState(false);
    const [limitCheckResult, setLimitCheckResult] = useState(null);

    // LINE使用状況を取得
    useEffect(() => {
        const fetchLineUsage = async () => {
            if (!storeId) return;
            
            try {
                const response = await api.get(`/api/line/usage-status?store_id=${storeId}`);
                setLineUsageStatus(response.data);
                
                // 制限に近い場合は警告を表示
                if (response.data.lineOfficialPlan?.alertLevel !== 'normal') {
                    setShowLimitWarning(true);
                }
            } catch (error) {
                console.error('LINE使用状況の取得に失敗:', error);
                // エラー時はデフォルト値を設定
                setLineUsageStatus({
                    friendsCount: 1250,
                    lineOfficialPlan: {
                        alertLevel: 'normal',
                        usagePercentage: 0
                    }
                });
            }
        };

        fetchLineUsage();
        
        // 定期的に更新（2分ごと）
        const interval = setInterval(fetchLineUsage, 2 * 60 * 1000);
        return () => clearInterval(interval);
    }, [storeId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewUrl('');
        const fileInput = document.getElementById('imageUpload');
        if (fileInput) fileInput.value = '';
    };

    // ★★★ NEW: 配信前の制限チェック ★★★
    const checkLimitBeforeSend = async () => {
        if (!lineUsageStatus) return true; // データなしの場合は送信許可

        try {
            const response = await api.post('/api/usage/check-line-limit', {
                store_id: storeId,
                recipient_count: lineUsageStatus.friendsCount
            });

            setLimitCheckResult(response.data);
            
            if (!response.data.canSend) {
                setShowLimitWarning(true);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('制限チェックエラー:', error);
            return true; // エラー時は送信許可
        }
    };

    const handleBroadcast = async (forceSend = false) => {
        if (!message.trim()) {
            setFeedback({ type: 'error', text: 'メッセージを入力してください。' });
            return;
        }

        // ★★★ NEW: 配信前制限チェック ★★★
        if (!forceSend) {
            const canSend = await checkLimitBeforeSend();
            if (!canSend) {
                return;
            }
        }

        setIsSending(true);
        setFeedback({ type: '', text: '' });
        let uploadedImageUrl = '';

        try {
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                uploadedImageUrl = uploadRes.data.imageUrl;
            }

            const response = await api.post('/api/line/broadcast', {
                store_id: storeId,
                message_text: message,
                image_url: uploadedImageUrl,
                force_send: forceSend
            });

            setFeedback({ type: 'success', text: 'メッセージを送信しました！' });
            
            // 送信成功後に使用状況を更新
            if (response.data.usageInfo) {
                setLineUsageStatus(prev => ({
                    ...prev,
                    lineOfficialPlan: response.data.usageInfo
                }));
            }

            setMessage('');
            setImageFile(null);
            setPreviewUrl('');
            setLimitCheckResult(null);
            
            const fileInput = document.getElementById('imageUpload');
            if (fileInput) fileInput.value = '';
            
        } catch (error) {
            console.error('LINE配信エラー:', error);
            
            // 制限エラーの場合は詳細な情報を表示
            if (error.response?.status === 429) {
                setLimitCheckResult(error.response.data.limitInfo);
                setShowLimitWarning(true);
                setFeedback({ 
                    type: 'error', 
                    text: 'LINE公式アカウントの月間配信制限に到達しています。' 
                });
            } else {
                setFeedback({ 
                    type: 'error', 
                    text: error.response?.data?.error || 'メッセージの送信に失敗しました。' 
                });
            }
        } finally {
            setIsSending(false);
        }
    };

    // ★★★ NEW: 制限警告の表示レベルを決定 ★★★
    const getHeaderAlert = () => {
        if (!lineUsageStatus?.lineOfficialPlan) return null;

        const { alertLevel, usagePercentage } = lineUsageStatus.lineOfficialPlan;

        switch (alertLevel) {
            case 'critical':
                return {
                    className: 'line-header-critical',
                    icon: '🚨',
                    message: 'LINE社の月間配信制限に達したため、今月の配信ができません',
                    actionText: '解決方法を見る'
                };
            case 'warning':
                return {
                    className: 'line-header-warning', 
                    icon: '⚠️',
                    message: 'LINE公式の配信上限まで残りわずかです',
                    actionText: '今すぐ確認'
                };
            case 'attention':
                return {
                    className: 'line-header-attention',
                    icon: '💡',
                    message: `LINE公式の配信上限まで残り${(100 - usagePercentage).toFixed(0)}%です`,
                    actionText: '詳細'
                };
            default:
                return null;
        }
    };

    const headerAlert = getHeaderAlert();

    return (
        <div className="card line-broadcast-container">
            {/* Header */}
            <div className="card-header">
                <div className="summary-icon">💬</div>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0 }}>LINE一斉配信</h2>
                    {lineUsageStatus && (
                        <div className="friends-count">
                            友だち数: {lineUsageStatus.friendsCount.toLocaleString()}名
                        </div>
                    )}
                </div>
            </div>

            {/* ★★★ NEW: 制限警告バナー ★★★ */}
            {headerAlert && (
                <div className={`line-limit-banner ${headerAlert.className}`}>
                    <div className="banner-content">
                        <span className="banner-icon">{headerAlert.icon}</span>
                        <span className="banner-message">{headerAlert.message}</span>
                    </div>
                    <button 
                        className="banner-action-btn"
                        onClick={() => setShowLimitWarning(true)}
                    >
                        {headerAlert.actionText}
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="broadcast-main">
                {/* Form Section */}
                <div className="broadcast-form">
                    {/* Message Input */}
                    <div className="form-group">
                        <label htmlFor="messageInput" className="form-label">
                            メッセージ内容
                        </label>
                        <textarea
                            id="messageInput"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="お客様へのメッセージを入力してください..."
                            disabled={isSending || headerAlert?.className === 'line-header-critical'}
                            className="message-textarea"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">
                            画像（任意）
                        </label>
                        
                        {!imageFile ? (
                            <div>
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    disabled={headerAlert?.className === 'line-header-critical'}
                                />
                                <label 
                                    htmlFor="imageUpload" 
                                    className={`image-upload-button ${headerAlert?.className === 'line-header-critical' ? 'disabled' : ''}`}
                                >
                                    <span>📁</span>
                                    画像を選択
                                </label>
                            </div>
                        ) : (
                            <div className="selected-image-container">
                                <div className="selected-image-preview">
                                    <img src={previewUrl} alt="Selected" />
                                </div>
                                <div className="selected-image-info">
                                    <div className="image-name">{imageFile.name}</div>
                                    <div className="image-size">
                                        {(imageFile.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="remove-image-button"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => handleBroadcast(false)}
                        disabled={isSending || !message.trim() || headerAlert?.className === 'line-header-critical'}
                        className={`broadcast-submit-button ${
                            isSending || !message.trim() || headerAlert?.className === 'line-header-critical' 
                                ? 'disabled' 
                                : ''
                        }`}
                    >
                        {isSending ? '送信中...' : '全員に送信する'}
                    </button>

                    {/* Feedback */}
                    {feedback.text && (
                        <div className={`feedback ${feedback.type}`}>
                            {feedback.text}
                        </div>
                    )}
                </div>

                {/* Preview Section */}
                <div className="preview-section">
                    <h3 className="preview-title">プレビュー</h3>
                    
                    <div className="phone-mockup">
                        <div className="phone-notch" />
                        
                        <div className="phone-screen">
                            <div className="line-header">
                                <div className="store-avatar">店</div>
                                <div className="store-info">
                                    <div className="store-name">居酒屋○○</div>
                                    <div className="store-label">公式アカウント</div>
                                </div>
                            </div>

                            <div className="message-bubble">
                                {previewUrl && (
                                    <div className="message-image">
                                        <img src={previewUrl} alt="Preview" />
                                    </div>
                                )}
                                
                                {message ? (
                                    <div className="message-text">
                                        {message}
                                    </div>
                                ) : null}
                                
                                {!previewUrl && !message && (
                                    <div className="preview-placeholder">
                                        メッセージや画像を入力すると<br />ここにプレビューが表示されます
                                    </div>
                                )}
                            </div>

                            {(message || previewUrl) && (
                                <div className="message-time">
                                    {new Date().toLocaleTimeString('ja-JP', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ★★★ NEW: 制限警告モーダル ★★★ */}
            {showLimitWarning && limitCheckResult && (
                <div className="modal-overlay" onClick={() => setShowLimitWarning(false)}>
                    <div className="limit-warning-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>⚠️ LINE公式アカウントの配信制限について</h3>
                        
                        <div className="limit-details">
                            <p><strong>現在の状況:</strong></p>
                            <ul>
                                <li>配信先: {limitCheckResult.friendsCount.toLocaleString()}名</li>
                                <li>現在使用: {limitCheckResult.currentUsage.toLocaleString()}通</li>
                                <li>配信後: {limitCheckResult.afterSendUsage.toLocaleString()}通</li>
                                <li>月間上限: {limitCheckResult.lineOfficialPlan.limit.toLocaleString()}通</li>
                            </ul>
                            
                            {!limitCheckResult.canSend && (
                                <div className="exceeded-warning">
                                    <strong>❌ この配信はLINE社の月間制限を超過します</strong>
                                </div>
                            )}
                        </div>

                        <div className="solution-options">
                            <h4>解決方法:</h4>
                            <div className="solution-list">
                                <button className="solution-btn primary">
                                    LINE公式プランをアップグレード<br />
                                    <small>kanpAI代行サービス: 10,000円</small>
                                </button>
                                <button className="solution-btn secondary">
                                    来月1日まで待つ<br />
                                    <small>制限が自動リセットされます</small>
                                </button>
                                {!limitCheckResult.canSend && (
                                    <button 
                                        className="solution-btn danger"
                                        onClick={() => {
                                            setShowLimitWarning(false);
                                            handleBroadcast(true);
                                        }}
                                    >
                                        今回のみ強制送信<br />
                                        <small>⚠️ 非推奨: LINE社の制限に抵触する可能性</small>
                                    </button>
                                )}
                            </div>
                        </div>

                        <button 
                            className="close-modal-btn"
                            onClick={() => setShowLimitWarning(false)}
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LineBroadcast;
