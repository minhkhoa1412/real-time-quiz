import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_PUBLISHER_CLIENT, REDIS_SUBSCRIBER_CLIENT } from '~/ultilies/constants';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_SUBSCRIBER_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        });
      },
    },
    {
      provide: REDIS_PUBLISHER_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        });
      },
    },
  ],
  exports: [REDIS_SUBSCRIBER_CLIENT, REDIS_PUBLISHER_CLIENT],
})
export class RedisModule {}
