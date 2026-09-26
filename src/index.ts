// Reexport the native module. On web, it will be resolved to ExpoGradientsModule.web.ts
// and on native platforms to ExpoGradientsModule.ts
export { default } from './ExpoGradientsModule';
export { default as ExpoGradientsView } from './ExpoGradientsView';
export * from './ExpoGradients.types';
