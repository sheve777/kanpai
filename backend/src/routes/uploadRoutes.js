// C:\Users\acmsh\kanpAI\backend\src\routes\uploadRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('ファイルがアップロードされませんでした。');
  }
  
  // ★★★ ngrokのURLをベースにした、公開HTTPS URLを生成 ★★★
  const baseUrl = process.env.NGROK_BASE_URL;
  if (!baseUrl) {
    console.error("エラー: .envファイルにNGROK_BASE_URLが設定されていません。");
    return res.status(500).json({ error: 'サーバーの設定エラーです。' });
  }
  const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
  console.log(`生成された画像URL: ${fileUrl}`);
  res.status(200).json({ imageUrl: fileUrl });
});

export default router;
