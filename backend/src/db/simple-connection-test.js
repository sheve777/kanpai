// C:\Users\acmsh\kanpAI\backend\src\db\simple-connection-test.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    console.log('🔄 PostgreSQL接続テスト開始...');
    
    const pool = new pg.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'kanpai',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'sheve777',
        ssl: false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    try {
        console.log('🔗 データベース接続試行中...');
        const client = await pool.connect();
        console.log('✅ PostgreSQL接続成功！');
        
        const res = await client.query('SELECT NOW()');
        console.log(`🕒 DBサーバーの現在時刻: ${res.rows[0].now}`);
        
        // 簡単なテーブル確認
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('📋 存在するテーブル:', tables.rows.map(row => row.table_name));
        
        client.release();
        console.log('✅ 接続テスト完了');
    } catch (err) {
        console.error('❌ PostgreSQL接続失敗:');
        console.error('エラー詳細:', err.message);
        console.error('---');
        console.error('確認してください:');
        console.error('1. PostgreSQLサーバーは起動していますか？');
        console.error('2. 接続情報は正しいですか？');
        console.error(`   Host: ${process.env.DB_HOST || 'localhost'}`);
        console.error(`   Port: ${process.env.DB_PORT || 5432}`);
        console.error(`   Database: ${process.env.DB_NAME || 'kanpai'}`);
        console.error(`   User: ${process.env.DB_USER || 'postgres'}`);
    } finally {
        await pool.end();
    }
};

testConnection();
