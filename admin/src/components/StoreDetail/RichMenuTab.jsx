import React, { useState } from 'react';
import { Palette, Menu as MenuIcon, Upload, Save, Send, Move, Plus, Trash2, Grid3X3, Grid } from 'lucide-react';

const RichMenuTab = ({ data, onInputChange, onSave, onDeploy, saving }) => {
  const [previewMode, setPreviewMode] = useState('normal');
  const [draggedButton, setDraggedButton] = useState(null);

  // 利用可能なボタンタイプの定義
  const availableButtonTypes = [
    { id: 'reserve', text: '予約する', icon: '🍽️', category: 'core' },
    { id: 'chat', text: 'チャット', icon: '💬', category: 'core' },
    { id: 'menu', text: 'メニュー', icon: '📋', category: 'core' },
    { id: 'access', text: 'アクセス', icon: '🗺️', category: 'core' },
    { id: 'phone', text: '電話', icon: '📞', category: 'core' },
    { id: 'news', text: 'お知らせ', icon: '📢', category: 'info' },
    { id: 'hours', text: '営業時間', icon: '🕒', category: 'info' },
    { id: 'coupon', text: 'クーポン', icon: '🎫', category: 'promotion' },
    { id: 'event', text: 'イベント', icon: '🎉', category: 'promotion' },
    { id: 'instagram', text: 'Instagram', icon: '📸', category: 'social' },
    { id: 'twitter', text: 'Twitter', icon: '🐦', category: 'social' },
    { id: 'facebook', text: 'Facebook', icon: '👥', category: 'social' },
    { id: 'website', text: 'ウェブサイト', icon: '🌐', category: 'info' },
    { id: 'takeout', text: 'テイクアウト', icon: '🥡', category: 'service' },
    { id: 'delivery', text: 'デリバリー', icon: '🚚', category: 'service' },
    { id: 'wifi', text: 'Wi-Fi情報', icon: '📶', category: 'info' }
  ];

  // レイアウトオプション（LINEは最大3列まで）
  const layoutOptions = [
    { id: '1x1', label: '1×1 (1ボタン)', rows: 1, cols: 1, maxButtons: 1 },
    { id: '1x2', label: '1×2 (2ボタン)', rows: 1, cols: 2, maxButtons: 2 },
    { id: '1x3', label: '1×3 (3ボタン)', rows: 1, cols: 3, maxButtons: 3 },
    { id: '2x1', label: '2×1 (2ボタン)', rows: 2, cols: 1, maxButtons: 2 },
    { id: '2x2', label: '2×2 (4ボタン)', rows: 2, cols: 2, maxButtons: 4 },
    { id: '2x3', label: '2×3 (6ボタン)', rows: 2, cols: 3, maxButtons: 6 }
  ];

  const getCurrentLayout = () => {
    return data?.layout || '2x3';
  };

  const getLayoutConfig = () => {
    return layoutOptions.find(layout => layout.id === getCurrentLayout()) || layoutOptions[0];
  };

  const handleButtonChange = (buttonId, field, value) => {
    const updatedButtons = data?.buttons?.map(button => 
      button.id === buttonId ? { ...button, [field]: value } : button
    );
    onInputChange('richMenu', 'buttons', updatedButtons);
  };

  const handleButtonPreview = (button) => {
    // プレビューでボタンがクリックされた時の実際の動作を実行
    console.log(`プレビュー: ${button.text}ボタンがクリックされました`, button);
    
    switch (button.id) {
      case 'phone':
        if (button.phoneNumber) {
          // 電話アプリを起動
          window.location.href = `tel:${button.phoneNumber}`;
        } else {
          alert('電話番号が設定されていません。\\nボタン設定で電話番号を入力してください。');
        }
        break;
        
      case 'access':
        if (button.mapUrl) {
          // カスタムマップURLを開く
          window.open(button.mapUrl, '_blank');
        } else if (button.address) {
          // Googleマップで住所を検索
          const encodedAddress = encodeURIComponent(button.address);
          window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
        } else {
          alert('住所が設定されていません。\\nボタン設定で店舗住所を入力してください。');
        }
        break;
        
      case 'reserve':
        if (button.reservationType === 'external' && button.reservationUrl) {
          // 外部予約サイトを開く
          window.open(button.reservationUrl, '_blank');
        } else if (button.reservationType === 'webform') {
          alert('Web予約フォームを開きます。\\n（実際の環境では予約フォームページに遷移）');
        } else {
          alert('チャットボット予約を開始します。\\n（実際の環境ではチャットが開始されます）');
        }
        break;
        
      case 'menu':
        if (button.menuPdf) {
          // PDFメニューを開く
          window.open(`/api/files/menu/${button.menuPdf}`, '_blank');
        } else {
          alert('メニューPDFが設定されていません。\\nボタン設定でPDFファイルをアップロードしてください。');
        }
        break;
        
      case 'news':
        if (button.newsUrl) {
          // お知らせページを開く
          window.open(button.newsUrl, '_blank');
        } else {
          alert('お知らせページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'chat':
        alert('チャット機能を開始します。\\n（実際の環境ではLINEチャットが開始されます）');
        break;
        
      case 'news':
        if (button.newsUrl) {
          window.open(button.newsUrl, '_blank');
        } else {
          alert('お知らせページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'website':
        if (button.websiteUrl) {
          window.open(button.websiteUrl, '_blank');
        } else {
          alert('ウェブサイトのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'instagram':
        if (button.instagramUrl) {
          window.open(button.instagramUrl, '_blank');
        } else {
          alert('InstagramのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'twitter':
        if (button.twitterUrl) {
          window.open(button.twitterUrl, '_blank');
        } else {
          alert('TwitterのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'facebook':
        if (button.facebookUrl) {
          window.open(button.facebookUrl, '_blank');
        } else {
          alert('FacebookのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'coupon':
        if (button.couponUrl) {
          window.open(button.couponUrl, '_blank');
        } else {
          alert('クーポンページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'event':
        if (button.eventUrl) {
          window.open(button.eventUrl, '_blank');
        } else {
          alert('イベントページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'takeout':
        if (button.takeoutUrl) {
          window.open(button.takeoutUrl, '_blank');
        } else {
          alert('テイクアウト注文ページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'delivery':
        if (button.deliveryUrl) {
          window.open(button.deliveryUrl, '_blank');
        } else {
          alert('デリバリー注文ページのURLが設定されていません。\\nボタン設定でURLを入力してください。');
        }
        break;
        
      case 'wifi':
        if (button.wifiInfo) {
          alert(`📶 Wi-Fi情報\\n\\n${button.wifiInfo}\\n\\n（実際の環境ではWi-Fi接続情報が表示されます）`);
        } else {
          alert('Wi-Fi情報が設定されていません。\\nボタン設定でWi-Fi情報を入力してください。');
        }
        break;
        
      case 'hours':
        if (button.hoursInfo) {
          alert(`🕒 営業時間\\n\\n${button.hoursInfo}\\n\\n（実際の環境では営業時間情報が表示されます）`);
        } else {
          alert('営業時間情報が設定されていません。\\nボタン設定で営業時間を入力してください。');
        }
        break;
        
      default:
        alert(`${button.text}ボタンがクリックされました！\\n（アクションが設定されていません）`);
    }
  };

  // プレビュー用ドラッグ&ドロップ関数
  const handlePreviewDragStart = (e, buttonIndex) => {
    setDraggedButton(buttonIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  };

  const handlePreviewDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePreviewDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedButton === null || draggedButton === dropIndex) {
      setDraggedButton(null);
      return;
    }

    const buttons = [...(data?.buttons || [])];
    const draggedItem = buttons[draggedButton];
    
    // 要素を削除
    buttons.splice(draggedButton, 1);
    
    // 新しい位置に挿入（全方向対応）
    buttons.splice(dropIndex, 0, draggedItem);
    
    onInputChange('richMenu', 'buttons', buttons);
    setDraggedButton(null);
  };

  const handlePreviewDragEnd = () => {
    setDraggedButton(null);
  };

  // レイアウト変更処理
  const handleLayoutChange = (newLayout) => {
    const layoutConfig = layoutOptions.find(layout => layout.id === newLayout);
    const currentButtons = data?.buttons || [];
    
    // 新しいレイアウトのボタン数制限に合わせて調整
    let adjustedButtons = currentButtons;
    if (currentButtons.length > layoutConfig.maxButtons) {
      adjustedButtons = currentButtons.slice(0, layoutConfig.maxButtons);
      alert(`レイアウト変更により、${currentButtons.length - layoutConfig.maxButtons}個のボタンが削除されました。`);
    }
    
    onInputChange('richMenu', 'layout', newLayout);
    onInputChange('richMenu', 'buttons', adjustedButtons);
  };

  // ボタン追加/削除トグル処理
  const handleAddButton = (buttonType) => {
    const currentButtons = data?.buttons || [];
    const layoutConfig = getLayoutConfig();
    
    // 既に同じタイプのボタンがあるかチェック
    const existingButtonIndex = currentButtons.findIndex(btn => btn.id === buttonType.id);
    
    if (existingButtonIndex !== -1) {
      // ボタンが既に存在する場合は削除（トグル機能）
      const updatedButtons = currentButtons.filter((_, index) => index !== existingButtonIndex);
      onInputChange('richMenu', 'buttons', updatedButtons);
      return;
    }
    
    // ボタンが存在しない場合は追加
    if (currentButtons.length >= layoutConfig.maxButtons) {
      alert(`このレイアウトでは最大${layoutConfig.maxButtons}個までボタンを設置できます。`);
      return;
    }
    
    const newButton = {
      id: buttonType.id,
      text: buttonType.text,
      icon: buttonType.icon,
      // タイプに応じた初期設定
      ...(buttonType.id === 'reserve' && { reservationType: 'chatbot' }),
      ...(buttonType.id === 'phone' && { phoneNumber: '' }),
      ...(buttonType.id === 'access' && { address: '' }),
      ...(buttonType.id === 'menu' && { menuPdf: '' }),
      ...(buttonType.id === 'news' && { newsUrl: '' }),
      ...(buttonType.id === 'website' && { websiteUrl: '' }),
      ...(buttonType.id === 'instagram' && { instagramUrl: '' }),
      ...(buttonType.id === 'twitter' && { twitterUrl: '' }),
      ...(buttonType.id === 'facebook' && { facebookUrl: '' }),
      ...(buttonType.id === 'coupon' && { couponUrl: '' }),
      ...(buttonType.id === 'event' && { eventUrl: '' }),
      ...(buttonType.id === 'takeout' && { takeoutUrl: '' }),
      ...(buttonType.id === 'delivery' && { deliveryUrl: '' }),
      ...(buttonType.id === 'wifi' && { wifiInfo: '' }),
      ...(buttonType.id === 'hours' && { hoursInfo: '' })
    };
    
    const updatedButtons = [...currentButtons, newButton];
    onInputChange('richMenu', 'buttons', updatedButtons);
  };

  // ボタン削除処理
  const handleRemoveButton = (buttonIndex) => {
    const currentButtons = data?.buttons || [];
    const updatedButtons = currentButtons.filter((_, index) => index !== buttonIndex);
    onInputChange('richMenu', 'buttons', updatedButtons);
  };

  // ファイルアップロード処理
  const handleFileUpload = async (buttonId, file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('PDFファイルを選択してください');
      return;
    }

    try {
      // ローカル環境でのファイルアップロードシミュレーション
      if (window.location.hostname === 'localhost') {
        console.log('📄 PDFアップロード（ローカルシミュレーション）:', file.name);
        
        // ファイル名を保存
        handleButtonChange(buttonId, 'menuPdf', file.name);
        alert(`PDFファイル「${file.name}」をアップロードしました（ローカル環境）`);
        return;
      }

      // 本番環境でのファイルアップロード
      const formData = new FormData();
      formData.append('menuPdf', file);
      formData.append('buttonId', buttonId);

      // TODO: 実際のAPIエンドポイントに送信
      // const response = await api.post('/richmenu/upload-menu-pdf', formData);
      
      handleButtonChange(buttonId, 'menuPdf', file.name);
      alert(`PDFファイル「${file.name}」をアップロードしました`);
    } catch (error) {
      console.error('PDFアップロードエラー:', error);
      alert('PDFのアップロードに失敗しました');
    }
  };

  // 背景画像アップロード処理
  const handleBackgroundImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください（JPG, PNG, GIF対応）');
      return;
    }

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください');
      return;
    }

    try {
      // ローカル環境でのファイルアップロードシミュレーション
      if (window.location.hostname === 'localhost') {
        console.log('🖼️ 背景画像アップロード（ローカルシミュレーション）:', file.name);
        
        // プレビュー用のDataURLを作成
        const reader = new FileReader();
        reader.onload = (e) => {
          onInputChange('richMenu', 'design', {
            ...data?.design,
            backgroundImage: e.target.result,
            backgroundImageName: file.name
          });
        };
        reader.readAsDataURL(file);
        
        alert(`背景画像「${file.name}」をアップロードしました（ローカル環境）`);
        return;
      }

      // 本番環境でのファイルアップロード
      const formData = new FormData();
      formData.append('backgroundImage', file);

      // TODO: 実際のAPIエンドポイントに送信
      // const response = await api.post('/richmenu/upload-background', formData);
      
      onInputChange('richMenu', 'design', {
        ...data?.design,
        backgroundImage: `/api/files/richmenu/${file.name}`,
        backgroundImageName: file.name
      });
      alert(`背景画像「${file.name}」をアップロードしました`);
    } catch (error) {
      console.error('背景画像アップロードエラー:', error);
      alert('背景画像のアップロードに失敗しました');
    }
  };

  return (
    <div className="tab-panel">
      <div className="panel-header">
        <h2>LINEリッチメニュー管理</h2>
        <p>お客様がLINEで利用するリッチメニューの設定</p>
      </div>
      
      {/* Rich Menu Preview & Controls */}
      <div className="richmenu-preview-section">
        <h3>📱 リッチメニュープレビュー & 編集</h3>
        <div className="preview-and-controls">
          {/* Left: Preview */}
          <div className="richmenu-preview">
            <div className="line-phone-mockup">
              {/* Phone Frame */}
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-speaker"></div>
                
                {/* LINE Interface */}
                <div className="line-interface">
                  {/* LINE Header */}
                  <div className="line-header">
                    <div className="line-header-left">
                      <div className="back-arrow">‹</div>
                      <div className="store-avatar">
                        <div className="avatar-circle" style={{ backgroundColor: data?.design?.backgroundColor || '#D2691E' }}>
                          {(data?.storeName || '店舗').charAt(0)}
                        </div>
                      </div>
                      <div className="store-info">
                        <div className="store-name">{data?.storeName || '居酒屋 花まる 渋谷店'}</div>
                        <div className="store-status">🟢 オンライン</div>
                      </div>
                    </div>
                    <div className="line-header-right">
                      <div className="header-icon">📞</div>
                      <div className="header-icon">⋯</div>
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div className="line-chat-area">
                    <div className="line-message-bubble">
                      <div className="message-avatar">
                        <div className="avatar-circle small" style={{ backgroundColor: data?.design?.backgroundColor || '#D2691E' }}>
                          {(data?.storeName || '店舗').charAt(0)}
                        </div>
                      </div>
                      <div className="message-content">
                        <div className="message-text">いらっしゃいませ！下のメニューからお選びください🍻</div>
                        <div className="message-time">今すぐ</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rich Menu */}
                  <div 
                    className="line-richmenu" 
                    style={{
                      backgroundColor: data?.design?.backgroundColor || '#D2691E',
                      backgroundImage: data?.design?.backgroundImage ? `url(${data.design.backgroundImage})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      gridTemplateColumns: `repeat(${getLayoutConfig().cols}, 1fr)`,
                      gridTemplateRows: `repeat(${getLayoutConfig().rows}, 1fr)`,
                      height: `${getLayoutConfig().rows * 80}px`
                    }}
                  >
                    {data?.buttons?.map((button, index) => (
                      <div 
                        key={button.id} 
                        className={`line-richmenu-button draggable ${draggedButton === index ? 'dragging' : ''}`}
                        style={{
                          color: data?.design?.textColor || '#FFFFFF',
                          borderColor: data?.design?.accentColor || '#FFD700'
                        }}
                        draggable
                        onDragStart={(e) => handlePreviewDragStart(e, index)}
                        onDragOver={handlePreviewDragOver}
                        onDrop={(e) => handlePreviewDrop(e, index)}
                        onDragEnd={handlePreviewDragEnd}
                        onClick={(e) => {
                          if (!draggedButton) {
                            handleButtonPreview(button);
                          }
                        }}
                      >
                        <div className="richmenu-button-icon">{button.icon}</div>
                        <div className="richmenu-button-text">{button.text}</div>
                        <div className="drag-indicator">⋮⋮</div>
                      </div>
                    ))}
                    
                    {/* 空のスロット */}
                    {Array.from({ length: getLayoutConfig().maxButtons - (data?.buttons?.length || 0) }).map((_, index) => {
                      const actualIndex = (data?.buttons?.length || 0) + index;
                      return (
                        <div 
                          key={`empty-${index}`} 
                          className="line-richmenu-button empty-slot"
                          style={{
                            borderColor: data?.design?.accentColor || '#FFD700',
                            opacity: 0.3
                          }}
                          onDragOver={handlePreviewDragOver}
                          onDrop={(e) => handlePreviewDrop(e, actualIndex)}
                        >
                          <div className="richmenu-button-icon">+</div>
                          <div className="richmenu-button-text">空きスロット</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* LINE Input Area */}
                  <div className="line-input-area">
                    <div className="input-icons">
                      <span>➕</span>
                      <span>📷</span>
                    </div>
                    <div className="message-input">メッセージを入力</div>
                    <div className="input-icons">
                      <span>🎤</span>
                      <span>😊</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="preview-info">
              <p>📱 ドラッグ&ドロップで順序変更・クリックで機能テスト・右側でボタン追加</p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="preview-controls">
            {/* Layout Selector */}
            <div className="control-section">
              <h4>
                <Grid size={16} />
                レイアウト ({getLayoutConfig().label})
              </h4>
              <div className="layout-options-compact">
                {layoutOptions.map((layout) => (
                  <button
                    key={layout.id}
                    className={`layout-option-compact ${getCurrentLayout() === layout.id ? 'active' : ''}`}
                    onClick={() => handleLayoutChange(layout.id)}
                    title={layout.label}
                  >
                    <Grid size={12} />
                    <span>{layout.label}</span>
                  </button>
                ))}
              </div>
              <p className="layout-status">
                {(data?.buttons?.length || 0)}/{getLayoutConfig().maxButtons}ボタン使用中
              </p>
            </div>

            {/* Add Buttons */}
            <div className="control-section">
              <h4>
                <Plus size={16} />
                ボタン追加
              </h4>
              <div className="add-button-expanded">
                {['core', 'info', 'promotion', 'social', 'service'].map(category => {
                  const categoryButtons = availableButtonTypes.filter(btn => btn.category === category);
                  const categoryLabels = {
                    core: '🎯 基本機能',
                    info: 'ℹ️ 店舗情報',
                    promotion: '🎉 特典・イベント',
                    social: '📱 SNS連携',
                    service: '🚚 サービス'
                  };
                  
                  return (
                    <div key={category} className="button-category-expanded">
                      <h5 className="category-title">{categoryLabels[category]}</h5>
                      <div className="button-grid-expanded">
                        {categoryButtons.map(buttonType => {
                          const isAdded = (data?.buttons || []).some(btn => btn.id === buttonType.id);
                          const canAdd = (data?.buttons?.length || 0) < getLayoutConfig().maxButtons;
                          
                          return (
                            <button
                              key={buttonType.id}
                              className={`add-button-expanded ${isAdded ? 'added' : ''} ${!canAdd && !isAdded ? 'disabled' : ''}`}
                              onClick={() => isAdded ? handleAddButton(buttonType) : canAdd ? handleAddButton(buttonType) : null}
                              disabled={!canAdd && !isAdded}
                              title={
                                isAdded ? 'クリックで削除' :
                                !canAdd ? 'ボタン数上限' :
                                `「${buttonType.text}」を追加`
                              }
                            >
                              <div className="button-content">
                                <span className="button-icon-large">{buttonType.icon}</span>
                                <span className="button-text-large">{buttonType.text}</span>
                                {isAdded && <span className="added-indicator-large">✓</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rich Menu Configuration */}
      <div className="richmenu-config-section">
        <h3>🎨 デザイン & 機能設定</h3>
        
        {/* Design Settings */}
        <div className="config-subsection">
          <h4>
            <Palette size={18} />
            デザイン設定
          </h4>
          <div className="design-grid">
            <div className="form-group">
              <label>背景色</label>
              <input
                type="color"
                value={data?.design?.backgroundColor || '#D2691E'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  backgroundColor: e.target.value
                })}
                className="color-input"
              />
            </div>
            <div className="form-group">
              <label>文字色</label>
              <input
                type="color"
                value={data?.design?.textColor || '#FFFFFF'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  textColor: e.target.value
                })}
                className="color-input"
              />
            </div>
            <div className="form-group">
              <label>アクセント色</label>
              <input
                type="color"
                value={data?.design?.accentColor || '#FFD700'}
                onChange={(e) => onInputChange('richMenu', 'design', {
                  ...data?.design,
                  accentColor: e.target.value
                })}
                className="color-input"
              />
            </div>
            <div className="form-group background-image-upload">
              <label>背景画像</label>
              <div className="background-image-section">
                {data?.design?.backgroundImage && (
                  <div className="current-background">
                    <img 
                      src={data.design.backgroundImage} 
                      alt="背景画像プレビュー"
                      className="background-preview"
                    />
                    <div className="background-info">
                      <span className="background-filename">
                        {data?.design?.backgroundImageName || '背景画像'}
                      </span>
                      <button 
                        className="btn-sm btn-outline"
                        onClick={() => onInputChange('richMenu', 'design', {
                          ...data?.design,
                          backgroundImage: null,
                          backgroundImageName: null
                        })}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
                <div className="background-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleBackgroundImageUpload(file);
                      }
                    }}
                    style={{ display: 'none' }}
                    id="background-image-upload"
                  />
                  <label htmlFor="background-image-upload" className="btn-secondary upload-label">
                    <Upload size={16} />
                    {data?.design?.backgroundImage ? '画像を変更' : '背景画像をアップロード'}
                  </label>
                  <small>JPG, PNG, GIF対応（最大5MB）</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Button Configuration */}
        <div className="config-subsection">
          <h4>
            <MenuIcon size={18} />
            ボタン機能設定 ({(data?.buttons?.length || 0)}個のボタン)
          </h4>
          <p className="section-description">
            各ボタンの動作を設定してください。ボタンの追加は右側のボタン追加エリアで、位置変更はプレビュー画面でドラッグ&ドロップして行えます。
          </p>
          <div className="buttons-config">
            {data?.buttons?.map((button, index) => (
              <div key={button.id} className="button-config-card">
                <div className="button-config-header">
                  <span className="button-icon-preview">{button.icon}</span>
                  <span className="button-name">{button.text}</span>
                  <span className="button-position">位置: {index + 1}</span>
                </div>
                <div className="button-config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>ボタンテキスト</label>
                      <input
                        type="text"
                        value={button.text}
                        onChange={(e) => handleButtonChange(button.id, 'text', e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>アイコン</label>
                      <input
                        type="text"
                        value={button.icon}
                        onChange={(e) => handleButtonChange(button.id, 'icon', e.target.value)}
                        className="form-input"
                        placeholder="絵文字"
                      />
                    </div>
                  </div>
                  
                  {/* ボタン別の追加設定 */}
                  {button.id === 'phone' && (
                    <div className="button-action-config">
                      <h5>電話ボタン設定</h5>
                      <div className="form-group">
                        <label>電話番号</label>
                        <input
                          type="tel"
                          value={button.phoneNumber || ''}
                          onChange={(e) => handleButtonChange(button.id, 'phoneNumber', e.target.value)}
                          placeholder="03-1234-5678"
                          className="form-input"
                        />
                        <small>ボタンをタップすると電話アプリで発信</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'access' && (
                    <div className="button-action-config">
                      <h5>アクセスボタン設定</h5>
                      <div className="form-group">
                        <label>店舗住所</label>
                        <input
                          type="text"
                          value={button.address || ''}
                          onChange={(e) => handleButtonChange(button.id, 'address', e.target.value)}
                          placeholder="東京都渋谷区渋谷1-1-1"
                          className="form-input"
                        />
                        <small>ボタンをタップするとGoogleマップで表示</small>
                      </div>
                      <div className="form-group">
                        <label>Googleマップ URL（オプション）</label>
                        <input
                          type="url"
                          value={button.mapUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'mapUrl', e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className="form-input"
                        />
                        <small>カスタムマップURLがある場合</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'reserve' && (
                    <div className="button-action-config">
                      <h5>予約ボタン設定</h5>
                      <div className="form-group">
                        <label>予約方法</label>
                        <select
                          value={button.reservationType || 'chatbot'}
                          onChange={(e) => handleButtonChange(button.id, 'reservationType', e.target.value)}
                          className="form-select"
                        >
                          <option value="chatbot">チャットボット予約</option>
                          <option value="webform">Web予約フォーム</option>
                          <option value="external">外部予約サイト</option>
                        </select>
                      </div>
                      {button.reservationType === 'external' && (
                        <div className="form-group">
                          <label>外部予約サイト URL</label>
                          <input
                            type="url"
                            value={button.reservationUrl || ''}
                            onChange={(e) => handleButtonChange(button.id, 'reservationUrl', e.target.value)}
                            placeholder="https://www.tablecheck.com/..."
                            className="form-input"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {button.id === 'news' && (
                    <div className="button-action-config">
                      <h5>お知らせボタン設定</h5>
                      <div className="form-group">
                        <label>お知らせページ URL</label>
                        <input
                          type="url"
                          value={button.newsUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'newsUrl', e.target.value)}
                          placeholder="https://example.com/news"
                          className="form-input"
                        />
                        <small>店舗のお知らせページURL</small>
                      </div>
                    </div>
                  )}

                  {button.id === 'menu' && (
                    <div className="menu-pdf-config">
                      <h5>メニューPDF設定</h5>
                      <div className="file-upload-section">
                        <div className="current-file">
                          <span>現在のファイル: {button.menuPdf || 'なし'}</span>
                          {button.menuPdf && (
                            <button 
                              className="btn-sm btn-outline"
                              onClick={() => window.open(`/api/files/menu/${button.menuPdf}`, '_blank')}
                            >
                              プレビュー
                            </button>
                          )}
                        </div>
                        <div className="file-upload-container">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleFileUpload(button.id, file);
                              }
                            }}
                            style={{ display: 'none' }}
                            id={`pdf-upload-${button.id}`}
                          />
                          <label htmlFor={`pdf-upload-${button.id}`} className="btn-secondary upload-label">
                            <Upload size={16} />
                            PDFをアップロード
                          </label>
                          <small>PDF形式のみ対応（最大10MB）</small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 追加ボタンタイプの設定 */}
                  {button.id === 'website' && (
                    <div className="button-action-config">
                      <h5>ウェブサイトボタン設定</h5>
                      <div className="form-group">
                        <label>ウェブサイト URL</label>
                        <input
                          type="url"
                          value={button.websiteUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'websiteUrl', e.target.value)}
                          placeholder="https://example.com"
                          className="form-input"
                        />
                        <small>店舗のウェブサイトURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'instagram' && (
                    <div className="button-action-config">
                      <h5>Instagramボタン設定</h5>
                      <div className="form-group">
                        <label>Instagram URL</label>
                        <input
                          type="url"
                          value={button.instagramUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'instagramUrl', e.target.value)}
                          placeholder="https://www.instagram.com/your_account"
                          className="form-input"
                        />
                        <small>InstagramアカウントのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'twitter' && (
                    <div className="button-action-config">
                      <h5>Twitterボタン設定</h5>
                      <div className="form-group">
                        <label>Twitter URL</label>
                        <input
                          type="url"
                          value={button.twitterUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'twitterUrl', e.target.value)}
                          placeholder="https://twitter.com/your_account"
                          className="form-input"
                        />
                        <small>TwitterアカウントのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'facebook' && (
                    <div className="button-action-config">
                      <h5>Facebookボタン設定</h5>
                      <div className="form-group">
                        <label>Facebook URL</label>
                        <input
                          type="url"
                          value={button.facebookUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'facebookUrl', e.target.value)}
                          placeholder="https://www.facebook.com/your_page"
                          className="form-input"
                        />
                        <small>FacebookページのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'coupon' && (
                    <div className="button-action-config">
                      <h5>クーポンボタン設定</h5>
                      <div className="form-group">
                        <label>クーポンページ URL</label>
                        <input
                          type="url"
                          value={button.couponUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'couponUrl', e.target.value)}
                          placeholder="https://example.com/coupon"
                          className="form-input"
                        />
                        <small>クーポンページやキャンペーンページのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'event' && (
                    <div className="button-action-config">
                      <h5>イベントボタン設定</h5>
                      <div className="form-group">
                        <label>イベントページ URL</label>
                        <input
                          type="url"
                          value={button.eventUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'eventUrl', e.target.value)}
                          placeholder="https://example.com/events"
                          className="form-input"
                        />
                        <small>イベント情報ページのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'takeout' && (
                    <div className="button-action-config">
                      <h5>テイクアウトボタン設定</h5>
                      <div className="form-group">
                        <label>テイクアウト注文 URL</label>
                        <input
                          type="url"
                          value={button.takeoutUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'takeoutUrl', e.target.value)}
                          placeholder="https://example.com/takeout"
                          className="form-input"
                        />
                        <small>テイクアウト注文ページのURL</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'delivery' && (
                    <div className="button-action-config">
                      <h5>デリバリーボタン設定</h5>
                      <div className="form-group">
                        <label>デリバリー注文 URL</label>
                        <input
                          type="url"
                          value={button.deliveryUrl || ''}
                          onChange={(e) => handleButtonChange(button.id, 'deliveryUrl', e.target.value)}
                          placeholder="https://example.com/delivery"
                          className="form-input"
                        />
                        <small>デリバリー注文ページのURL（Uber Eats、出前館など）</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'wifi' && (
                    <div className="button-action-config">
                      <h5>Wi-Fi情報ボタン設定</h5>
                      <div className="form-group">
                        <label>Wi-Fi接続情報</label>
                        <textarea
                          value={button.wifiInfo || ''}
                          onChange={(e) => handleButtonChange(button.id, 'wifiInfo', e.target.value)}
                          placeholder="ネットワーク名: Free_WiFi&#10;パスワード: password123&#10;&#10;お気軽にご利用ください"
                          className="form-input"
                          rows="4"
                        />
                        <small>Wi-Fiのネットワーク名とパスワードを入力</small>
                      </div>
                    </div>
                  )}
                  
                  {button.id === 'hours' && (
                    <div className="button-action-config">
                      <h5>営業時間ボタン設定</h5>
                      <div className="form-group">
                        <label>営業時間情報</label>
                        <textarea
                          value={button.hoursInfo || ''}
                          onChange={(e) => handleButtonChange(button.id, 'hoursInfo', e.target.value)}
                          placeholder="月〜金: 17:00-24:00&#10;土日祝: 16:00-24:00&#10;定休日: なし&#10;&#10;ラストオーダー: 23:30"
                          className="form-input"
                          rows="4"
                        />
                        <small>営業時間の詳細情報を入力</small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rich Menu Analytics */}
      <div className="richmenu-analytics-section">
        <h3>リッチメニュー分析</h3>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h4>総クリック数</h4>
            <div className="metric-value">{data?.analytics?.totalClicks?.toLocaleString() || '0'}</div>
          </div>
          <div className="analytics-card">
            <h4>コンバージョン率</h4>
            <div className="metric-value">{((data?.analytics?.conversionRate || 0) * 100).toFixed(1)}%</div>
          </div>
        </div>
        
        <div className="button-analytics">
          <h4>ボタン別クリック数</h4>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>ボタン</th>
                <th>クリック数</th>
                <th>割合</th>
                <th>トレンド</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(data?.analytics?.buttonClicks || {}).map(([buttonId, clicks]) => {
                const button = data?.buttons?.find(b => b.id === buttonId);
                const percentage = data?.analytics?.totalClicks ? 
                  (clicks / data.analytics.totalClicks * 100).toFixed(1) : 0;
                
                return (
                  <tr key={buttonId}>
                    <td>
                      <div className="button-analytics-cell">
                        <span className="button-icon">{button?.icon}</span>
                        <span>{button?.text}</span>
                      </div>
                    </td>
                    <td>{clicks.toLocaleString()}</td>
                    <td>
                      <div className="percentage-bar">
                        <div className="percentage-fill" style={{ width: `${percentage}%` }}></div>
                        <span>{percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="trend-indicator">📈</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="panel-actions">
        <button 
          className="btn-primary"
          onClick={() => onSave('richMenu')}
          disabled={saving}
        >
          <Save size={18} />
          リッチメニュー設定を保存
        </button>
        <button 
          className="btn-success"
          onClick={onDeploy}
          disabled={saving}
        >
          <Send size={18} />
          LINEに配信
        </button>
      </div>
    </div>
  );
};

export default RichMenuTab;