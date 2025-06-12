// C:\Users\acmsh\kanpAI\backend\src\db\create-auth-tables.js
import pool from '../config/db.js';
import bcrypt from 'bcrypt';

const createAuthTables = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔐 認証テーブルの作成を開始します...');

        // store_auth テーブルの作成
        await client.query(`
            CREATE TABLE IF NOT EXISTS store_auth (
                store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
                password_hash VARCHAR(255) NOT NULL,
                is_active BOOLEAN DEFAULT true,
                last_login TIMESTAMPTZ,
                login_attempts INTEGER DEFAULT 0,
                locked_until TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ store_authテーブルを作成しました');

        // セッション管理テーブルの作成
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) NOT NULL,
                ip_address INET,
                user_agent TEXT,
                expires_at TIMESTAMPTZ NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✅ sessionsテーブルを作成しました');

        // インデックスの作成
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_sessions_store_id ON sessions(store_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        `);
        console.log('✅ インデックスを作成しました');

        // デモ用の店舗にパスワードを設定
        const demoStoreId = '8fbff969-5212-4387-ae62-cc33944edef2';
        const demoPassword = 'kanpai123';
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(demoPassword, saltRounds);

        // デモ店舗の認証情報を作成
        await client.query(`
            INSERT INTO store_auth (store_id, password_hash)
            VALUES ($1, $2)
            ON CONFLICT (store_id) 
            DO UPDATE SET 
                password_hash = $2,
                updated_at = NOW()
        `, [demoStoreId, passwordHash]);
        
        console.log('✅ デモ店舗の認証情報を設定しました');
        console.log(`   店舗ID: ${demoStoreId}`);
        console.log(`   パスワード: ${demoPassword}`);

        // 追加のテスト店舗を作成
        const testStores = [
            { id: 'tanuki-001', name: '居酒屋たぬき', password: 'tanuki123' },
            { id: 'yamada-002', name: '焼鳥やまだ', password: 'yamada123' },
            { id: 'sakura-003', name: '和食さくら', password: 'sakura123' }
        ];

        for (const testStore of testStores) {
            // 店舗が存在しない場合は作成
            await client.query(`
                INSERT INTO stores (id, name, phone, address)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
            `, [testStore.id, testStore.name, '03-1234-5678', '東京都渋谷区']);

            // パスワードを設定
            const hash = await bcrypt.hash(testStore.password, saltRounds);
            await client.query(`
                INSERT INTO store_auth (store_id, password_hash)
                VALUES ($1, $2)
                ON CONFLICT (store_id) 
                DO UPDATE SET 
                    password_hash = $2,
                    updated_at = NOW()
            `, [testStore.id, hash]);
            
            console.log(`✅ テスト店舗を作成: ${testStore.name}`);
            console.log(`   店舗ID: ${testStore.id}`);
            console.log(`   パスワード: ${testStore.password}`);
        }

        console.log('\n🎉 認証システムのセットアップが完了しました！');

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// スクリプトを実行
createAuthTables().catch(console.error);