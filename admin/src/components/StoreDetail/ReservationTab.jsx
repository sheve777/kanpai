import React, { useState } from 'react';
import {
  Clock,
  Users,
  Calendar,
  Settings,
  AlertCircle,
  Info,
  Save,
  Utensils,
  Coffee,
  Plus,
  Trash2
} from 'lucide-react';

const ReservationTab = ({ data, onDataChange, onSave }) => {
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field, value) => {
    const newData = { ...data, [field]: value };
    onDataChange('reservationSettings', newData);
    setHasChanges(true);
  };


  const handleDayToggle = (dayIndex) => {
    const availableDays = data.availableDays || [];
    const newDays = availableDays.includes(dayIndex)
      ? availableDays.filter(d => d !== dayIndex)
      : [...availableDays, dayIndex].sort();
    
    handleInputChange('availableDays', newDays);
  };

  const handleTableSeatTypeChange = (index, field, value) => {
    const newTableSeatTypes = [...(data.tableSeatTypes || [])];
    newTableSeatTypes[index] = { ...newTableSeatTypes[index], [field]: value };
    
    // 最大収容席数を再計算（各テーブルサイズ × テーブル数の合計）
    const totalSeats = newTableSeatTypes.reduce((sum, type) => sum + (type.size * type.count), 0);
    
    onDataChange('reservationSettings', {
      ...data,
      tableSeatTypes: newTableSeatTypes,
      tableSeats: totalSeats
    });
    setHasChanges(true);
  };

  const addTableSeatType = () => {
    const newTableSeatTypes = [...(data.tableSeatTypes || []), { size: 4, count: 1, minPeople: 2 }];
    handleInputChange('tableSeatTypes', newTableSeatTypes);
  };

  const removeTableSeatType = (index) => {
    const newTableSeatTypes = data.tableSeatTypes.filter((_, i) => i !== index);
    
    // 合計席数を再計算
    const totalSeats = newTableSeatTypes.reduce((sum, type) => sum + (type.size * type.count), 0);
    
    onDataChange('reservationSettings', {
      ...data,
      tableSeatTypes: newTableSeatTypes,
      tableSeats: totalSeats
    });
    setHasChanges(true);
  };

  const handleSave = async (section = 'reservationSettings') => {
    try {
      await onSave(section);
      setHasChanges(false);
      alert('予約システム設定を保存しました');
    } catch (error) {
      alert('保存に失敗しました');
    }
  };

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  const renderSection = (id, title, icon, children, showSaveButton = false) => {
    const Icon = icon;

    return (
      <div className="settings-section">
        <div className="section-header-static">
          <div className="section-title">
            <Icon size={20} />
            <h3>{title}</h3>
          </div>
          {showSaveButton && hasChanges && (
            <button 
              className="btn-sm btn-primary" 
              onClick={() => handleSave()}
            >
              <Save size={14} />
              保存
            </button>
          )}
        </div>
        <div className="section-content">
          {children}
        </div>
      </div>
    );
  };

  if (!data) {
    return (
      <div className="no-reservation-settings">
        <AlertCircle size={48} />
        <h3>予約システム設定が見つかりません</h3>
        <p>まず基本的な予約システム設定を行ってください。</p>
        <button 
          className="btn-primary"
          onClick={() => handleInputChange('tableSeats', 20)}
        >
          設定を開始
        </button>
      </div>
    );
  }

  return (
    <div className="reservation-tab">
      <div className="tab-header">
        <div className="header-content">
          <h2>🪑 予約システム設定</h2>
          <p>座席数、予約時間、運用ルールなどを設定できます</p>
        </div>
        {hasChanges && (
          <button className="btn-primary save-btn" onClick={handleSave}>
            <Save size={16} />
            変更を保存
          </button>
        )}
      </div>

      {/* 設定概要 */}
      <div className="settings-overview">
        <div className="overview-card">
          <Utensils size={20} />
          <div>
            <span className="overview-value">{(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0)}</span>
            <span className="overview-label">テーブル数</span>
            <span className="overview-sub">予約可: {data.reservableTableCount || 0}テーブル</span>
          </div>
        </div>
        <div className="overview-card">
          <Coffee size={20} />
          <div>
            <span className="overview-value">{data.counterSeats || 0}</span>
            <span className="overview-label">カウンター席数</span>
            <span className="overview-sub">予約可: {data.reservableCounterSeats || 0}席</span>
          </div>
        </div>
        <div className="overview-card">
          <Clock size={20} />
          <div>
            <span className="overview-value">{data.defaultDuration || 0}</span>
            <span className="overview-label">予約時間（分）</span>
          </div>
        </div>
        <div className="overview-card">
          <Calendar size={20} />
          <div>
            <span className="overview-value">{data.timeSlots || 30}</span>
            <span className="overview-label">予約間隔（分）</span>
          </div>
        </div>
      </div>

      {/* 座席設定 */}
      {renderSection('seating', '座席設定', Utensils, (
        <div>
          <div className="table-seat-types">
            <div className="table-types-header">
              <h4>テーブルサイズ設定</h4>
              <button
                type="button"
                className="btn-add-table-type"
                onClick={addTableSeatType}
              >
                <Plus size={16} />
                テーブルタイプ追加
              </button>
            </div>
            
            <div className="table-types-list">
              {(data.tableSeatTypes || []).map((type, index) => (
                <div key={index} className="table-type-row">
                  <div className="table-type-inputs">
                    <div className="input-group">
                      <label>人数</label>
                      <select
                        value={type.size}
                        onChange={(e) => handleTableSeatTypeChange(index, 'size', parseInt(e.target.value))}
                      >
                        <option value={1}>1人がけ</option>
                        <option value={2}>2人がけ</option>
                        <option value={3}>3人がけ</option>
                        <option value={4}>4人がけ</option>
                        <option value={6}>6人がけ</option>
                        <option value={8}>8人がけ</option>
                        <option value={10}>10人がけ</option>
                      </select>
                    </div>
                    
                    <div className="input-group">
                      <label>テーブル数</label>
                      <input
                        type="number"
                        value={type.count}
                        onChange={(e) => handleTableSeatTypeChange(index, 'count', parseInt(e.target.value) || 0)}
                        min="0"
                        max="20"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label>最少予約人数</label>
                      <input
                        type="number"
                        value={type.minPeople || 1}
                        onChange={(e) => handleTableSeatTypeChange(index, 'minPeople', parseInt(e.target.value) || 1)}
                        min="1"
                        max={type.size}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="btn-remove-table-type"
                    onClick={() => removeTableSeatType(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              {(!data.tableSeatTypes || data.tableSeatTypes.length === 0) && (
                <div className="no-table-types">
                  <p>テーブルタイプが設定されていません</p>
                </div>
              )}
            </div>
            
            <div className="table-seats-total">
              <strong>テーブル合計:</strong> {(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0)}テーブル
              <span className="seats-info">（最大収容: {data.tableSeats || 0}席）</span>
            </div>
          </div>
          
          <div className="form-grid" style={{ marginTop: '24px' }}>
            <div className="form-group">
              <label>カウンター席数</label>
              <input
                type="number"
                value={data.counterSeats || ''}
                onChange={(e) => handleInputChange('counterSeats', parseInt(e.target.value) || 0)}
                min="0"
                max="50"
              />
              <small>カウンター席の総数を入力してください</small>
            </div>

            <div className="form-group">
              <label>カウンター席間隔</label>
              <select
                value={data.counterSpacing || 0}
                onChange={(e) => handleInputChange('counterSpacing', parseInt(e.target.value))}
              >
                <option value={0}>間隔なし（全席利用可能）</option>
                <option value={1}>1席置き</option>
                <option value={2}>2席置き</option>
              </select>
              <small>コロナ対策等でカウンター席の間隔を空ける場合に設定</small>
            </div>
          </div>

          {/* 予約可能数設定 */}
          <div className="reservable-seats-setting">
            <h4>予約可能数設定</h4>
            <p className="setting-description">
              当日の飛び込み客用に確保しておきたい席数を差し引いた、予約可能な席数を設定できます
            </p>
            
            <div className="reservable-inputs">
              <div className="reservable-input-group">
                <label>予約可能なテーブル数</label>
                <div className="input-with-info">
                  <input
                    type="number"
                    value={data.reservableTableCount || ''}
                    onChange={(e) => handleInputChange('reservableTableCount', parseInt(e.target.value) || 0)}
                    min="0"
                    max={(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0)}
                  />
                  <span className="seat-info">/ {(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0)}テーブル</span>
                </div>
                <small>当日用: {(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0) - (data.reservableTableCount || 0)}テーブル</small>
              </div>

              <div className="reservable-input-group">
                <label>予約可能なカウンター席数</label>
                <div className="input-with-info">
                  <input
                    type="number"
                    value={data.reservableCounterSeats || ''}
                    onChange={(e) => handleInputChange('reservableCounterSeats', parseInt(e.target.value) || 0)}
                    min="0"
                    max={data.counterSeats || 50}
                  />
                  <span className="seat-info">/ {data.counterSeats || 0}席</span>
                </div>
                <small>当日用: {(data.counterSeats || 0) - (data.reservableCounterSeats || 0)}席</small>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 時間設定 */}
      {renderSection('timing', '時間設定', Clock, (
        <div className="settings-form-grid">
          <div className="form-group">
            <label>デフォルト予約時間</label>
            <div className="duration-input">
              <input
                type="number"
                value={data.defaultDuration || ''}
                onChange={(e) => handleInputChange('defaultDuration', parseInt(e.target.value) || 0)}
                min="30"
                max="300"
                step="15"
              />
              <span>分</span>
            </div>
            <small>標準的な1回の予約時間を設定してください</small>
          </div>

          <div className="form-group">
            <label>予約枠間隔</label>
            <select
              value={data.timeSlots || 30}
              onChange={(e) => handleInputChange('timeSlots', parseInt(e.target.value))}
            >
              <option value={15}>15分間隔</option>
              <option value={30}>30分間隔</option>
              <option value={45}>45分間隔</option>
              <option value={60}>60分間隔</option>
            </select>
            <small>予約可能な時間の間隔を設定</small>
          </div>

          <div className="form-group">
            <label>開店時間</label>
            <input
              type="time"
              value={data.openingTime || ''}
              onChange={(e) => handleInputChange('openingTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>閉店時間</label>
            <input
              type="time"
              value={data.closingTime || ''}
              onChange={(e) => handleInputChange('closingTime', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>ラストオーダー</label>
            <input
              type="time"
              value={data.lastOrder || ''}
              onChange={(e) => handleInputChange('lastOrder', e.target.value)}
            />
            <small>食事の最終注文受付時間</small>
          </div>

          <div className="form-group full-width">
            <label>営業曜日</label>
            <div className="day-selector">
              {dayNames.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  className={`day-btn ${(data.availableDays || []).includes(index) ? 'active' : ''}`}
                  onClick={() => handleDayToggle(index)}
                >
                  {day}
                </button>
              ))}
            </div>
            <small>営業する曜日を選択してください</small>
          </div>
        </div>
      ), true)}

      {/* 予約ルール */}
      {renderSection('rules', '予約ルール', Settings, (
        <div className="settings-form-grid">
          <div className="form-group">
            <label>事前予約可能日数</label>
            <select
              value={data.advanceBookingDays || 30}
              onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value))}
            >
              <option value={7}>1週間前まで</option>
              <option value={14}>2週間前まで</option>
              <option value={30}>1ヶ月前まで</option>
              <option value={60}>2ヶ月前まで</option>
              <option value={90}>3ヶ月前まで</option>
            </select>
          </div>

          <div className="form-group">
            <label>キャンセル期限</label>
            <div className="duration-input">
              <input
                type="number"
                value={data.cancellationDeadline || ''}
                onChange={(e) => handleInputChange('cancellationDeadline', parseInt(e.target.value) || 0)}
                min="1"
                max="48"
              />
              <span>時間前</span>
            </div>
            <small>予約のキャンセル・変更可能な期限</small>
          </div>

          <div className="form-group">
            <label>当日予約</label>
            <select
              value={data.allowSameDayBooking ? 'enabled' : 'disabled'}
              onChange={(e) => handleInputChange('allowSameDayBooking', e.target.value === 'enabled')}
            >
              <option value="enabled">受け付ける</option>
              <option value="disabled">受け付けない</option>
            </select>
            <small>当日の予約を受け付けるかどうか</small>
          </div>
        </div>
      ), true)}


      {/* 設定プレビュー */}
      <div className="settings-preview">
        <div className="preview-header">
          <Info size={20} />
          <h3>設定プレビュー</h3>
        </div>
        <div className="preview-content">
          <div className="preview-item">
            <strong>総座席数:</strong> {(data.tableSeats || 0) + (data.counterSeats || 0)}席
            （テーブル: {(data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0)}テーブル/{data.tableSeats || 0}席、カウンター: {data.counterSeats || 0}席）
          </div>
          <div className="preview-item">
            <strong>予約可能数:</strong> {data.reservableTableCount || 0}テーブル + {data.reservableCounterSeats || 0}席
            （テーブル: {data.reservableTableCount || 0}テーブル、カウンター: {data.reservableCounterSeats || 0}席）
          </div>
          <div className="preview-item">
            <strong>当日確保:</strong> {((data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0) - (data.reservableTableCount || 0))}テーブル + {((data.counterSeats || 0) - (data.reservableCounterSeats || 0))}席
            （テーブル: {((data.tableSeatTypes || []).reduce((sum, type) => sum + type.count, 0) - (data.reservableTableCount || 0))}テーブル、カウンター: {(data.counterSeats || 0) - (data.reservableCounterSeats || 0)}席）
          </div>
          <div className="preview-item">
            <strong>営業時間:</strong> {data.openingTime || '--:--'} ～ {data.closingTime || '--:--'}
            （LO: {data.lastOrder || '--:--'}）
          </div>
          <div className="preview-item">
            <strong>予約時間:</strong> {data.defaultDuration || 0}分 / {data.timeSlots || 30}分間隔
          </div>
          <div className="preview-item">
            <strong>営業曜日:</strong> {
              (data.availableDays || []).length === 7 ? '毎日' :
              (data.availableDays || []).map(i => dayNames[i]).join('、') || '未設定'
            }
          </div>
          <div className="preview-item">
            <strong>当日予約:</strong> {data.allowSameDayBooking ? '受付中' : '受付停止'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationTab;