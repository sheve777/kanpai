/**
 * API呼び出しのキャンセル機能を提供するカスタムフック
 * コンポーネントのアンマウント時に自動的にリクエストをキャンセル
 */
import { useEffect, useRef } from 'react';

export const useAbortController = () => {
    const abortControllerRef = useRef(null);

    useEffect(() => {
        // 新しいAbortControllerを作成
        abortControllerRef.current = new AbortController();

        // クリーンアップ時に進行中のリクエストをキャンセル
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // 新しいリクエスト用のAbortControllerを取得
    const getAbortController = () => {
        if (!abortControllerRef.current) {
            abortControllerRef.current = new AbortController();
        }
        return abortControllerRef.current;
    };

    // 現在のリクエストをキャンセル
    const abort = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
        }
    };

    return {
        signal: abortControllerRef.current?.signal,
        getAbortController,
        abort
    };
};