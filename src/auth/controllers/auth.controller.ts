import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('create')
  createQuizId(@Body() createUserDto: CreateUserDto) {
    const user = this.authService.createUser(createUserDto);
    return { user };
  }
}
