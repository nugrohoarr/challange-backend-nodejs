import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { Public } from '../common/decorators';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Tokens } from './types';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('/')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login to the application' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: AuthDto })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: false,
  })
  async login(@Body() dto: AuthDto, @Res() res: any): Promise<Tokens> {
    try {
      const tokens = await this.authService.login(dto);
      res.header('Authorization', `Bearer ${tokens.access_token}`);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK, 
        message: 'Login successful', 
        token: tokens.access_token 
      });
    } catch (error) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Invalid credentials' });
    }
  }

  @Put('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: UpdatePasswordDto })
  async changePassword(
    @Req() req: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Res() res: any
  ) {
    try {
      const { oldPassword, newPassword } = updatePasswordDto;
      await this.authService.changePassword(req, oldPassword, newPassword);
      return res.status(HttpStatus.OK).json({ message: 'Password changed successfully' });
    } catch (error) {
      return { error: error.message };
    }
  }
}
