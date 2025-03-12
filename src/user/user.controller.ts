import { Controller, Get, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Get()
  async findAll() {
    try {
      const cities = await this.dataSource.query('SELECT * FROM geography___city LIMIT 10');
      return cities;
    } catch (error) {
      this.logger.error(`Database query failed:  `);
      throw error;
    }
  }
}
