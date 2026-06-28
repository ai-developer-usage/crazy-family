/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// react-family-tree ships ambient const-enum types that clash with
// `isolatedModules`. We drive it through our own structural types instead, so
// treat the module as untyped here.
declare module 'react-family-tree';
