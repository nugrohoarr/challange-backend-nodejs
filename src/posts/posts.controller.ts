import { Controller, Get, Post, Body, Param, Put, Delete, Res, HttpStatus, Req } from '@nestjs/common';
import { Response } from 'express';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('posts')
@ApiBearerAuth()  // Add this if you have JWT or other auth methods
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully.' })
  @ApiResponse({ status: 500, description: 'Server Error, cannot create post.' })
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() req: any,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const authorId = req.user.id;
      const postData = { ...createPostDto, authorId };
      const createdPost = await this.postsService.createPost(postData);
      return res.status(HttpStatus.CREATED).json({
        status_code: HttpStatus.CREATED,
        message: 'Post created successfully',
        data: createdPost
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot create post',
      });
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'Successfully fetched posts.' })
  @ApiResponse({ status: 500, description: 'Server Error, cannot fetch posts.' })
  async getAllPosts(@Res() res: Response): Promise<Response> {
    try {
      const posts = await this.postsService.getAllPosts();
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully fetched posts',
        data: posts
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot fetch posts',
      });
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiResponse({ status: 200, description: 'Successfully fetched post.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 500, description: 'Server Error, cannot fetch post.' })
  async getPostById(
    @Param('id') id: number,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const post = await this.postsService.getPostById(id);
      if (!post) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Successfully fetched post',
        data: post
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot fetch post',
      });
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden to update this post.' })
  @ApiResponse({ status: 500, description: 'Server Error, cannot update post.' })
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: any,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const authorId = req.user.id;
      const updatedPost = await this.postsService.updatePost(id, updatePostDto, authorId);
      if (!updatedPost) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post not found',
        });
      }
      return res.status(HttpStatus.OK).json({
        status_code: HttpStatus.OK,
        message: 'Post updated successfully',
        data: updatedPost
      });
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot update post',
      });
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Post not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden to delete this post.' })
  @ApiResponse({ status: 500, description: 'Server Error, cannot delete post.' })
  async deletePost(
    @Param('id') id: number,
    @Req() req: any,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const authorId = req.user.id;
      const deleted = await this.postsService.deletePost(id, authorId);
      if (deleted) {
        return res.status(HttpStatus.OK).json({
          status_code: HttpStatus.OK,
          message: 'Post deleted successfully'
        });
      } else {
        return res.status(HttpStatus.NOT_FOUND).json({
          status_code: HttpStatus.NOT_FOUND,
          message: 'Post not found'
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Server Error, cannot delete post',
      });
    }
  }
}
