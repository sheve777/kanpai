// C:\Users\acmsh\kanpAI\backend\src\services\chatService.js
import OpenAI from 'openai';
import pool from '../config/db.js';
import { searchMenus } from './menuService.js';
import { checkChatbotUsage } from '../middlewares/usageLimit.js';

// OpenAI初期化を条件付きに変更
let openai = null;
try {
    openai = new OpenAI();
    console.log('✅ OpenAI client initialized successfully');
} catch (error) {
    console.warn('⚠️ OpenAI initialization skipped:', error.message);
}

// ★★★ AIが使う「道具」の定義を完全に復元 ★★★
const tools = [
    {
        type: "function",
        function: {
            name: "menu_search",
            description: "お店のメニューについて、カテゴリやキーワードで検索します。",
            parameters: {
                type: "object",
                properties: {
                    category: {
                        type: "string",
                        description: "ドリンク、揚げ物、焼き鳥などのメニューカテゴリ",
                    },
                    keyword: {
                        type: "string",
                        description: "メニュー名や説明に含まれるキーワード (例: '唐揚げ', 'ビール')",
                    },
                },
                required: [],
            },
        },
    },
];

// 営業時間チェック関数
const isOpenNow = async (storeId) => {
    try {
        const query = 'SELECT operating_hours FROM stores WHERE id = $1';
        const result = await pool.query(query, [storeId]);
        
        if (result.rows.length === 0) {
            return true; // デフォルトで営業中とする
        }
        
        const operatingHours = result.rows[0].operating_hours;
        if (!operatingHours) {
            return true; // 営業時間設定なしの場合は営業中とする
        }
        
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute; // 分に変換
        
        // 営業時間の例: {"start": "17:00", "end": "24:00", "closed_days": []}
        const startTime = operatingHours.start ? timeToMinutes(operatingHours.start) : 0;
        const endTime = operatingHours.end ? timeToMinutes(operatingHours.end) : 1440; // 24:00 = 1440分
        
        // 営業時間の判定（深夜営業対応）
        if (endTime > startTime) {
            // 通常の営業時間（例: 17:00-24:00）
            return currentTime >= startTime && currentTime < endTime;
        } else {
            // 深夜越え営業（例: 22:00-02:00）
            return currentTime >= startTime || currentTime < endTime;
        }
    } catch (error) {
        console.error('営業時間チェックエラー:', error);
        return true; // エラー時は営業中とする
    }
};

// 時間文字列（HH:MM）を分に変換
const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// 営業時間外の応答を生成
const generateClosedResponse = async (storeId) => {
    try {
        const query = 'SELECT name, operating_hours, phone FROM stores WHERE id = $1';
        const result = await pool.query(query, [storeId]);
        
        if (result.rows.length === 0) {
            return "申し訳ございません。現在営業時間外です。";
        }
        
        const store = result.rows[0];
        const operatingHours = store.operating_hours;
        const storeName = store.name || 'お店';
        const phone = store.phone;
        
        let response = `申し訳ございません。現在${storeName}は営業時間外です。`;
        
        if (operatingHours && operatingHours.start && operatingHours.end) {
            response += `\n\n📅 営業時間: ${operatingHours.start}〜${operatingHours.end}`;
        }
        
        if (phone) {
            response += `\n📞 お急ぎの場合: ${phone}`;
        }
        
        response += '\n\n📅 ご予約は24時間受付中です！\nLINEメニューの「予約する」ボタンからどうぞ♪';
        
        return response;
    } catch (error) {
        console.error('営業時間外応答生成エラー:', error);
        return "申し訳ございません。現在営業時間外です。ご予約は24時間受付中です！";
    }
};

