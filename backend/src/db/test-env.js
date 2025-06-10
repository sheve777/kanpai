// C:\Users\acmsh\kanpAI\backend\src\db\test-env.js
import dotenv from 'dotenv';

dotenv.config();

console.log('🔧 環境変数テスト');
console.log('================');

const envVars = [
  'LINE_CHANNEL_ACCESS_TOKEN',
  'OWNER_LINE_ID',
  'GOOGLE_CALENDAR_ID',
  'DB_HOST'
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