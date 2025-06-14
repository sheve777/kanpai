#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 環境変数を読み込み
dotenv.config({ path: path.join(__dirname, '../.env') });

class DatabaseBackup {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
    this.retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 7;
    this.databaseUrl = process.env.DATABASE_URL;
    
    // バックアップディレクトリを作成
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createBackup() {
    if (!this.databaseUrl || this.databaseUrl.includes('your_')) {
      console.log('❌ DATABASE_URLが設定されていないため、バックアップをスキップします');
      return false;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `kanpai-backup-${timestamp}.sql`;
    const backupFilePath = path.join(this.backupDir, backupFileName);

    console.log(`🔄 データベースバックアップを開始: ${backupFileName}`);

    try {
      // PostgreSQLのpg_dumpを使用してバックアップ
      await this.runPgDump(backupFilePath);
      
      // バックアップファイルのサイズを確認
      const stats = fs.statSync(backupFilePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      
      console.log(`✅ バックアップ完了: ${backupFileName} (${fileSizeMB}MB)`);
      
      // 古いバックアップを削除
      await this.cleanupOldBackups();
      
      // S3にアップロード（設定されている場合）
      if (process.env.BACKUP_S3_BUCKET) {
        await this.uploadToS3(backupFilePath, backupFileName);
      }
      
      return true;
    } catch (error) {
      console.error('❌ バックアップに失敗:', error.message);
      
      // 失敗したバックアップファイルを削除
      if (fs.existsSync(backupFilePath)) {
        fs.unlinkSync(backupFilePath);
      }
      
      return false;
    }
  }

  runPgDump(outputPath) {
    return new Promise((resolve, reject) => {
      const pgDumpArgs = [
        '--no-password',
        '--format=custom',
        '--compress=9',
        '--verbose',
        '--file=' + outputPath,
        this.databaseUrl
      ];

      const pgDump = spawn('pg_dump', pgDumpArgs, {
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() }
      });

      let errorOutput = '';

      pgDump.stderr.on('data', (data) => {
        const output = data.toString();
        // pg_dumpの詳細ログは正常な出力なのでエラーと区別
        if (output.includes('ERROR') || output.includes('FATAL')) {
          errorOutput += output;
        }
      });

      pgDump.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
        }
      });

      pgDump.on('error', (error) => {
        reject(new Error(`pg_dump process error: ${error.message}`));
      });
    });
  }

  extractPasswordFromUrl() {
    if (!this.databaseUrl) return '';
    
    try {
      const url = new URL(this.databaseUrl);
      return url.password || '';
    } catch {
      return '';
    }
  }

  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('kanpai-backup-') && file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime); // 新しい順

      // 保持期間を超えた古いバックアップを削除
      const cutoffDate = new Date(Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000));
      let deletedCount = 0;

      for (const file of backupFiles) {
        if (file.stats.mtime < cutoffDate) {
          fs.unlinkSync(file.path);
          deletedCount++;
          console.log(`🗑️  古いバックアップを削除: ${file.name}`);
        }
      }

      if (deletedCount > 0) {
        console.log(`✅ ${deletedCount}個の古いバックアップを削除しました`);
      }
    } catch (error) {
      console.error('⚠️  古いバックアップの削除に失敗:', error.message);
    }
  }

  async uploadToS3(localPath, fileName) {
    // S3アップロードはオプション機能として実装
    try {
      if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.log('ℹ️  S3の認証情報が設定されていないため、ローカルバックアップのみ');
        return;
      }

      console.log(`🔄 S3にアップロード中: ${fileName}`);
      
      // AWS SDK を使用する場合はここに実装
      // 現在はプレースホルダーとして残す
      console.log('ℹ️  S3アップロード機能は今後実装予定です');
      
    } catch (error) {
      console.error('⚠️  S3アップロードに失敗:', error.message);
    }
  }

  async restoreFromBackup(backupFilePath) {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`バックアップファイルが見つかりません: ${backupFilePath}`);
    }

    console.log(`🔄 データベース復元を開始: ${path.basename(backupFilePath)}`);

    return new Promise((resolve, reject) => {
      const pgRestoreArgs = [
        '--clean',
        '--no-owner',
        '--no-privileges',
        '--verbose',
        '--dbname=' + this.databaseUrl,
        backupFilePath
      ];

      const pgRestore = spawn('pg_restore', pgRestoreArgs, {
        env: { ...process.env, PGPASSWORD: this.extractPasswordFromUrl() }
      });

      let errorOutput = '';

      pgRestore.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('ERROR') || output.includes('FATAL')) {
          errorOutput += output;
        }
      });

      pgRestore.on('close', (code) => {
        if (code === 0) {
          console.log('✅ データベース復元が完了しました');
          resolve();
        } else {
          reject(new Error(`pg_restore failed with code ${code}: ${errorOutput}`));
        }
      });

      pgRestore.on('error', (error) => {
        reject(new Error(`pg_restore process error: ${error.message}`));
      });
    });
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('kanpai-backup-') && file.endsWith('.sql'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: filePath,
            size: `${(stats.size / (1024 * 1024)).toFixed(2)}MB`,
            created: stats.mtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      return backupFiles;
    } catch (error) {
      console.error('バックアップファイルの一覧取得に失敗:', error.message);
      return [];
    }
  }
}

// コマンドライン実行時
if (import.meta.url === `file://${process.argv[1]}`) {
  const backup = new DatabaseBackup();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      backup.createBackup()
        .then(success => process.exit(success ? 0 : 1))
        .catch(error => {
          console.error('バックアップエラー:', error);
          process.exit(1);
        });
      break;
      
    case 'list':
      const backups = backup.listBackups();
      console.log('\n📋 利用可能なバックアップ:');
      if (backups.length === 0) {
        console.log('バックアップファイルがありません');
      } else {
        backups.forEach((backup, index) => {
          console.log(`${index + 1}. ${backup.name} (${backup.size}) - ${backup.created}`);
        });
      }
      break;
      
    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('使用方法: node backup-database.js restore <backup-file-path>');
        process.exit(1);
      }
      
      backup.restoreFromBackup(backupPath)
        .then(() => process.exit(0))
        .catch(error => {
          console.error('復元エラー:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(`
🗄️  kanpAI データベースバックアップツール

使用方法:
  node backup-database.js create          - 新しいバックアップを作成
  node backup-database.js list            - 利用可能なバックアップを一覧表示
  node backup-database.js restore <file>  - バックアップから復元

環境変数:
  DATABASE_URL              - PostgreSQL接続URL (必須)
  BACKUP_DIR               - バックアップ保存ディレクトリ (オプション)
  BACKUP_RETENTION_DAYS    - バックアップ保持日数 (デフォルト: 7日)
  BACKUP_S3_BUCKET         - S3バケット名 (オプション)
      `);
      break;
  }
}

export default DatabaseBackup;