// 営業時間外の予約誘導応答を生成
const generateReservationGuidance = async (storeId) => {
    try {
        const query = 'SELECT name, operating_hours FROM stores WHERE id = $1';
        const result = await pool.query(query, [storeId]);
        
        if (result.rows.length === 0) {
            return "ご予約承ります！24時間予約受付ページからお手続きください。";
        }
        
        const store = result.rows[0];
        const storeName = store.name || 'お店';
        const operatingHours = store.operating_hours;
        
        let response = `${storeName}のご予約承ります！\n\n`;
        response += '🕐 現在は営業時間外ですが、24時間いつでもご予約いただけます。\n\n';
        
        if (operatingHours && operatingHours.start && operatingHours.end) {
            response += `📅 営業時間: ${operatingHours.start}〜${operatingHours.end}\n\n`;
        }
        
        response += '📝 ご予約は下記からお手続きください：\n';
        response += '👇 LINEメニューの「📅 予約する」ボタン\n\n';
        response += '✨ 24時間いつでも予約確定！\n';
        response += '📧 予約確定の通知も自動送信いたします♪';
        
        return response;
    } catch (error) {
        console.error('予約誘導応答生成エラー:', error);
        return "ご予約承ります！LINEメニューの「予約する」ボタンから24時間いつでもお手続きいただけます♪";
    }
};

// 使用量制限時の「充電切れ」応答を生成（サービス用）
const generateBatteryDepletedResponseFromService = async (storeId) => {
    try {
        const query = 'SELECT name, bot_personality, phone FROM stores WHERE id = $1';
        const result = await pool.query(query, [storeId]);
        
        if (result.rows.length === 0) {
            return getBatteryResponse('neutral', 'お店');
        }
        
        const store = result.rows[0];
        const personality = store.bot_personality?.tone || 'friendly';
        const storeName = store.name || 'お店';
        const phone = store.phone;
        
        return getBatteryResponse(personality, storeName, phone);
    } catch (error) {
        console.error('充電切れ応答生成エラー:', error);
        return getBatteryResponse('neutral', 'お店');
    }
};

// 人格別の「充電切れ」応答テンプレート
const getBatteryResponse = (personality, storeName, phone = null) => {
    const phoneText = phone ? `📞 ${phone}` : `📞 ${storeName}`;
    
    const responses = {
        friendly: [
            `あー！ごめんなさい！😅\n今月はもうチャットボットの充電が切れちゃいました💦\n\nマスターに「充電お願いします！」って言ってもらえますか？🔋\n\n${phoneText}まで直接お電話いただければ、いつでも対応いたします♪\n\n📅 ご予約は24時間受付中です！`
        ],
        polite: [
            `申し訳ございません。\n今月のチャットボット利用上限に達してしまいました。\n\nマスターに「追加利用をお願いします」とお伝えください。\n\n${phoneText}まで直接お電話いただけますでしょうか。\n\n📅 ご予約は24時間受付中です。`
        ],
        casual: [
            `おっと〜！チャットボットのエネルギー切れだ⚡\n\nマスターに「パワーアップして〜」って頼んでくれる？\n\n${phoneText}に直接電話してね！\n\n📅 予約は24時間OKだよ〜`
        ],
        neutral: [
            `今月のチャットボット利用制限に達しました。\n\nお店に「チャットボットの追加利用」をお問い合わせください。\n\n${phoneText}まで直接お電話いただければ対応いたします。\n\n📅 ご予約は24時間受付中です。`
        ]
    };
    
    const responseList = responses[personality] || responses.friendly;
    return responseList[Math.floor(Math.random() * responseList.length)];
};

const logMessage = async (sessionId, role, content, meta = null) => {
    const query = 'INSERT INTO chat_messages (session_id, message_type, content, analytics_meta) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [sessionId, role, content, meta]);
};

