// C:\Users\acmsh\kanpAI\backend\src\routes\reservationRoutes.js (通知機能統合版)
import express from 'express';
import pool from '../config/db.js';
import { createCalendarEvent, deleteCalendarEvent, checkCalendarAvailability } from '../services/googleCalendarService.js';
import { sendNewReservationNotification, sendCancelReservationNotification } from '../services/notificationService.js';
import { validateReservation, validateStoreId, validatePagination } from '../middlewares/validation.js';
import { catchAsync, NotFoundError, ValidationError } from '../middlewares/errorHandler.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 店舗の営業時間・設定を取得するヘルパー関数
 */
const getStoreSettings = async (storeId) => {
    const client = await pool.connect();
    try {
        const query = `
            SELECT operating_hours, default_reservation_duration, name as store_name
            FROM stores 
            WHERE id = $1;
        `;
        const result = await client.query(query, [storeId]);
        if (result.rows.length === 0) {
            throw new NotFoundError('店舗が見つかりません');
        }
        return result.rows[0];
    } finally {
        client.release();
    }
};

/**
 * 営業時間内かどうかを判定
 */
const isWithinBusinessHours = (storeSettings) => {
    if (!storeSettings.operating_hours) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes(); // HHMM format
    
    // operating_hoursは {"start": "17:00", "end": "24:00"} の形式と仮定
    const hours = storeSettings.operating_hours;
    const startTime = parseInt(hours.start.replace(':', ''));
    const endTime = parseInt(hours.end.replace(':', ''));
    
    return currentTime >= startTime && currentTime <= endTime;
};

/**
 * 当日予約かどうかを判定
 */
const isSameDay = (dateString) => {
    const today = new Date();
    const reservationDate = new Date(dateString);
    return today.toDateString() === reservationDate.toDateString();
};

/**
 * 席種の空き状況をチェック
 */
const checkSeatAvailability = async (storeId, seatTypeId, reservationDate, reservationTime, partySize) => {
    const client = await pool.connect();
    try {
        // 席種の情報を取得
        const seatQuery = `
            SELECT name, capacity, min_people, max_people
            FROM seat_types 
            WHERE id = $1 AND store_id = $2;
        `;
        const seatResult = await client.query(seatQuery, [seatTypeId, storeId]);
        
        if (seatResult.rows.length === 0) {
            throw new Error('指定された席種が見つかりません');
        }
        
        const seatType = seatResult.rows[0];
        
        // 人数チェック
        if (partySize < seatType.min_people || partySize > seatType.max_people) {
            return {
                available: false,
                message: `${seatType.name}は${seatType.min_people}名〜${seatType.max_people}名でご利用いただけます`
            };
        }
        
        // 既存予約との重複チェック
        const conflictQuery = `
            SELECT COUNT(*) as count
            FROM reservations 
            WHERE store_id = $1 
            AND seat_type_id = $2 
            AND reservation_date = $3 
            AND (
                (reservation_time <= $4 AND reservation_time + INTERVAL '1 minute' * duration_minutes > $4) OR
                (reservation_time < $4 + INTERVAL '2 hours' AND reservation_time >= $4)
            )
            AND status != 'cancelled';
        `;
        
        const conflictResult = await client.query(conflictQuery, [
            storeId, seatTypeId, reservationDate, reservationTime
        ]);
        
        const hasConflict = parseInt(conflictResult.rows[0].count) > 0;
        
        return {
            available: !hasConflict,
            message: hasConflict ? 'その時間は既に予約が入っています' : '予約可能です',
            seatType: seatType
        };
    } finally {
        client.release();
    }
};

/**
 * 利用可能な席種を取得
 */
