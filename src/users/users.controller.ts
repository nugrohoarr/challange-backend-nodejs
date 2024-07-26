import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Put, Req } from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../common/decorators';
import { Prisma } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  @Public()
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiBody({ type: CreateUserDto })
  async createUser(
    @Body() createUsersDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      // Attempt to create the user
      const createdUser = await this.usersService.createUser(createUsersDto);

      // Exclude the password from the response
      const { password, ...userData } = createdUser;

      return res.status(HttpStatus.CREATED).json({
        message: 'Register Successfully',
        data: userData
      });
    } catch (error) {
      // Handle duplicate email or phone number error
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'Email already exists.',
        });
      }
      // Handle bad request errors (e.g., validation errors)
      else if (error.status === HttpStatus.BAD_REQUEST) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Invalid data provided. Please check the input and try again.',
        });
      }
      // Handle all other errors as server errors
      else {
        console.error('Error details:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: error.message,
        });
      }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getAllUsers(@Res() res: Response): Promise<Response> {
    try {
      const users = await this.usersService.getAllUsers();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: users
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot get data',
      });
    }
  }

  @Get('/detail/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getUserById(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response> {
    try {
      const user = await this.usersService.getUserById(id);
      if (!user) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Server Error, cannot get data',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully',
        data: user
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.NOT_FOUND).json({
        status_code: HttpStatus.NOT_FOUND,
        message: 'User not found',
      });
    }
  }

  @Put('/update/:id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const updatedUser = await this.usersService.updateUser(id, updateUserDto);
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot update data',
      });
    }
  }

  @Delete('/delete/:id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async deleteUser(
    @Param('id') id: string,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const deleted = await this.usersService.deleteUser(id);
      if (deleted) {
        return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'User deleted successfully'
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({
          status_code: HttpStatus.NOT_FOUND,
          message: 'User not found'
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot delete data',
      });
    }
  }
}
