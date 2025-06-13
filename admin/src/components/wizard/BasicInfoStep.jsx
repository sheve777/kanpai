import React from 'react';
import { Store, Phone, MapPin, Clock, CreditCard } from 'lucide-react';

const BasicInfoStep = ({ data, updateData, errors }) => {
  const { basicInfo } = data;
  
  const handleChange = (field, value) => {
    updateData('basicInfo', { [field]: value });
  };

  const handleTimeChange = (day, type, value) => {
    const newHours = {
      ...basicInfo.operatingHours,
      [day]: {
        ...basicInfo.operatingHours[day],
        [type]: value
      }
    };
    updateData('basicInfo', { operatingHours: newHours });
  };

  const handleClosedToggle = (day) => {
    const newHours = {
      ...basicInfo.operatingHours,
      [day]: {
        ...basicInfo.operatingHours[day],
        closed: !basicInfo.operatingHours[day].closed
      }
    };
    updateData('basicInfo', { operatingHours: newHours });
  };

  const dayLabels = {
    monday: '月曜日',
    tuesday: '火曜日',
    wednesday: '水曜日',
    thursday: '木曜日',
    friday: '金曜日',
    saturday: '土曜日',
    sunday: '日曜日'
  };

  const planOptions = [
    {
      id: 'entry',
      name: 'エントリープラン',
      price: '¥10,000/月',
      features: ['基本的なチャットボット', 'LINE配信 100通/月', 'レポート機能']
    },
    {
      id: 'standard',
      name: 'スタンダードプラン',
      price: '¥30,000/月',
      features: ['高度なチャットボット', 'LINE配信 500通/月', '分析機能', 'Google連携']
    },
    {
      id: 'pro',
      name: 'プロプラン',
      price: '¥50,000/月',
      features: ['全機能利用可能', 'LINE配信 1000通/月', '詳細分析', 'API連携', '優先サポート']
    }
  ];

  return (
    <div className="wizard-step basic-info-step">
      <div className="step-header">
        <Store size={32} />
        <div>
          <h2>基本情報の入力</h2>
          <p>店舗の基本的な情報を入力してください</p>
        </div>
      </div>

      <div className="step-content">
        {/* 店舗情報セクション */}
        <div className="form-section">
          <h3>店舗情報</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="storeName">
                <Store size={16} />
                店舗名 *
              </label>
              <input
                type="text"
                id="storeName"
                value={basicInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例: 居酒屋 花まる"
                className={errors.basic?.name ? 'error' : ''}
              />
              {errors.basic?.name && (
                <span className="error-message">{errors.basic.name}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">
                <Phone size={16} />
                電話番号 *
              </label>
              <input
                type="tel"
                id="phone"
                value={basicInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="例: 03-1234-5678"
                className={errors.basic?.phone ? 'error' : ''}
              />
              {errors.basic?.phone && (
                <span className="error-message">{errors.basic.phone}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="address">
                <MapPin size={16} />
                住所 *
              </label>
              <input
                type="text"
                id="address"
                value={basicInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="例: 東京都渋谷区..."
                className={errors.basic?.address ? 'error' : ''}
              />
              {errors.basic?.address && (
                <span className="error-message">{errors.basic.address}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="concept">
                店舗コンセプト
              </label>
              <textarea
                id="concept"
                value={basicInfo.concept}
                onChange={(e) => handleChange('concept', e.target.value)}
                placeholder="例: アットホームな雰囲気の居酒屋です"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* 営業時間セクション */}
        <div className="form-section">
          <h3>
            <Clock size={20} />
            営業時間
          </h3>
          
          <div className="operating-hours">
            {Object.entries(basicInfo.operatingHours).map(([day, hours]) => (
              <div key={day} className="hours-row">
                <div className="day-label">
                  {dayLabels[day]}
                </div>
                
                <div className="hours-inputs">
                  <label>
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={() => handleClosedToggle(day)}
                    />
                    定休日
                  </label>
                  
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                      />
                      <span>〜</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* プラン選択セクション */}
        <div className="form-section">
          <h3>
            <CreditCard size={20} />
            初期プラン選択
          </h3>
          
          <div className="plan-options">
            {planOptions.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${basicInfo.plan === plan.id ? 'selected' : ''}`}
                onClick={() => handleChange('plan', plan.id)}
              >
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  <div className="plan-price">{plan.price}</div>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;