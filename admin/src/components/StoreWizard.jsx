import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Store,
  MessageSquare,
  Calendar,
  Bot,
  Sparkles,
  AlertCircle,
  Upload,
  X
} from 'lucide-react';

// ウィザードステップコンポーネント
import BasicInfoStep from './wizard/BasicInfoStep';
import LineSetupStep from './wizard/LineSetupStep';
import GoogleSetupStep from './wizard/GoogleSetupStep';
import AISetupStep from './wizard/AISetupStep';
import CompletionStep from './wizard/CompletionStep';

const StoreWizard = ({ isOpen, onClose }) => {
  const { api } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ウィザードデータの状態管理
  const [wizardData, setWizardData] = useState({
    // Step 1: 基本情報
    basicInfo: {
      name: '',
      phone: '',
      address: '',
      concept: '',
      operatingHours: {
        monday: { open: '17:00', close: '23:00', closed: false },
        tuesday: { open: '17:00', close: '23:00', closed: false },
        wednesday: { open: '17:00', close: '23:00', closed: false },
        thursday: { open: '17:00', close: '23:00', closed: false },
        friday: { open: '17:00', close: '24:00', closed: false },
        saturday: { open: '16:00', close: '24:00', closed: false },
        sunday: { open: '16:00', close: '22:00', closed: false }
      },
      plan: 'standard'
    },
    // Step 2: LINE設定
    lineSetup: {
      channelId: '',
      channelSecret: '',
      accessToken: '',
      webhookUrl: '',
      richMenuEnabled: true
    },
    // Step 3: Google設定
    googleSetup: {
      calendarId: 'primary',
      serviceAccountEmail: '',
      privateKey: '',
      timezone: 'Asia/Tokyo',
      autoCreateEvents: true,
      syncExistingEvents: false
    },
    // Step 4: AI設定
    aiSetup: {
      personality: 'friendly',
      tone: 'casual',
      language: 'ja',
      customPrompt: '',
      useCommonKey: true,
      customApiKey: '',
      enableAutoReply: true,
      enableLearning: true
    },
    // 完了情報
    completion: {
      storeId: null,
      setupComplete: false
    }
  });

  // ウィザードステップ定義
  const steps = [
    {
      id: 'basic',
      title: '基本情報',
      icon: Store,
      description: '店舗の基本情報を入力',
      component: BasicInfoStep,
      required: true
    },
    {
      id: 'line',
      title: 'LINE設定',
      icon: MessageSquare,
      description: 'LINE Bot APIの設定',
      component: LineSetupStep,
      required: true
    },
    {
      id: 'google',
      title: 'Google連携',
      icon: Calendar,
      description: 'Googleカレンダー連携',
      component: GoogleSetupStep,
      required: false
    },
    {
      id: 'ai',
      title: 'AI設定',
      icon: Bot,
      description: 'チャットボットの設定',
      component: AISetupStep,
      required: true
    },
    {
      id: 'complete',
      title: '完了',
      icon: Sparkles,
      description: 'セットアップ完了',
      component: CompletionStep,
      required: false
    }
  ];

  // データ更新関数
  const updateWizardData = (stepKey, data) => {
    setWizardData(prev => ({
      ...prev,
      [stepKey]: {
        ...prev[stepKey],
        ...data
      }
    }));
  };

  // バリデーション関数
  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    const stepData = wizardData[step.id === 'basic' ? 'basicInfo' : step.id === 'line' ? 'lineSetup' : step.id === 'google' ? 'googleSetup' : step.id === 'ai' ? 'aiSetup' : 'completion'];
    const stepErrors = {};

    switch (step.id) {
      case 'basic':
        if (!stepData.name.trim()) stepErrors.name = '店舗名は必須です';
        if (!stepData.phone.trim()) stepErrors.phone = '電話番号は必須です';
        if (!stepData.address.trim()) stepErrors.address = '住所は必須です';
        break;
      
      case 'line':
        if (!stepData.channelId.trim()) stepErrors.channelId = 'Channel IDは必須です';
        if (!stepData.channelSecret.trim()) stepErrors.channelSecret = 'Channel Secretは必須です';
        if (!stepData.accessToken.trim()) stepErrors.accessToken = 'Access Tokenは必須です';
        break;
      
      case 'ai':
        if (!stepData.useCommonKey && !stepData.customApiKey.trim()) {
          stepErrors.customApiKey = 'カスタムAPIキーが必要です';
        }
        break;
      
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [step.id]: stepErrors
    }));

    return Object.keys(stepErrors).length === 0;
  };

  // 次のステップへ
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === steps.length - 2) {
      // 最後のステップ前なので、店舗作成を実行
      await handleCreateStore();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // 前のステップへ
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // 店舗作成処理
  const handleCreateStore = async () => {
    setIsLoading(true);
    
    try {
      const response = await api.post('/stores/create', {
        basicInfo: wizardData.basicInfo,
        lineSetup: wizardData.lineSetup,
        googleSetup: wizardData.googleSetup,
        aiSetup: wizardData.aiSetup
      });

      if (response.data.success) {
        updateWizardData('completion', {
          storeId: response.data.storeId,
          setupComplete: true
        });
      } else {
        throw new Error(response.data.error || '店舗作成に失敗しました');
      }
    } catch (error) {
      console.error('店舗作成エラー:', error);
      setErrors(prev => ({
        ...prev,
        creation: error.response?.data?.error || error.message || '店舗作成に失敗しました'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // プログレス計算
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        {/* ヘッダー */}
        <div className="wizard-header">
          <div className="wizard-title">
            <h1>新店舗セットアップ</h1>
            <p>ステップバイステップで店舗を追加します</p>
          </div>
          <button className="wizard-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* プログレスバー */}
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              const isAccessible = index <= currentStep;

              return (
                <div 
                  key={step.id}
                  className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!isAccessible ? 'disabled' : ''}`}
                  onClick={() => isAccessible && setCurrentStep(index)}
                >
                  <div className="step-icon">
                    {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                  </div>
                  <div className="step-info">
                    <div className="step-title">{step.title}</div>
                    <div className="step-description">{step.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* エラー表示 */}
        {errors.creation && (
          <div className="wizard-error">
            <AlertCircle size={20} />
            <span>{errors.creation}</span>
          </div>
        )}

        {/* メインコンテンツ */}
        <div className="wizard-content">
          <CurrentStepComponent
            data={wizardData}
            updateData={updateWizardData}
            errors={errors}
            isLoading={isLoading}
          />
        </div>

        {/* フッター */}
        <div className="wizard-footer">
          <button 
            className="btn-secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
          >
            <ChevronLeft size={18} />
            戻る
          </button>
          
          <div className="wizard-step-indicator">
            {currentStep + 1} / {steps.length}
          </div>
          
          {currentStep === steps.length - 1 ? (
            <button 
              className="btn-primary"
              onClick={onClose}
            >
              完了
            </button>
          ) : (
            <button 
              className="btn-primary"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  作成中...
                </>
              ) : (
                <>
                  次へ
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreWizard;