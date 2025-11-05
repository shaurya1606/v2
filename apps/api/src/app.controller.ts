import { Controller, Get, Post, Body } from '@nestjs/common';
import axios from 'axios';

interface LoginRequestBody {
  username: string;
  password: string;
}

interface LoginResponseBody {
  message: string;
}

type PingResponseBody = string;

@Controller()
export class AppController {
  @Get('ping')
  async ping(): Promise<{ goResponse: PingResponseBody }> {
    const response = await axios.get<PingResponseBody>(
      'http://localhost:8080/ping',
    );
    const data: PingResponseBody = response.data;
    return { goResponse: data };
  }

  @Post('login')
  async login(@Body() body: LoginRequestBody): Promise<LoginResponseBody> {
    const response = await axios.post<LoginResponseBody>(
      'http://localhost:8080/login',
      body,
    );
    const data: LoginResponseBody = response.data;
    return data;
  }
}
