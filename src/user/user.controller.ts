import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto, UserLoginDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';

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
}
