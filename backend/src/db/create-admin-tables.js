// C:\Users\acmsh\kanpAI\backend\src\db\create-admin-tables.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const createAdminTables = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔐 管理者テーブルの作成を開始します...');

        // admin_users テーブルの作成
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                last_login TIMESTAMPTZ,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMPTZ,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ admin_usersテーブルを作成しました');

        // admin_sessions テーブルの作成
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_sessions (
                session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) NOT NULL,
                ip_address INET,
                user_agent TEXT,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ admin_sessionsテーブルを作成しました');

        // admin_activity_logs テーブルの作成（操作ログ）
        await client.query(`
            CREATE TABLE IF NOT EXISTS admin_activity_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
                action VARCHAR(100) NOT NULL,
                target_type VARCHAR(50),
                target_id VARCHAR(100),
                details JSONB,
                ip_address INET,
                user_agent TEXT,
                success BOOLEAN DEFAULT true,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ admin_activity_logsテーブルを作成しました');

        // store_credentials テーブルの作成（暗号化された店舗認証情報）
        await client.query(`
            CREATE TABLE IF NOT EXISTS store_credentials (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                credential_type VARCHAR(50) NOT NULL,
                encrypted_value TEXT NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_by UUID REFERENCES admin_users(id),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(store_id, credential_type)
            );
        `);
        console.log('✅ store_credentialsテーブルを作成しました');

        // インデックスの作成
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
            CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
            CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
            CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
            CREATE INDEX IF NOT EXISTS idx_store_credentials_store_id ON store_credentials(store_id);
        `);
        console.log('✅ インデックスを作成しました');

        // 管理者アカウントの作成
        const adminUsername = 'admin';
        const adminEmail = 'admin@kanpai.local';
        const adminPassword = 'admin123'; // 初期パスワード（後で変更推奨）
        const adminFullName = 'kanpAI 管理者';
        const saltRounds = 12; // 管理者は高いセキュリティ
        const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

        // 管理者アカウントを作成
        const result = await client.query(`
            INSERT INTO admin_users (username, email, password_hash, full_name)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) 
            DO UPDATE SET 
                password_hash = $2,
                updated_at = NOW()
            RETURNING id;
        `, [adminUsername, passwordHash, adminEmail, adminFullName]);
        
        const adminId = result.rows[0].id;
        
        console.log('✅ 管理者アカウントを作成しました');
        console.log(`   ユーザー名: ${adminUsername}`);
        console.log(`   メール: ${adminEmail}`);
        console.log(`   初期パスワード: ${adminPassword}`);
        console.log(`   管理者ID: ${adminId}`);

        // 初期ログを記録
        await client.query(`
            INSERT INTO admin_activity_logs (admin_id, action, details)
            VALUES ($1, 'system_setup', $2)
        `, [adminId, JSON.stringify({ message: 'Admin system initialized' })]);

        console.log('\n🎉 管理者システムのセットアップが完了しました！');
        console.log('⚠️ セキュリティ上、初期パスワードは必ず変更してください。');

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// スクリプトを実行
createAdminTables().catch(console.error);