/**
 * XSS攻撃防止のためのサニタイゼーション関数
 */
import DOMPurify from 'dompurify';

/**
 * HTMLタグを含む可能性のあるテキストを安全にサニタイズ
 * @param {string} dirty - サニタイズ対象の文字列
 * @returns {string} - サニタイズされた安全な文字列
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }
  
  // HTMLタグを完全に除去（テキストのみ保持）
  return DOMPurify.sanitize(dirty, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * ユーザー名など基本的なテキストをサニタイズ
 * @param {string} text - サニタイズ対象の文字列
 * @returns {string} - サニタイズされた安全な文字列
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // HTMLエンティティをエスケープ
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * 安全にHTMLを表示するためのReactプロパティを生成
 * @param {string} html - 表示するHTML
 * @returns {object} - dangerouslySetInnerHTMLプロパティ
 */
export const createSafeHtml = (html) => {
  return {
    __html: sanitizeHtml(html)
  };
};