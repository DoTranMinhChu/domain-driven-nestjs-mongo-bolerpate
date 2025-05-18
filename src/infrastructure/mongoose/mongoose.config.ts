import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
export const MongooseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: async (config: ConfigService) => {
    return {
      uri: config.get<string>('database.mongodb.mainUri') || '',
      // Tự động tạo index theo schema (production có thể tắt để tăng hiệu năng)
      autoIndex: true,
      // Giới hạn số kết nối tối đa trong pool
      maxPoolSize: 10,
      // Timeout để chờ Mongo server chọn
      serverSelectionTimeoutMS: 5000,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    };
  },
  inject: [ConfigService],
});
