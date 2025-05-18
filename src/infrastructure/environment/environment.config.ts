import { ConfigModule } from '@nestjs/config';
import environment from './environment';

export const EnvironmentConfig = ConfigModule.forRoot({
  isGlobal: true,
  load: [environment],
});
