/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Contentstack Configuration
  readonly VITE_CONTENTSTACK_API_BASE_URL: string;
  
  // Gemini AI Configuration
  readonly VITE_GEMINI_DEFAULT_MODEL: string;
  
  // Allow other dynamic env variables
  [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
