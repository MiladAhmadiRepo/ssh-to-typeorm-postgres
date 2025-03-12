import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { UsersController } from './user/user.controller';

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [UsersController],
  providers: [AppService],
})
export class AppModule {}
