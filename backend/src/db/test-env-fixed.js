// C:\Users\acmsh\kanpAI\backend\src\db\test-env-fixed.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .envファイルのパスを明示的に指定
const envPath = path.join(__dirname, '../../.env');
console.log('📁 .envファイルパス:', envPath);

dotenv.config({ path: envPath });

console.log('🔧 環境変数テスト（修正版）');
console.log('================');

const envVars = [
  'LINE_CHANNEL_ACCESS_TOKEN',
  'OWNER_LINE_ID',
  'GOOGLE_CALENDAR_ID',
  'DB_HOST',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`${varName}: ${value ? '✅ 設定済み' : '❌ 未設定'}`);
  if (value) {
    // 最初の10文字と最後の10文字のみ表示（セキュリティ）
    const masked = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
      : value.substring(0, 10) + '...';
    console.log(`  値: ${masked}`);
  }
  console.log('');
});

console.log('================');

// .envファイルが存在するかチェック
import fs from 'fs';
if (fs.existsSync(envPath)) {
  console.log('✅ .envファイルが見つかりました');
} else {
  console.log('❌ .envファイルが見つかりません');
  console.log('📁 予想されるパス:', envPath);
}