import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// 继承自PrismaClient，让PrismaService也有CRUD API
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: [{ emit: 'stdout', level: 'query' }],
    });
  }

  async onModuleInit() {
    // throw new Error('Method not implemented.');
    await this.$connect();
  }
}