router.get('/available-seats', async (req, res) => {
    console.log('🔄 利用可能席種取得リクエスト:', req.query);
    
    const { store_id, reservation_date, reservation_time, party_size } = req.query;
    
    if (!store_id || !reservation_date || !reservation_time || !party_size) {
        return res.status(400).json({ 
            error: '店舗ID、予約日、予約時間、人数は必須です' 
        });
    }
    
    try {
        // 当日予約チェック
        if (isSameDay(reservation_date)) {
            return res.status(400).json({
                error: '申し訳ございません、当日のご予約は承っておりません。お電話でお問い合わせください',
                errorType: 'SAME_DAY_BOOKING'
            });
        }
        
        const client = await pool.connect();
        try {
            // 店舗の席種を取得
            const seatTypesQuery = `
                SELECT id, name, capacity, min_people, max_people
                FROM seat_types 
                WHERE store_id = $1
                ORDER BY display_order, name;
            `;
            const seatTypesResult = await client.query(seatTypesQuery, [store_id]);
            
            const availableSeats = [];
            
            for (const seatType of seatTypesResult.rows) {
                const availability = await checkSeatAvailability(
                    store_id, 
                    seatType.id, 
                    reservation_date, 
                    reservation_time, 
                    parseInt(party_size)
                );
                
                if (availability.available) {
                    availableSeats.push({
                        ...seatType,
                        message: availability.message
                    });
                }
            }
            
            console.log(`✅ ${availableSeats.length}個の席種が利用可能です`);
            
            res.json({
                available_seats: availableSeats,
                total_available: availableSeats.length
            });
            
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ 席種空き確認中にエラー:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました' });
    }
});

/**
 * 営業状態を確認するAPI
 */
router.get('/business-status', async (req, res) => {
    const { store_id } = req.query;
    
    if (!store_id) {
        return res.status(400).json({ error: '店舗IDは必須です' });
    }
    
    try {
        const storeSettings = await getStoreSettings(store_id);
        const isOpen = isWithinBusinessHours(storeSettings);
        
        console.log(`✅ 店舗営業状態確認: ${storeSettings.store_name} - ${isOpen ? '営業中' : '営業時間外'}`);
        
        res.json({
            is_open: isOpen,
            operating_hours: storeSettings.operating_hours,
            store_name: storeSettings.store_name,
            reservation_method: isOpen ? 'chatbot' : 'web_form'
        });
    } catch (err) {
        console.error('❌ 営業状態確認エラー:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました' });
    }
});

/**
 * 予約作成API（通知機能統合版）
 */
