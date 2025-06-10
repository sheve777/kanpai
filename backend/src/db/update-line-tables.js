// C:\Users\acmsh\kanpAI\backend\src\db\update-line-tables.js
import pool from '../config/db.js';

const updateLineTables = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 LINE関連テーブルの更新を開始します...');

        // 1. storesテーブルにLINE友だち数カラムを追加
        console.log('📝 storesテーブルにline_friends_countカラムを追加...');
        await client.query(`
            ALTER TABLE stores 
            ADD COLUMN IF NOT EXISTS line_friends_count INTEGER DEFAULT 1250;
        `);

        // 2. line_broadcastsテーブルにrecipient_countカラムを追加
        console.log('📝 line_broadcastsテーブルにrecipient_countカラムを追加...');
        await client.query(`
            ALTER TABLE line_broadcasts 
            ADD COLUMN IF NOT EXISTS recipient_count INTEGER DEFAULT 0;
        `);

        // 3. テストデータ用の友だち数を設定
        console.log('📝 テスト店舗の友だち数を設定...');
        await client.query(`
            UPDATE stores 
            SET line_friends_count = 1250 
            WHERE id = '8fbff969-5212-4387-ae62-cc33944edef2';
        `);

        console.log('✅ LINE関連テーブルの更新が完了しました！');
        
        // 4. 更新結果を確認
        const result = await client.query(`
            SELECT name, line_friends_count 
            FROM stores 
            WHERE id = '8fbff969-5212-4387-ae62-cc33944edef2';
        `);
        
        if (result.rows.length > 0) {
            console.log(`📊 更新確認: ${result.rows[0].name} の友だち数: ${result.rows[0].line_friends_count}名`);
        }

    } catch (error) {
        console.error('❌ テーブル更新中にエラーが発生しました:', error);
        throw error;
    } finally {
        client.release();
    }
};

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    updateLineTables()
        .then(() => {
            console.log('🎉 スクリプト実行完了');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 スクリプト実行失敗:', error);
            process.exit(1);
        });
}

export { updateLineTables };
