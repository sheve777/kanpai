// C:\Users\acmsh\kanpAI\backend\src\services\chatService.js
import OpenAI from 'openai';
import pool from '../config/db.js';
import { searchMenus } from './menuService.js';

const openai = new OpenAI();

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

const logMessage = async (sessionId, role, content, meta = null) => {
    const query = 'INSERT INTO chat_messages (session_id, message_type, content, analytics_meta) VALUES ($1, $2, $3, $4)';
    await pool.query(query, [sessionId, role, content, meta]);
};

export const generateChatResponse = async (userMessage, storeId, sessionId) => {
    console.log(`[チャットサービス] セッションID(${sessionId}) 受信: "${userMessage}"`);
    
    await logMessage(sessionId, 'user', userMessage, null);

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