router.post('/', async (req, res) => {
    console.log('🔄 予約作成リクエスト:', req.body);
    
    const { 
        store_id, 
        seat_type_id, 
        customer_name, 
        customer_phone, 
        party_size, 
        reservation_date, 
        reservation_time, 
        notes,
        source = 'web' // 'chatbot' or 'web'
    } = req.body;
    
    // 必須項目チェック
    if (!store_id || !customer_name || !party_size || !reservation_date || !reservation_time) {
        return res.status(400).json({ 
            error: '店舗ID、顧客名、人数、予約日、予約時間は必須です',
            errorType: 'MISSING_REQUIRED_FIELDS'
        });
    }
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 当日予約チェック
        if (isSameDay(reservation_date)) {
            return res.status(400).json({
                error: '申し訳ございません、当日のご予約は承っておりません。お電話でお問い合わせください',
                errorType: 'SAME_DAY_BOOKING'
            });
        }
        
        // 席種が指定されていない場合、適切な席種を自動選択
        let finalSeatTypeId = seat_type_id;
        
        if (!finalSeatTypeId) {
            // 自動選択ロジック: 人数に適した席種を取得
            const autoSelectQuery = `
                SELECT id FROM seat_types 
                WHERE store_id = $1 AND min_people <= $2 AND max_people >= $2
                ORDER BY min_people, max_people 
                LIMIT 1;
            `;
            const autoSelectResult = await client.query(autoSelectQuery, [store_id, party_size]);
            if (autoSelectResult.rows.length > 0) {
                finalSeatTypeId = autoSelectResult.rows[0].id;
            } else {
                return res.status(400).json({
                    error: '指定された人数に適した席種がありません',
                    errorType: 'NO_SUITABLE_SEAT'
                });
            }
        }
        
        // 席の空き状況確認
        const availability = await checkSeatAvailability(
            store_id, 
            finalSeatTypeId, 
            reservation_date, 
            reservation_time, 
            party_size
        );
        
        if (!availability.available) {
            return res.status(400).json({
                error: availability.message,
                errorType: 'SEAT_UNAVAILABLE'
            });
        }
        
        // 店舗設定取得
        const storeSettings = await getStoreSettings(store_id);
        const duration = storeSettings.default_reservation_duration || 120;
        
        // 予約データ挿入
        const insertQuery = `
            INSERT INTO reservations (
                store_id, 
                seat_type_id, 
                customer_name, 
                customer_phone, 
                party_size, 
                reservation_date, 
                reservation_time, 
                notes, 
                duration_minutes,
                source,
                status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed')
            RETURNING *;
        `;
        
        const result = await client.query(insertQuery, [
            store_id, 
            finalSeatTypeId, 
            customer_name, 
            customer_phone, 
            party_size, 
            reservation_date, 
            reservation_time, 
            notes, 
            duration,
            source
        ]);
        
        const newReservation = result.rows[0];
        console.log(`✅ 新しい予約を受け付けました: ${newReservation.customer_name}様`);
        
        // 🔄 Googleカレンダー連携
        try {
            const eventId = await createCalendarEvent(newReservation);
            if (eventId) {
                await client.query(
                    'UPDATE reservations SET google_event_id = $1 WHERE id = $2', 
                    [eventId, newReservation.id]
                );
                newReservation.google_event_id = eventId;
                console.log(`📅 Googleカレンダーに追加しました: ${eventId}`);
            }
        } catch (calendarError) {
            console.warn('⚠️ Googleカレンダー連携に失敗しましたが、予約は保存されました:', calendarError.message);
        }
        
        // 🔔 店主への通知送信
        try {
            console.log('📱 店主への通知送信開始');
            const notificationResult = await sendNewReservationNotification(
                newReservation,
                availability.seatType,
                storeSettings
            );
            
            if (notificationResult.success) {
                console.log('✅ 店主への通知送信成功');
            } else {
                console.warn('⚠️ 店主への通知送信に失敗:', notificationResult.error);
            }
        } catch (notificationError) {
            console.warn('⚠️ 通知送信中にエラー:', notificationError.message);
        }
        
        await client.query('COMMIT');
        
        // 予約確定メッセージを含めてレスポンス
        const response = {
            ...newReservation,
            seat_type_name: availability.seatType.name,
            confirmation_message: generateConfirmationMessage(newReservation, availability.seatType, storeSettings)
        };
        
        res.status(201).json(response);
        
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ 予約受付中にエラーが発生しました:', err.stack);
        res.status(500).json({ 
            error: '予約システムに不具合が発生しています。お電話でご予約ください',
            errorType: 'SYSTEM_ERROR'
        });
    } finally {
        client.release();
    }
});

/**
 * 予約確定メッセージ生成
 */
const generateConfirmationMessage = (reservation, seatType, storeSettings) => {
    const date = new Date(reservation.reservation_date);
    const time = reservation.reservation_time.substring(0, 5);
    const endTime = new Date(`2000-01-01T${reservation.reservation_time}`);
    endTime.setMinutes(endTime.getMinutes() + reservation.duration_minutes);
    
    return `🎉 ご予約を承りました！

【予約確定】
${reservation.customer_name}様 ${reservation.party_size}名
${date.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })} ${time}〜${endTime.toTimeString().substring(0, 5)}
${seatType.name}

当日お気をつけてお越しください♪
楽しみにお待ちしております！`;
};

/**
 * 予約一覧を取得するAPI (改良版)
 */
