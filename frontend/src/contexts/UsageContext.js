import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosConfig';

const UsageContext = createContext();

const CACHE_DURATION = 60000; // 1分間キャッシュ

export const UsageProvider = ({ children, storeId }) => {
    const [usageData, setUsageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetchTime, setLastFetchTime] = useState(null);

    const fetchUsageData = useCallback(async (forceRefresh = false) => {
        // キャッシュチェック
        if (!forceRefresh && lastFetchTime && Date.now() - lastFetchTime < CACHE_DURATION && usageData) {
            return usageData;
        }

        // 既にローディング中の場合はスキップ
        if (loading) {
            return usageData;
        }

        if (!storeId) {
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/api/usage/status?store_id=${storeId}`);
            const data = response.data;
            
            setUsageData(data);
            setLastFetchTime(Date.now());
            
            return data;
        } catch (err) {
            console.error('使用量データの取得に失敗しました:', err);
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [storeId, loading, lastFetchTime, usageData]);

    // storeIdが変更されたらキャッシュをクリア
    useEffect(() => {
        setUsageData(null);
        setLastFetchTime(null);
        setError(null);
    }, [storeId]);

    // 初回のデータ取得
    useEffect(() => {
        if (storeId && !usageData) {
            fetchUsageData();
        }
    }, [storeId, usageData, fetchUsageData]);

    const value = {
        usageData,
        loading,
        error,
        refetch: () => fetchUsageData(true),
        getCachedData: () => fetchUsageData(false)
    };

    return (
        <UsageContext.Provider value={value}>
            {children}
        </UsageContext.Provider>
    );
};

export const useUsage = () => {
    const context = useContext(UsageContext);
    if (!context) {
        throw new Error('useUsage must be used within a UsageProvider');
    }
    return context;
};