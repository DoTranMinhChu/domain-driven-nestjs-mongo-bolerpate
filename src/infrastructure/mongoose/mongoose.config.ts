import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
export const MongooseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    return {
      uri: config.get<string>('database.mongodb.mainUri') || '',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
  },
  inject: [ConfigService],
});
