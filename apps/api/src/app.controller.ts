import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiBearerAuth('firebase-jwt')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Firebase JWT' })
  getHello(): string {
    return this.appService.getHello();
  }
}
