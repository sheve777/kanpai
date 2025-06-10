// C:\Users\acmsh\kanpAI\frontend\src\components\ReservationForm.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosConfig.js';
import './ReservationForm.css';

const ReservationForm = ({ storeId, onReservationComplete }) => {
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        party_size: '',
        reservation_date: '',
        reservation_time: '',
        seat_type_id: '',
        notes: ''
    });
    
    const [availableSeats, setAvailableSeats] = useState([]);
    const [businessStatus, setBusinessStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('form'); // 'form', 'confirm', 'complete'
    const [error, setError] = useState('');
    const [seatCheckLoading, setSeatCheckLoading] = useState(false);

    useEffect(() => {
        fetchBusinessStatus();
    }, [storeId]);

    const checkSeatAvailability = useCallback(async () => {
        if (!formData.reservation_date || !formData.reservation_time || !formData.party_size) {
            return;
        }

        try {
            setSeatCheckLoading(true);
            const response = await api.get('/api/reservations/available-seats', {
                params: {
                    store_id: storeId,
                    reservation_date: formData.reservation_date,
                    reservation_time: formData.reservation_time,
                    party_size: formData.party_size
                }
            });
            setAvailableSeats(response.data.available_seats);
            setError(''); // エラークリア
            
            // 席種が1つしかない場合は自動選択
            if (response.data.available_seats.length === 1) {
                setFormData(prev => ({
                    ...prev,
                    seat_type_id: response.data.available_seats[0].id
                }));
            }
        } catch (error) {
            console.error('❌ 席種確認エラー:', error);
            if (error.response?.data?.errorType === 'SAME_DAY_BOOKING') {
                setError('申し訳ございません、当日のご予約は承っておりません。お電話でお問い合わせください。');
            } else {
                setError('席の空き状況を確認できませんでした。');
            }
            setAvailableSeats([]);
        } finally {
            setSeatCheckLoading(false);
        }
    }, [storeId, formData.reservation_date, formData.reservation_time, formData.party_size]);

    useEffect(() => {
        checkSeatAvailability();
    }, [checkSeatAvailability]);

    const fetchBusinessStatus = async () => {
        try {
            const response = await api.get(`/api/reservations/business-status?store_id=${storeId}`);
            setBusinessStatus(response.data);
        } catch (error) {
            console.error('❌ 営業状態取得エラー:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setError('');
    };

    const validateForm = () => {
        const errors = [];
        
        if (!formData.customer_name.trim()) {
            errors.push('お名前を入力してください');
        }
        if (!formData.customer_phone.trim()) {
            errors.push('お電話番号を入力してください');
        }
        if (!formData.party_size) {
            errors.push('人数を選択してください');
        }
        if (!formData.reservation_date) {
            errors.push('ご希望日を選択してください');
        }
        if (!formData.reservation_time) {
            errors.push('ご希望時間を選択してください');
        }
        if (availableSeats.length > 1 && !formData.seat_type_id) {
            errors.push('席種を選択してください');
        }
        if (availableSeats.length === 0 && formData.reservation_date && formData.reservation_time && formData.party_size) {
            errors.push('選択された日時・人数では予約できません');
        }
        
        if (errors.length > 0) {
            setError(errors[0]); // 最初のエラーを表示
            return false;
        }
        
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const reservationData = {
                ...formData,
                store_id: storeId,
                source: 'web'
            };

            const response = await api.post('/api/reservations', reservationData);
            console.log('✅ 予約完了:', response.data);
            
            setStep('complete');
            if (onReservationComplete) {
                onReservationComplete(response.data);
            }
        } catch (error) {
            console.error('❌ 予約エラー:', error);
            setError(error.response?.data?.error || '予約に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (validateForm()) {
            setStep('confirm');
        }
    };

    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 17; hour <= 23; hour++) {
            times.push(`${hour}:00`);
            times.push(`${hour}:30`);
        }
        return times;
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const resetForm = () => {
        setStep('form');
        setFormData({
            customer_name: '',
            customer_phone: '',
            party_size: '',
            reservation_date: '',
            reservation_time: '',
            seat_type_id: '',
            notes: ''
        });
        setAvailableSeats([]);
        setError('');
    };

    if (step === 'complete') {
        return (
            <div className="reservation-complete-container">
                <div className="reservation-complete-icon">🎉</div>
                <h2>ご予約ありがとうございます！</h2>
                <div className="reservation-details">
                    <h3>【予約確定】</h3>
                    <div className="reservation-info">
                        <div><strong>{formData.customer_name}</strong>様 {formData.party_size}名</div>
                        <div>{new Date(formData.reservation_date).toLocaleDateString('ja-JP', { 
                            month: 'long', 
                            day: 'numeric', 
                            weekday: 'short' 
                        })} {formData.reservation_time}</div>
                        <div>
                            {availableSeats.find(seat => seat.id === formData.seat_type_id)?.name || '席種未選択'}
                        </div>
                    </div>
                </div>
                <p className="reservation-message">
                    予約確認のご連絡をお送りしました。<br/>
                    当日お気をつけてお越しください♪
                </p>
                <button onClick={resetForm} className="reservation-new-button">
                    新しい予約を追加
                </button>
            </div>
        );
    }

    if (step === 'confirm') {
        const selectedSeat = availableSeats.find(seat => seat.id === formData.seat_type_id);
        
        return (
            <div className="reservation-confirm-container">
                <h2>【予約内容確認】</h2>
                
                <div className="reservation-confirm-details">
                    <div><strong>お名前:</strong> {formData.customer_name}様</div>
                    <div><strong>人数:</strong> {formData.party_size}名</div>
                    <div><strong>日時:</strong> {new Date(formData.reservation_date).toLocaleDateString('ja-JP', { 
                        month: 'long', 
                        day: 'numeric', 
                        weekday: 'short' 
                    })} {formData.reservation_time}</div>
                    <div><strong>席種:</strong> {selectedSeat?.name}</div>
                    <div><strong>電話番号:</strong> {formData.customer_phone}</div>
                    {formData.notes && (
                        <div><strong>ご要望:</strong> {formData.notes}</div>
                    )}
                </div>

                {error && (
                    <div className="reservation-error">
                        {error}
                    </div>
                )}

                <div className="reservation-confirm-buttons">
                    <button
                        onClick={() => setStep('form')}
                        className="reservation-edit-button"
                    >
                        修正する
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`reservation-submit-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? '予約中...' : '予約を確定する'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="reservation-form-container">
            <div className="reservation-form-header">
                <h2>{businessStatus?.store_name || '店舗名'} ご予約フォーム</h2>
                {businessStatus && !businessStatus.is_open && (
                    <div className="business-status-notice">
                        🕐 営業時間外のため、Webフォームでのご予約となります
                    </div>
                )}
            </div>

            <div className="reservation-form-fields">
                {/* お名前 */}
                <div className="form-field">
                    <label className="form-label required">お名前</label>
                    <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => handleInputChange('customer_name', e.target.value)}
                        placeholder="田中太郎"
                        className="form-input"
                    />
                </div>

                {/* 電話番号 */}
                <div className="form-field">
                    <label className="form-label required">お電話番号</label>
                    <input
                        type="tel"
                        value={formData.customer_phone}
                        onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                        placeholder="090-1234-5678"
                        className="form-input"
                    />
                </div>

                {/* 人数 */}
                <div className="form-field">
                    <label className="form-label required">人数</label>
                    <select
                        value={formData.party_size}
                        onChange={(e) => handleInputChange('party_size', e.target.value)}
                        className="form-select"
                    >
                        <option value="">選択してください</option>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                            <option key={num} value={num}>{num}名様</option>
                        ))}
                    </select>
                </div>

                {/* ご希望日 */}
                <div className="form-field">
                    <label className="form-label required">ご希望日</label>
                    <input
                        type="date"
                        value={formData.reservation_date}
                        onChange={(e) => handleInputChange('reservation_date', e.target.value)}
                        min={getMinDate()}
                        className="form-input"
                    />
                </div>

                {/* ご希望時間 */}
                <div className="form-field">
                    <label className="form-label required">ご希望時間</label>
                    <select
                        value={formData.reservation_time}
                        onChange={(e) => handleInputChange('reservation_time', e.target.value)}
                        className="form-select"
                    >
                        <option value="">選択してください</option>
                        {generateTimeOptions().map(time => (
                            <option key={time} value={time}>{time}</option>
                        ))}
                    </select>
                </div>

                {/* 席種選択（複数ある場合のみ表示） */}
                {seatCheckLoading ? (
                    <div className="form-field">
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '20px', 
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            🔍 席の空き状況を確認中...
                        </div>
                    </div>
                ) : availableSeats.length > 1 ? (
                    <div className="form-field">
                        <label className="form-label required">席種</label>
                        <div className="seat-options">
                            {availableSeats.map(seat => (
                                <label key={seat.id} className="seat-option">
                                    <input
                                        type="radio"
                                        name="seat_type"
                                        value={seat.id}
                                        checked={formData.seat_type_id === seat.id}
                                        onChange={(e) => handleInputChange('seat_type_id', e.target.value)}
                                    />
                                    <span className="seat-option-label">
                                        {seat.name} ({seat.min_people}〜{seat.max_people}名)
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                ) : availableSeats.length === 1 ? (
                    <div className="form-field">
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#d1edff',
                            borderRadius: '8px',
                            color: '#0066cc',
                            fontSize: '14px'
                        }}>
                            ✅ 席種: {availableSeats[0].name} ({availableSeats[0].min_people}〜{availableSeats[0].max_people}名)
                        </div>
                    </div>
                ) : null}

                {/* ご要望・備考 */}
                <div className="form-field">
                    <label className="form-label">ご要望・備考</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="誕生日のお祝いです、アレルギーがあります等"
                        className="form-textarea"
                        rows="3"
                    />
                </div>
            </div>

            {error && (
                <div className="reservation-error">
                    {error}
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={seatCheckLoading}
                className={`reservation-continue-button ${seatCheckLoading ? 'disabled' : ''}`}
            >
                {seatCheckLoading ? '席の確認中...' : '予約内容を確認する'}
            </button>
        </div>
    );
};

export default ReservationForm;