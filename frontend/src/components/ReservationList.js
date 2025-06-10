// C:\Users\acmsh\kanpAI\frontend\src\components\ReservationList.js
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig.js';

const ReservationList = ({ storeId }) => {
    const [reservations, setReservations] = useState([]);
    const [selectedDate, setSelectedDate] = useState('today');
    const [loading, setLoading] = useState(true);
    const [businessStatus, setBusinessStatus] = useState(null);

    useEffect(() => {
        fetchReservations();
        fetchBusinessStatus();
    }, [storeId, selectedDate]);

    const fetchBusinessStatus = async () => {
        try {
            const response = await api.get(`/api/reservations/business-status?store_id=${storeId}`);
            setBusinessStatus(response.data);
            console.log('✅ 営業状態取得:', response.data);
        } catch (error) {
            console.error('❌ 営業状態取得エラー:', error);
        }
    };

    const fetchReservations = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/reservations?store_id=${storeId}&period=${selectedDate}`);
            setReservations(response.data);
            console.log(`✅ 予約一覧取得: ${response.data.length}件`);
        } catch (error) {
            console.error('❌ 予約取得エラー:', error);
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
        const statusConfig = {
            confirmed: { label: '確定', color: '#28a745', bg: '#d4edda' },
            cancelled: { label: 'キャンセル', color: '#dc3545', bg: '#f8d7da' },
            pending: { label: '保留', color: '#ffc107', bg: '#fff3cd' }
        };

        const sourceConfig = {
            chatbot: { label: 'チャット', icon: '💬' },
            web: { label: 'Web', icon: '🌐' },
            phone: { label: '電話', icon: '📞' }
        };

        const statusStyle = statusConfig[status] || statusConfig.confirmed;
        const sourceInfo = sourceConfig[source] || sourceConfig.web;

        return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: statusStyle.color,
                    backgroundColor: statusStyle.bg
                }}>
                    {statusStyle.label}
                </span>
                <span style={{
                    fontSize: '11px',
                    color: '#666',
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
        return reservations.filter(reservation => {
            const resTime = reservation.reservation_time.substring(0, 5);
            const endTime = reservation.end_time;
            return resTime <= timeSlot && endTime > timeSlot;
        });
    };

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
                        <div style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: businessStatus.is_open ? '#d4edda' : '#f8d7da',
                            color: businessStatus.is_open ? '#155724' : '#721c24'
                        }}>
                            {businessStatus.is_open ? '🟢 営業中' : '🔴 営業時間外'}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#666'
                        }}>
                            {businessStatus.operating_hours && 
                                `${businessStatus.operating_hours.start}〜${businessStatus.operating_hours.end}`
                            }
                        </div>
                    </div>
                )}
            </div>

            {/* 日付選択 */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                {['today', 'tomorrow'].map(period => (
                    <button
                        key={period}
                        onClick={() => setSelectedDate(period)}
                        style={{
                            padding: '8px 16px',
                            border: '2px solid',
                            borderColor: selectedDate === period ? '#007bff' : '#dee2e6',
                            backgroundColor: selectedDate === period ? '#007bff' : 'white',
                            color: selectedDate === period ? 'white' : '#333',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        {getDateLabel(period)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                    <p>予約データを読み込み中...</p>
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
            ) : (
                <div>
                    {/* 予約概要 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            padding: '16px',
                            backgroundColor: '#e3f2fd',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
                                {reservations.length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                総予約数
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '16px',
                            backgroundColor: '#f3e5f5',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>
                                {reservations.reduce((total, res) => total + res.party_size, 0)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                総人数
                            </div>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            padding: '16px',
                            backgroundColor: '#e8f5e8',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>
                                {reservations.filter(res => res.source === 'chatbot').length}
                            </div>
                            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
                                チャット予約
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
                                                                        {reservation.reservation_time.substring(0, 5)} 〜 {reservation.end_time}
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
