import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import settings from './settings';

@Module({
  imports: [AuthModule, MongooseModule.forRoot(settings().dbConfig().url)],
  controllers: [],
  providers: [],
})
export class AppModule {}
