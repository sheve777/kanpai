// C:\Users\acmsh\kanpAI\backend\src\middlewares\auth.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kanpai-secret-key-2025';

/**
 * JWT認証ミドルウェア
 * Authorizationヘッダーからトークンを取得し、検証する
 */
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: '認証トークンが必要です' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // デコードした情報をreqに追加
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                error: 'トークンの有効期限が切れています' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false,
                error: '無効なトークンです' 
            });
        } else {
            return res.status(500).json({ 
                success: false,
                error: 'トークン検証エラー' 
            });
        }
    }
};

/**
 * 店舗データアクセス制御ミドルウェア
 * URLパラメータの店舗IDとトークンの店舗IDが一致するか確認
 */
export const authorizeStoreAccess = (req, res, next) => {
    const requestedStoreId = req.params.storeId || req.query.store_id || req.body.storeId;
    const userStoreId = req.user?.storeId;

    if (!requestedStoreId || !userStoreId) {
        return res.status(400).json({ 
            success: false,
            error: '店舗IDが指定されていません' 
        });
    }

    if (requestedStoreId !== userStoreId) {
        console.warn(`⚠️ 不正なアクセス試行: ${userStoreId} が ${requestedStoreId} のデータにアクセスしようとしました`);
        return res.status(403).json({ 
            success: false,
            error: 'このデータへのアクセス権限がありません' 
        });
    }

    next();
};

/**
 * オプション認証ミドルウェア
 * トークンがある場合は検証し、ない場合もリクエストを通す
 */
export const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // トークンが無効でも続行（ただしreq.userは設定されない）
            console.log('オプション認証: 無効なトークン');
        }
    }

    next();
};