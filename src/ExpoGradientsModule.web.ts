import { registerWebModule, NativeModule } from 'expo';

// ExpoGradientsModule is not available on the web platform.
class ExpoGradientsModule extends NativeModule<{}> {}

export default registerWebModule(ExpoGradientsModule, 'ExpoGradientsModule');
