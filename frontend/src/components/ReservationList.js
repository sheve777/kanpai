// C:\Users\acmsh\kanpAI\frontend\src\components\ReservationList.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';
import { isLocalEnv } from '../utils/environment';
import { mockReservations, mockApiCall } from '../utils/mockData';

const ReservationList = ({ storeId }) => {
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState('today');
    const [loading, setLoading] = useState(true);
    const [businessStatus, setBusinessStatus] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

    // 関数定義をuseEffectの前に移動
    const fetchBusinessStatus = async () => {
        try {
            if (isLocalEnv()) {
                // ローカル環境ではモック営業状態を使用
                console.log('🏠 営業状態：モックデータを使用');
                const mockStatus = {
                    isOpen: true,
                    nextOpenTime: null,
                    todayReservations: mockReservations.filter(res => 
                        res.date.slice(0, 10) === new Date().toISOString().slice(0, 10)
                    ).length
                };
                setBusinessStatus(mockStatus);
            } else {
                const response = await api.get(`/api/reservations/business-status?store_id=${storeId}`);
                setBusinessStatus(response.data);
                console.log('✅ 営業状態取得:', response.data);
            }
        } catch (error) {
            console.error('❌ 営業状態取得エラー:', error);
        }
    };

    const fetchReservations = async () => {
        console.log('🔍 fetchReservations called', { isLocal: isLocalEnv() });
        try {
            setLoading(true);
            let reservationData;

            if (isLocalEnv()) {
                // ローカル環境ではモックデータを使用
                console.log('🏠 予約データ：モックデータを使用');
                const response = await mockApiCall(mockReservations);
                reservationData = response.data;

                // selectedDate に応じてフィルター
                const today = new Date().toISOString().slice(0, 10);
                if (selectedDate === 'today') {
                    reservationData = reservationData.filter(res => 
                        res.date.slice(0, 10) === today
                    );
                } else if (selectedDate === 'tomorrow') {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
                    reservationData = reservationData.filter(res => 
                        res.date.slice(0, 10) === tomorrowStr
                    );
                }
            } else {
                // 本番環境では実際のAPIを呼び出し
                const response = await api.get(`/api/reservations?store_id=${storeId}&period=${selectedDate}`);
                
                // APIレスポンスの形式を確認してデータを正しく設定
                reservationData = response.data;
                if (reservationData && reservationData.reservations) {
                    // デモAPIの形式: { success: true, reservations: [...] }
                    reservationData = reservationData.reservations;
                } else if (!Array.isArray(reservationData)) {
                    // データが配列でない場合は空配列に設定
                    reservationData = [];
                }
            }
            
            setReservations(reservationData);
            console.log(`✅ 予約一覧取得: ${reservationData.length}件`);
        } catch (error) {
            console.error('❌ 予約取得エラー:', error);
            setReservations([]); // エラー時は空配列
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservationId, customerName) => {
        if (!window.confirm(`${customerName}様の予約をキャンセルしますか？`)) {
            return;
        }

        try {
            await api.delete(`/api/reservations/${reservationId}`);
            console.log(`✅ 予約キャンセル完了: ${customerName}様`);
            fetchReservations(); // 一覧を再取得
        } catch (error) {
            console.error('❌ 予約キャンセルエラー:', error);
            alert('予約のキャンセルに失敗しました');
        }
    };

    const getDateLabel = (period) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (period) {
            case 'today':
                return `今日 ${today.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}`;
            case 'tomorrow':
                return `明日 ${tomorrow.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}`;
            default:
                return period;
        }
    };

    const getStatusBadge = (status, source) => {
        const statusClasses = {
            confirmed: 'success',
            cancelled: 'error',
            pending: 'warning'
        };

        const sourceConfig = {
            chatbot: { label: 'チャット', icon: '💬' },
            web: { label: 'Web', icon: '🌐' },
            phone: { label: '電話', icon: '📞' }
        };

        const statusClass = statusClasses[status] || 'success';
        const sourceInfo = sourceConfig[source] || sourceConfig.web;
        const statusLabels = {
            confirmed: '確定',
            cancelled: 'キャンセル',
            pending: '保留'
        };

        return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`status-badge ${statusClass}`}>
                    {statusLabels[status] || '確定'}
                </span>
                <span style={{
                    fontSize: '11px',
                    color: 'var(--color-text)',
                    opacity: 0.7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px'
                }}>
                    {sourceInfo.icon} {sourceInfo.label}
                </span>
            </div>
        );
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 17; hour <= 23; hour++) {
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    };

    const getReservationForTimeSlot = (timeSlot) => {
        if (!Array.isArray(reservations)) return [];
        
        return reservations.filter(reservation => {
            if (!reservation.reservation_time || !reservation.end_time) return false;
            const resTime = reservation.reservation_time.substring(0, 5);
            const endTime = reservation.end_time;
            return resTime <= timeSlot && endTime > timeSlot;
        });
    };

    // useEffectは関数定義の後に配置
    useEffect(() => {
        console.log('🔍 ReservationList useEffect triggered', { storeId, selectedDate });
        fetchReservations();
        fetchBusinessStatus();
    }, [storeId, selectedDate]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    console.log('🔍 ReservationList render', { storeId, loading, reservationsCount: reservations.length });
    
    if (!storeId) {
        return (
            <div className="card reservation-list-container">
                <div className="card-header">
                    <div className="summary-icon">📅</div>
                    <h2>予約状況</h2>
                </div>
                <p style={{color: 'red'}}>店舗IDが設定されていません</p>
            </div>
        );
    }

    return (
        <div className="card reservation-list-container">
            <div className="card-header">
                <div className="summary-icon">📅</div>
                <h2>予約状況</h2>
                {businessStatus && (
                    <div style={{
                        marginLeft: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span className={`status-badge ${businessStatus.is_open ? 'success' : 'error'}`}>
                            {businessStatus.is_open ? '🟢 営業中' : '🔴 営業時間外'}
                        </span>
                        <div style={{
                            fontSize: '11px',
                            color: 'var(--color-text)',
                            opacity: 0.7
                        }}>
                            {businessStatus.operating_hours && 
                                `${businessStatus.operating_hours.start}〜${businessStatus.operating_hours.end}`
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* 日付選択 */}
            <div className="action-button-group" style={{ marginBottom: '20px' }}>
                {['today', 'tomorrow'].map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedDate(period)}
                        className="action-button"
                        style={{
                            backgroundColor: selectedDate === period ? 'var(--color-accent)' : 'var(--color-card)',
                            color: selectedDate === period ? 'white' : 'var(--color-text)',
                            borderColor: selectedDate === period ? 'var(--color-accent)' : 'var(--color-border)'
                        }}
                    >
                        {getDateLabel(period)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-text">
                        <div className="loading-spinner"></div>
                        <span>予約データを読み込み中...</span>
                    </div>
                </div>
            ) : reservations.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    color: '#6c757d'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>
                        {getDateLabel(selectedDate)}の予約はありません
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        新しい予約が入ると、ここに表示されます
                    </p>
                </div>
            ) : isMobile ? (
                // スマホ用シンプルリスト表示
                <div>
                    {/* 予約概要 */}
                    <div className="mobile-summary" style={{
                        padding: '16px',
                        backgroundColor: 'rgba(185, 58, 58, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <div style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            color: 'var(--color-text)'
                        }}>
                            📊 {getDateLabel(selectedDate)}: {reservations.length}組 {Array.isArray(reservations) ? reservations.reduce((total, res) => total + res.party_size, 0) : 0}名
                        </div>
                    </div>

                    {/* シンプル予約リスト */}
                    <div className="mobile-reservation-list" style={{ display: 'grid', gap: '12px' }}>
                        {reservations
                            .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time))
                            .map(reservation => (
                            <div
                                key={reservation.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    backgroundColor: 'var(--color-card)',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-border)',
                                    gap: '12px',
                                    boxShadow: '0 2px 4px rgba(74, 47, 34, 0.1)'
                                }}
                            >
                                <div style={{ 
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--color-accent)',
                                    minWidth: '50px'
                                }}>
                                    🕐 {reservation.reservation_time ? reservation.reservation_time.substring(0, 5) : '--:--'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '4px'
                                    }}>
                                        <span style={{
                                            fontWeight: '600',
                                            color: 'var(--color-text)'
                                        }}>
                                            {reservation.customer_name}様
                                        </span>
                                        <span style={{
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text-secondary)',
                                            backgroundColor: 'rgba(74, 47, 34, 0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '12px'
                                        }}>
                                            {reservation.party_size}名
                                        </span>
                                        {reservation.seat_type_name && (
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: 'var(--color-text-secondary)'
                                            }}>
                                                {reservation.seat_type_name}
                                            </span>
                                        )}
                                    </div>
                                    {reservation.notes && (
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-secondary)',
                                            fontStyle: 'italic'
                                        }}>
                                            💬 {reservation.notes}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                }}>
                                    <button
                                        onClick={() => {
                                            const tel = reservation.customer_phone;
                                            if (tel) window.open(`tel:${tel}`);
                                        }}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--color-positive)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            minWidth: '44px',
                                            minHeight: '44px'
                                        }}
                                        title="電話をかける"
                                    >
                                        📞
                                    </button>
                                    <button
                                        onClick={() => handleCancelReservation(reservation.id, reservation.customer_name)}
                                        style={{
                                            padding: '8px 12px',
                                            fontSize: '0.8rem',
                                            backgroundColor: 'var(--color-negative)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            minWidth: '44px',
                                            minHeight: '44px'
                                        }}
                                        title="予約をキャンセル"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // PC/タブレット用タイムライン表示（既存）
                <div>
                    {/* 予約概要 */}
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">📅</div>
                            <div className="info-title">総予約数</div>
                            <div className="stat-number">{reservations.length}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">👥</div>
                            <div className="info-title">総人数</div>
                            <div className="stat-number">
                                {Array.isArray(reservations) ? reservations.reduce((total, res) => total + res.party_size, 0) : 0}
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">💬</div>
                            <div className="info-title">チャット予約</div>
                            <div className="stat-number">
                                {reservations.filter(res => res.source === 'chatbot').length}
                            </div>
                        </div>
                    </div>

                    {/* タイムライン表示 */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '20px'
                    }}>
                        <h4 style={{ 
                            margin: '0 0 16px 0',
                            color: '#495057',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            📅 {getDateLabel(selectedDate)}のタイムライン
                        </h4>
                        
                        <div style={{ display: 'grid', gap: '8px' }}>
                            {generateTimeSlots().map(timeSlot => {
                                const slotsReservations = getReservationForTimeSlot(timeSlot);
                                const isEmpty = slotsReservations.length === 0;
                                
                                return (
                                    <div
                                        key={timeSlot}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '80px 1fr',
                                            gap: '16px',
                                            alignItems: 'center',
                                            padding: '12px',
                                            backgroundColor: isEmpty ? 'white' : '#e3f2fd',
                                            borderRadius: '8px',
                                            border: '1px solid',
                                            borderColor: isEmpty ? '#dee2e6' : '#90caf9'
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: isEmpty ? '#6c757d' : '#1976d2',
                                            textAlign: 'center'
                                        }}>
                                            {timeSlot}
                                        </div>
                                        
                                        <div>
                                            {isEmpty ? (
                                                <div style={{
                                                    color: '#6c757d',
                                                    fontSize: '14px',
                                                    fontStyle: 'italic'
                                                }}>
                                                    空き
                                                </div>
                                            ) : (
                                                <div style={{ display: 'grid', gap: '8px' }}>
                                                    {slotsReservations.map(reservation => (
                                                        <div
                                                            key={reservation.id}
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                padding: '8px 12px',
                                                                backgroundColor: 'white',
                                                                borderRadius: '6px',
                                                                border: '1px solid #e3f2fd'
                                                            }}
                                                        >
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    <span style={{
                                                                        fontWeight: '600',
                                                                        color: '#333'
                                                                    }}>
                                                                        {reservation.customer_name}様
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#666',
                                                                        backgroundColor: '#f8f9fa',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '10px'
                                                                    }}>
                                                                        {reservation.party_size}名
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        color: '#666'
                                                                    }}>
                                                                        {reservation.seat_type_name}
                                                                    </span>
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    color: '#666',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px'
                                                                }}>
                                                                    <span>
                                                                        {reservation.reservation_time ? reservation.reservation_time.substring(0, 5) : '--:--'} 〜 {reservation.end_time || '--:--'}
                                                                    </span>
                                                                    {getStatusBadge(reservation.status, reservation.source)}
                                                                </div>
                                                                {reservation.notes && (
                                                                    <div style={{
                                                                        fontSize: '11px',
                                                                        color: '#666',
                                                                        marginTop: '4px',
                                                                        fontStyle: 'italic'
                                                                    }}>
                                                                        💬 {reservation.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '4px'
                                                            }}>
                                                                <button
                                                                    onClick={() => {
                                                                        const tel = reservation.customer_phone;
                                                                        if (tel) window.open(`tel:${tel}`);
                                                                    }}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        fontSize: '11px',
                                                                        backgroundColor: '#28a745',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    title="電話をかける"
                                                                >
                                                                    📞
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancelReservation(reservation.id, reservation.customer_name)}
                                                                    style={{
                                                                        padding: '4px 8px',
                                                                        fontSize: '11px',
                                                                        backgroundColor: '#dc3545',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    title="予約をキャンセル"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationList;