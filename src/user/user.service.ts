import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HTTPERROR } from 'src/common/enum/http-error.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { md5 } from 'src/utils/md5';
import { UserLoginDto } from './dto/user.dto';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prisma: PrismaService;

  private logger = new Logger();

  async register(data: Prisma.UserCreateInput) {
    const existUser = await this.prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existUser) {
      throw new BadRequestException(HTTPERROR.USER_EXIST);
    }

    try {
      return await this.prisma.user.create({
        data: { ...data, password: md5(data.password) },
      });
    } catch (error) {
      this.logger.error(error, UserService);
      return null;
    }
  }

  async login(userLoginDto: UserLoginDto) {
    const existUser = await this.prisma.user.findUnique({
      where: { username: userLoginDto.username },
    });

    if (!existUser) {
      throw new BadRequestException(HTTPERROR.USER_NOT_EXIST);
    }

    const cryptoPwd = md5(userLoginDto.password);
    if (existUser.password !== cryptoPwd) {
      throw new BadRequestException(HTTPERROR.USERNAME_OR_PASSWORD_ERROR);
    }

    delete existUser.password;
    return existUser;
  }
}
