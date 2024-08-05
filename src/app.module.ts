import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatroomModule } from './chatroom/chatroom.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          secret: 'chatsecret',
          signOptions: {
            expiresIn: '1d',
          },
        };
      },
    }),
    FriendshipModule,
    ChatroomModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
