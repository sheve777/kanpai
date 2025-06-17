// 自動レポート生成関連のテーブルを作成
import pool from '../config/db.js';

const createAutoReportTables = async () => {
    const client = await pool.connect();
    
    try {
        console.log('🔧 自動レポート生成関連テーブルの作成を開始...');

        // 1. reportsテーブルにauto_generated列を追加（既存テーブルの拡張）
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'reports' AND column_name = 'auto_generated'
                ) THEN
                    ALTER TABLE reports ADD COLUMN auto_generated BOOLEAN DEFAULT false;
                    COMMENT ON COLUMN reports.auto_generated IS '自動生成されたレポートかどうか';
                END IF;
            END $$;
        `);
        console.log('✅ reportsテーブルにauto_generated列を追加しました');

        // 2. storesテーブルにauto_report_enabled列を追加
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'stores' AND column_name = 'auto_report_enabled'
                ) THEN
                    ALTER TABLE stores ADD COLUMN auto_report_enabled BOOLEAN DEFAULT true;
                    COMMENT ON COLUMN stores.auto_report_enabled IS '月次レポート自動生成を有効にするかどうか';
                END IF;
            END $$;
        `);
        console.log('✅ storesテーブルにauto_report_enabled列を追加しました');

        // 3. 自動生成実行ログテーブル
        await client.query(`
            CREATE TABLE IF NOT EXISTS report_auto_generation_logs (
                id SERIAL PRIMARY KEY,
                report_month VARCHAR(7) NOT NULL,  -- YYYY-MM形式
                total_stores INTEGER NOT NULL,
                success_count INTEGER NOT NULL,
                failed_count INTEGER NOT NULL,
                skipped_count INTEGER NOT NULL,
                duration_seconds INTEGER NOT NULL,
                error_details JSONB,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ report_auto_generation_logsテーブルを作成しました');

        // インデックスを作成
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_auto_gen_logs_month 
            ON report_auto_generation_logs(report_month);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_auto_gen_logs_executed_at 
            ON report_auto_generation_logs(executed_at);
        `);
        
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_reports_auto_generated 
            ON reports(auto_generated) WHERE auto_generated = true;
        `);

        console.log('✅ インデックスを作成しました');

        // コメントを追加
        await client.query(`
            COMMENT ON TABLE report_auto_generation_logs IS '月次レポート自動生成の実行ログ';
            COMMENT ON COLUMN report_auto_generation_logs.report_month IS '対象月（YYYY-MM形式）';
            COMMENT ON COLUMN report_auto_generation_logs.total_stores IS '対象店舗数';
            COMMENT ON COLUMN report_auto_generation_logs.success_count IS '生成成功件数';
            COMMENT ON COLUMN report_auto_generation_logs.failed_count IS '生成失敗件数';
            COMMENT ON COLUMN report_auto_generation_logs.skipped_count IS 'スキップ件数';
            COMMENT ON COLUMN report_auto_generation_logs.duration_seconds IS '実行時間（秒）';
            COMMENT ON COLUMN report_auto_generation_logs.error_details IS 'エラー詳細（JSON形式）';
        `);

        console.log('🎉 自動レポート生成関連テーブルの作成が完了しました！');
        
        // 現在のテーブル状況を確認
        const tablesResult = await client.query(`
            SELECT 
                schemaname, 
                tablename, 
                tableowner 
            FROM pg_tables 
            WHERE tablename LIKE '%report%'
            ORDER BY tablename;
        `);
        
        console.log('\n📋 レポート関連テーブル一覧:');
        tablesResult.rows.forEach(row => {
            console.log(`  - ${row.tablename}`);
        });

    } catch (error) {
        console.error('❌ テーブル作成中にエラーが発生しました:', error);
        throw error;
    } finally {
        client.release();
    }
};

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
    createAutoReportTables()
        .then(() => {
            console.log('✅ スクリプト実行完了');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ スクリプト実行エラー:', error);
            process.exit(1);
        });
}

export default createAutoReportTables;