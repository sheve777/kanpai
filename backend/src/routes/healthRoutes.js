import express from 'express';
import pool from '../config/db.js';
import OpenAI from 'openai';

const router = express.Router();

// 基本ヘルスチェック
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 詳細システム状態チェック
router.get('/detailed', async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'unknown' },
      openai: { status: 'unknown' },
      memory: { status: 'unknown' },
      disk: { status: 'unknown' }
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  // データベース接続チェック
  try {
    const dbStart = Date.now();
    const result = await pool.query('SELECT NOW() as current_time');
    const dbLatency = Date.now() - dbStart;
    
    healthCheck.services.database = {
      status: 'healthy',
      latency: `${dbLatency}ms`,
      connected: true,
      serverTime: result.rows[0].current_time
    };
  } catch (error) {
    healthCheck.services.database = {
      status: 'unhealthy',
      error: error.message,
      connected: false
    };
    healthCheck.status = 'degraded';
  }

  // OpenAI API接続チェック（軽量）
  try {
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_')) {
      const openai = new OpenAI();
      // 実際のAPI呼び出しは避け、設定チェックのみ
      healthCheck.services.openai = {
        status: 'configured',
        configured: true
      };
    } else {
      healthCheck.services.openai = {
        status: 'not_configured',
        configured: false
      };
    }
  } catch (error) {
    healthCheck.services.openai = {
      status: 'error',
      error: error.message,
      configured: false
    };
  }

  // メモリ使用量チェック
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.heapTotal;
  const usedMemory = memoryUsage.heapUsed;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;

  healthCheck.services.memory = {
    status: memoryUsagePercent > 85 ? 'warning' : 'healthy',
    usagePercent: Math.round(memoryUsagePercent),
    heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`
  };

  if (memoryUsagePercent > 95) {
    healthCheck.status = 'degraded';
  }

  // 環境変数チェック
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'LINE_CHANNEL_ACCESS_TOKEN',
    'STRIPE_API_KEY'
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => 
    !process.env[envVar] || process.env[envVar].includes('your_')
  );

  healthCheck.services.environment = {
    status: missingEnvVars.length > 0 ? 'warning' : 'healthy',
    missingVariables: missingEnvVars,
    demoMode: process.env.DEMO_MODE === 'true'
  };

  if (missingEnvVars.length > 0) {
    healthCheck.status = 'degraded';
  }

  res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
});

// システムメトリクス
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // データベース統計
    try {
      const dbStats = await pool.query(`
        SELECT 
          count(*) as total_connections,
          sum(case when state = 'active' then 1 else 0 end) as active_connections
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);
      
      metrics.database = {
        totalConnections: parseInt(dbStats.rows[0].total_connections),
        activeConnections: parseInt(dbStats.rows[0].active_connections),
        poolSize: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      };
    } catch (error) {
      metrics.database = { error: error.message };
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to gather metrics',
      message: error.message
    });
  }
});

export default router;