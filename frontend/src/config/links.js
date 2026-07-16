/**
 * AppCreator24 / appmaker24 + public URLs (from CRA env at build time).
 */

export const PUBLIC_WEB_URL =
  process.env.REACT_APP_PUBLIC_WEB_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

export const APPCREATOR24_APP_URL =
  process.env.REACT_APP_APPCREATOR24_APP_URL || '';

export const APPCREATOR24_BUILDER_URL =
  process.env.REACT_APP_APPCREATOR24_BUILDER_URL || 'https://www.appcreator24.com';

export const hasAndroidShell = Boolean(APPCREATOR24_APP_URL);