router.get('/', async (req, res) => {
    const { store_id, period = 'today', date } = req.query;
    if (!store_id) return res.status(400).json({ error: 'store_idは必須です。' });

    try {
        const client = await pool.connect();
        try {
            let targetDate;
            if (date) {
                targetDate = new Date(date);
            } else {
                targetDate = new Date();
                if (period === 'tomorrow') {
                    targetDate.setDate(targetDate.getDate() + 1);
                }
            }
            
            const dateString = targetDate.toISOString().slice(0, 10);

            const query = `
                SELECT 
                    r.id, 
                    r.reservation_time, 
                    r.customer_name, 
                    r.customer_phone,
                    r.party_size, 
                    r.duration_minutes, 
                    r.notes,
                    r.status,
                    r.source,
                    r.google_event_id,
                    st.name as seat_type_name,
                    st.id as seat_type_id
                FROM reservations r
                LEFT JOIN seat_types st ON r.seat_type_id = st.id
                WHERE r.store_id = $1 AND r.reservation_date = $2 AND r.status != 'cancelled'
                ORDER BY r.reservation_time, st.name;
            `;
            const result = await client.query(query, [store_id, dateString]);
            
            console.log(`✅ 店舗ID: ${store_id} の ${dateString} の予約を${result.rows.length}件取得しました。`);
            
            // 予約データにend_timeを追加
            const enrichedReservations = result.rows.map(reservation => {
                const endTime = new Date(`2000-01-01T${reservation.reservation_time}`);
                endTime.setMinutes(endTime.getMinutes() + reservation.duration_minutes);
                
                return {
                    ...reservation,
                    end_time: endTime.toTimeString().substring(0, 5)
                };
            });
            
            res.status(200).json(enrichedReservations);
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ 予約取得中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    }
});

/**
 * 予約削除API（通知機能統合版）
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 削除前の予約情報を取得（通知用）
        const selectQuery = `
            SELECT r.*, st.name as seat_type_name, s.name as store_name
            FROM reservations r
            LEFT JOIN seat_types st ON r.seat_type_id = st.id
            LEFT JOIN stores s ON r.store_id = s.id
            WHERE r.id = $1
        `;
        const selectResult = await client.query(selectQuery, [id]);
        
        if (selectResult.rows.length === 0) {
            return res.status(404).json({ error: '指定された予約が見つかりません。' });
        }
        
        const reservation = selectResult.rows[0];
        
        // ステータスを'cancelled'に更新（物理削除ではなく論理削除）
        const updateQuery = 'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2';
        await client.query(updateQuery, ['cancelled', id]);
        
        // 🔄 Googleカレンダーからも削除
        if (reservation.google_event_id) {
            try {
                await deleteCalendarEvent(reservation.google_event_id);
                console.log(`📅 Googleカレンダーから削除しました: ${reservation.google_event_id}`);
            } catch (calendarError) {
                console.warn('⚠️ Googleカレンダー削除に失敗:', calendarError.message);
            }
        }
        
        // 🔔 店主へのキャンセル通知送信
        try {
            console.log('📱 キャンセル通知送信開始');
            const notificationResult = await sendCancelReservationNotification(
                reservation,
                { name: reservation.seat_type_name },
                { store_name: reservation.store_name }
            );
            
            if (notificationResult.success) {
                console.log('✅ キャンセル通知送信成功');
            } else {
                console.warn('⚠️ キャンセル通知送信に失敗:', notificationResult.error);
            }
        } catch (notificationError) {
            console.warn('⚠️ キャンセル通知送信中にエラー:', notificationError.message);
        }
        
        await client.query('COMMIT');
        
        console.log(`✅ 予約をキャンセルしました: ${reservation.customer_name}様 (ID: ${id})`);
        res.status(204).send();
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ 予約削除中にエラーが発生しました:', err.stack);
        res.status(500).json({ error: 'サーバー内部でエラーが発生しました。' });
    } finally {
        client.release();
    }
});

export default router;