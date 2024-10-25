import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '~/common/utils/passwordUtilize';
import { PrismaService } from '~/prisma/services/prisma.service';
import { CreateUserDto } from '../dto/auth.dto';
import { omit } from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, password } = createUserDto;

    let user = await this.prismaService.user.findUnique({
      where: { userName: name },
    });

    if (!user) {
      const passwordHashed = await hashPassword(password);
      user = await this.prismaService.user.create({
        data: {
          userName: name,
          password: passwordHashed,
        },
      });
    } else {
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new HttpException(
          'Invalid email or password',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const payload = {
      id: user.id,
      userName: user.userName,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: omit(user, 'password'),
    };
  }
}
