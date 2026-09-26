import { NativeModule, requireNativeModule } from 'expo';

declare class ExpoGradientsModule extends NativeModule<{}> {}

export default requireNativeModule<ExpoGradientsModule>('ExpoGradients');
