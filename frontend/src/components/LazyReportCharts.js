/**
 * Chart.jsコンポーネントの遅延読み込みラッパー
 */
import React, { lazy, Suspense } from 'react';

// Chart.jsコンポーネントを遅延読み込み
const ReportCharts = lazy(() => import('./ReportCharts'));

const ChartLoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
    }}>
        <div style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid var(--color-accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
            }} />
            <div>📊 チャートを読み込み中...</div>
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    </div>
);

const LazyReportCharts = (props) => (
    <Suspense fallback={<ChartLoadingFallback />}>
        <ReportCharts {...props} />
    </Suspense>
);

export default LazyReportCharts;