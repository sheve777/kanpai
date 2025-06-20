// C:\Users\acmsh\kanpAI\backend\src\routes\chatRoutes.js
import express from 'express';
import line from '@line/bot-sdk';
import pool from '../config/db.js';
import { generateChatResponse } from '../services/chatService.js';

const router = express.Router();
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'dummy-token',
  channelSecret: process.env.LINE_CHANNEL_SECRET || 'dummy-secret',
};

const findOrCreateSession = async (storeId, lineUserId) => {
    const client = await pool.connect();
    try {
        // 30分以内にアクティビティがあるセッションを探す
        let res = await client.query(
            "SELECT id FROM chat_sessions WHERE store_id = $1 AND line_user_id = $2 AND last_activity > NOW() - INTERVAL '30 minutes' ORDER BY last_activity DESC LIMIT 1",
            [storeId, lineUserId]
        );

        if (res.rows.length > 0) {
            // 既存セッションがあれば最終アクティビティ時刻を更新
            await client.query('UPDATE chat_sessions SET last_activity = NOW() WHERE id = $1', [res.rows[0].id]);
            return res.rows[0].id;
        } else {
            //なければ新規作成
            res = await client.query(
                'INSERT INTO chat_sessions (store_id, line_user_id, last_activity) VALUES ($1, $2, NOW()) RETURNING id',
                [storeId, lineUserId]
            );
            return res.rows[0].id;
        }
    } finally {
        client.release();
    }
};


router.post('/webhook/:storeId', (req, res, next) => {
  // LINE middlewareを一時的に無効化（デモモード）
  if (!process.env.LINE_CHANNEL_SECRET) {
    console.log('⚠️ デモモード: LINE middleware をスキップします');
    return next();
  }
  return line.middleware(config)(req, res, next);
}, async (req, res) => {
  try {
    if (!req.body.events || req.body.events.length === 0) return res.status(200).json({});
    const storeId = req.params.storeId;
    await Promise.all(req.body.events.map(event => handleEvent(event, storeId)));
    res.status(200).json({});
  } catch (err) {
    if (err instanceof line.SignatureValidationFailed) res.status(401).send(err.message);
    else { console.error(err); res.status(500).send(); }
  }
});

const client = new line.Client(config);

const handleEvent = async (event, storeId) => {
  if (event.type !== 'message' || event.message.type !== 'text') return null;
  
  const lineUserId = event.source.userId;
  const sessionId = await findOrCreateSession(storeId, lineUserId);
  
  const userMessage = event.message.text;
  const replyToken = event.replyToken;
  const aiReply = await generateChatResponse(userMessage, storeId, sessionId);
  
  if(aiReply) {
    return client.replyMessage(replyToken, { type: 'text', text: aiReply });
  }
};

export default router;
