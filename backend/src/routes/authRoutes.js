// C:\Users\acmsh\kanpAI\backend\src\routes\authRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const router = express.Router();

// JWT シークレットキー（本番環境では環境変数から取得）
const JWT_SECRET = process.env.JWT_SECRET || 'kanpai-secret-key-2025';
const JWT_EXPIRES_IN = '7d'; // 7日間有効

// ログインエンドポイント
router.post('/login', async (req, res) => {
    const { storeId, password } = req.body;
    
    try {
        // 入力検証
        if (!storeId || !password) {
            return res.status(400).json({ 
                success: false,
                error: '店舗IDとパスワードは必須です' 
            });
        }

        // デモモード: データベース接続なしで動作
        let store = {
            id: storeId,
            name: `店舗 ${storeId}`,
            phone: '03-1234-5678',
            address: '東京都渋谷区テスト1-2-3',
            password_hash: null,
            is_active: true
        };

        try {
            const client = await pool.connect();
            try {
                // 店舗情報と認証情報を取得
                const query = `
                    SELECT 
                        s.id,
                        s.name,
                        s.phone,
                        s.address,
                        sa.password_hash,
                        sa.is_active
                    FROM stores s
                    LEFT JOIN store_auth sa ON s.id = sa.store_id
                    WHERE s.id = $1
                `;
                
                const result = await client.query(query, [storeId]);
                
                if (result.rows.length > 0) {
                    store = result.rows[0];
                }
            } finally {
                client.release();
            }
        } catch (dbError) {
            console.log('📝 デモモード: データベース接続なしで動作中');
            // データベースエラーを無視してデモモードで続行
        }

            // デモ環境用: password_hashがない場合は仮パスワードで認証
            if (!store.password_hash) {
                if (password === 'kanpai123' || password === 'demo') {
                    // デモ認証成功
                } else {
                    return res.status(401).json({ 
                        success: false,
                        error: '店舗IDまたはパスワードが正しくありません' 
                    });
                }
            } else {
                // 本番環境: bcryptでパスワード検証
                const isValid = await bcrypt.compare(password, store.password_hash);
                if (!isValid) {
                    return res.status(401).json({ 
                        success: false,
                        error: '店舗IDまたはパスワードが正しくありません' 
                    });
                }
            }

            // アクティブチェック
            if (store.is_active === false) {
                return res.status(403).json({ 
                    success: false,
                    error: 'このアカウントは無効化されています' 
                });
            }

            // JWTトークンを生成
            const token = jwt.sign(
                { 
                    storeId: store.id,
                    storeName: store.name
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // ログイン履歴を更新（データベース接続時のみ）
            try {
                const client = await pool.connect();
                await client.query(
                    'UPDATE store_auth SET last_login = NOW() WHERE store_id = $1',
                    [storeId]
                );
                client.release();
            } catch (dbError) {
                console.log('📝 デモモード: ログイン履歴更新をスキップ');
            }

            console.log(`✅ ログイン成功: ${store.name} (${storeId})`);

            res.json({
                success: true,
                token,
                store: {
                    id: store.id,
                    name: store.name,
                    phone: store.phone,
                    address: store.address
                }
            });

    } catch (error) {
        console.error('❌ ログインエラー:', error);
        res.status(500).json({ 
            success: false,
            error: 'サーバーエラーが発生しました' 
        });
    }
});

// トークン検証エンドポイント
router.post('/verify', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ 
            success: false,
            error: 'トークンが必要です' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 店舗情報を再取得
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT id, name, phone, address FROM stores WHERE id = $1',
                [decoded.storeId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: '店舗が見つかりません' 
                });
            }

            res.json({
                success: true,
                valid: true,
                store: result.rows[0]
            });

        } finally {
            client.release();
        }
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({ 
                success: false,
                error: 'トークンの有効期限が切れています' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ 
                success: false,
                error: '無効なトークンです' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                error: 'サーバーエラーが発生しました' 
            });
        }
    }
});

// パスワード変更エンドポイント（認証必須）
router.post('/change-password', async (req, res) => {
    const authHeader = req.headers.authorization;
    const { currentPassword, newPassword } = req.body;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false,
            error: '認証が必要です' 
        });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const storeId = decoded.storeId;

        // 新しいパスワードの検証
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false,
                error: 'パスワードは6文字以上必要です' 
            });
        }

        const client = await pool.connect();
        try {
            // 現在のパスワードを確認
            const authResult = await client.query(
                'SELECT password_hash FROM store_auth WHERE store_id = $1',
                [storeId]
            );

            if (authResult.rows.length > 0 && authResult.rows[0].password_hash) {
                const isValid = await bcrypt.compare(currentPassword, authResult.rows[0].password_hash);
                if (!isValid) {
                    return res.status(401).json({ 
                        success: false,
                        error: '現在のパスワードが正しくありません' 
                    });
                }
            }

            // 新しいパスワードをハッシュ化
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // store_authレコードを更新または作成
            const upsertQuery = `
                INSERT INTO store_auth (store_id, password_hash, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (store_id) 
                DO UPDATE SET 
                    password_hash = $2,
                    updated_at = NOW()
            `;

            await client.query(upsertQuery, [storeId, newPasswordHash]);

            console.log(`✅ パスワード変更成功: ${storeId}`);

            res.json({
                success: true,
                message: 'パスワードが正常に変更されました'
            });

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ パスワード変更エラー:', error);
        
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ 
                success: false,
                error: '無効なトークンです' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                error: 'サーバーエラーが発生しました' 
            });
        }
    }
});

export default router;