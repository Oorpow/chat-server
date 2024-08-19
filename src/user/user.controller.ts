import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from './user.service';
import { RegisterUserDto, UserLoginDto } from './dto/user.dto';
import { RequiredLogin, UserInfo } from 'src/common/decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @Post('login')
  async login(@Body() userLogin: UserLoginDto) {
    const userPayload = await this.userService.login(userLogin);

    const token = this.jwtService.sign(
      {
        userId: userPayload.id,
        username: userPayload.username,
      },
      {
        expiresIn: '7d',
      },
    );

    return token;
  }

  // 生成一个接口，用于获取登录用户的基本信息
  @RequiredLogin()
  @Get('auth')
  async authInfo(@UserInfo('userId') userId: number) {
    return this.userService.authInfo(userId);
  }
}
