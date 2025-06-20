// C:\Users\acmsh\kanpAI\backend\src\db\add-temporary-password-flag.js
import pool from '../config/db.js';

const addTemporaryPasswordFlag = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔐 store_authテーブルに仮パスワードフラグを追加します...');

        // is_temporary_password カラムを追加
        await client.query(`
            ALTER TABLE store_auth 
            ADD COLUMN IF NOT EXISTS is_temporary_password BOOLEAN DEFAULT false;
        `);
        console.log('✅ is_temporary_passwordカラムを追加しました');

        // 既存のすべての店舗を仮パスワードとしてマーク（必要に応じて）
        await client.query(`
            UPDATE store_auth 
            SET is_temporary_password = true
            WHERE password_hash IS NOT NULL;
        `);
        console.log('✅ 既存の店舗を仮パスワードとしてマークしました');

        console.log('\n🎉 仮パスワードフラグの追加が完了しました！');

    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
};

// スクリプトを実行
addTemporaryPasswordFlag().catch(console.error);