export const generateChatResponse = async (userMessage, storeId, sessionId) => {
    console.log(`[チャットサービス] セッションID(${sessionId}) 受信: "${userMessage}"`);
    
    // OpenAIが初期化されていない場合はエラーメッセージを返す
    if (!openai) {
        const errorMessage = "申し訳ございません。AIチャットサービスは現在利用できません。お店に直接お問い合わせください。";
        await logMessage(sessionId, 'user', userMessage, null);
        await logMessage(sessionId, 'assistant', errorMessage);
        return errorMessage;
    }
    
    await logMessage(sessionId, 'user', userMessage, null);

    // 使用量制限チェック（営業時間問わず）
    const usageStatus = await checkChatbotUsage(storeId);
    if (usageStatus.isLimited) {
        const batteryResponse = await generateBatteryDepletedResponseFromService(storeId);
        await logMessage(sessionId, 'assistant', batteryResponse);
        return batteryResponse;
    }

    // 営業時間チェック
    const isOpen = await isOpenNow(storeId);
    
    // 予約関連キーワードのチェック
    const reservationKeywords = ['予約', 'ご予約', '予約したい', '席', '空き', 'booking', 'reserve'];
    const isReservationRequest = reservationKeywords.some(keyword => 
        userMessage.toLowerCase().includes(keyword)
    );
    
    // 営業時間外で予約以外の質問の場合は制限応答
    if (!isOpen && !isReservationRequest) {
        const closedResponse = await generateClosedResponse(storeId);
        await logMessage(sessionId, 'assistant', closedResponse);
        return closedResponse;
    }
    
    // 営業時間外の予約要求の場合は専用予約ページに誘導
    if (!isOpen && isReservationRequest) {
        const reservationResponse = await generateReservationGuidance(storeId);
        await logMessage(sessionId, 'assistant', reservationResponse);
        return reservationResponse;
    }

    try {
        const extractionResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "ユーザーのメッセージから、言及されているメニュー名を抽出し、{\"menus\": [\"メニュー1\", \"メニュー2\"]} というJSON形式で返してください。メニューがなければ {\"menus\": []} を返してください。" },
                { role: "user", content: userMessage }
            ],
            response_format: { type: "json_object" },
        });
        const result = JSON.parse(extractionResponse.choices[0].message.content);
        
        console.log('[チャットサービス] AIからのメニュー抽出結果:', result);

        if (result && Array.isArray(result.menus) && result.menus.length > 0) {
            const metaData = { mentioned_menus: result.menus };
            const updateQuery = `
              WITH last_message AS (
                SELECT id FROM chat_messages 
                WHERE session_id = $1 AND message_type = 'user' 
                ORDER BY created_at DESC 
                LIMIT 1
              )
              UPDATE chat_messages SET analytics_meta = $2 WHERE id = (SELECT id FROM last_message);
            `;
            await pool.query(updateQuery, [sessionId, JSON.stringify(metaData)]);
            console.log(`[チャットサービス] analytics_metaを更新しました。`);
        }
    } catch (e) {
        console.error("メニュー名の抽出またはDB更新に失敗しました:", e);
    }
    
    const messages = [
        { role: "system", content: "あなたは居酒屋「かんぱい」の優秀なAI店員です。お客様からの質問に、親切・丁寧に答えてください。メニューに関する質問には、必ず menu_search 関数を使って正確な情報を調べてから答えてください。" },
        { role: "user", content: userMessage },
    ];

    const response = await openai.chat.completions.create({ model: "gpt-4o", messages, tools, tool_choice: "auto" });
    const responseMessage = response.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls) {
        messages.push(responseMessage);
        for (const toolCall of toolCalls) {
            if (toolCall.function.name === "menu_search") {
                const functionArgs = JSON.parse(toolCall.function.arguments);
                const functionResponse = await searchMenus(storeId, functionArgs);
                messages.push({ tool_call_id: toolCall.id, role: "tool", name: "menu_search", content: JSON.stringify(functionResponse) });
            }
        }
        const secondResponse = await openai.chat.completions.create({ model: "gpt-4o", messages });
        const finalContent = secondResponse.choices[0].message.content;
        await logMessage(sessionId, 'assistant', finalContent);
        return finalContent;
    } else {
        const finalContent = responseMessage.content;
        await logMessage(sessionId, 'assistant', finalContent);
        return finalContent;
    }
};
