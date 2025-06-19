/**
 * エラーハンドリング用カスタムフック
 * 統一されたエラー処理とユーザーフレンドリーなメッセージを提供
 */
import { useState, useCallback } from 'react';
import { logger } from '../utils/environment';

export const useErrorHandler = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * エラーをクリア
     */
    const clearError = useCallback(() => {
        setError('');
    }, []);

    /**
     * エラーを設定（APIエラーレスポンスを自動解析）
     * @param {Error|string} err - エラーオブジェクトまたは文字列
     * @param {string} fallbackMessage - デフォルトエラーメッセージ
     * @param {string} context - エラーコンテキスト（ログ用）
     */
    const handleError = useCallback((err, fallbackMessage = 'エラーが発生しました', context = '') => {
        let userMessage = fallbackMessage;
        
        // APIエラーレスポンスから適切なメッセージを抽出
        if (err?.response) {
            // サーバーエラーレスポンス
            const errorData = err.response.data;
            if (errorData?.error) {
                userMessage = errorData.error;
            } else if (errorData?.message) {
                userMessage = errorData.message;
            } else if (err.response.status === 404) {
                userMessage = 'お探しのデータが見つかりませんでした';
            } else if (err.response.status === 403) {
                userMessage = 'アクセス権限がありません';
            } else if (err.response.status === 500) {
                userMessage = 'サーバーエラーが発生しました。しばらく後にお試しください';
            } else if (err.response.status >= 400) {
                userMessage = '通信エラーが発生しました';
            }
        } else if (err?.message) {
            // JavaScript エラー
            if (err.name === 'AbortError') {
                return; // AbortErrorは表示しない
            }
            userMessage = err.message;
        } else if (typeof err === 'string') {
            userMessage = err;
        }

        // コンソールにテクニカルな詳細をログ
        const logMessage = context ? `❌ ${context}:` : '❌ エラー:';
        logger.error(logMessage, err);

        setError(userMessage);
    }, []);

    /**
     * 非同期処理をラップしてエラーハンドリングを追加
     * @param {Function} asyncFn - 非同期関数
     * @param {string} fallbackMessage - エラー時のフォールバックメッセージ
     * @param {string} context - エラーコンテキスト
     * @returns {Promise} - 元の非同期関数の結果
     */
    const executeWithErrorHandling = useCallback(async (
        asyncFn, 
        fallbackMessage = 'エラーが発生しました',
        context = ''
    ) => {
        clearError();
        setLoading(true);
        
        try {
            const result = await asyncFn();
            return result;
        } catch (err) {
            handleError(err, fallbackMessage, context);
            throw err; // 必要に応じて上位でキャッチできるようにする
        } finally {
            setLoading(false);
        }
    }, [clearError, handleError]);

    /**
     * 特定のエラータイプ用のヘルパー関数
     */
    const handleLoginError = useCallback((err) => {
        handleError(err, 'ログインに失敗しました。IDとパスワードを確認してください', 'ログイン');
    }, [handleError]);

    const handleApiError = useCallback((err, action = 'データ取得') => {
        handleError(err, `${action}に失敗しました`, action);
    }, [handleError]);

    const handleValidationError = useCallback((message) => {
        setError(message);
    }, []);

    const handleNetworkError = useCallback(() => {
        setError('ネットワークに接続できません。インターネット接続を確認してください');
    }, []);

    return {
        error,
        loading,
        clearError,
        handleError,
        executeWithErrorHandling,
        setLoading,
        // 特定用途向けヘルパー
        handleLoginError,
        handleApiError,
        handleValidationError,
        handleNetworkError
    };
};