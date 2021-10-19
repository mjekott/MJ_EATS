import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { User } from './users/entities/user.entities';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middlewares';
import { MailModule } from './mail/mail.module';
import { Verification } from './users/entities/verification.entities';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { Category } from './restaurants/entities/category.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entity/orders';
import { OrderItem } from './orders/entity/order-item';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Payment } from './payments/entities/payment.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'dev' ? '.development.env' : '.test.env',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_DATABASE: Joi.string(),
        JWT_SECRET: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
      }),
    }),
    GraphQLModule.forRoot({
      installSubscriptionHandlers: true,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, connection }) => {
        const TOKEN_KEY = 'authorization';

        return {
          token: req ? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY],
        };
        /*   if (req) {
          return { user: req['user'] };
        } else {
          console.log(connection);
        } */
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
          }),

      logging:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
      synchronize: true,
      entities: [
        User,
        Verification,
        Category,
        Restaurant,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    JwtModule.forRoot({ privateKey: process.env.JWT_SECRET }),
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      fromEmail: process.env.MAILGUN_FROM_EMAIL,
      domain: process.env.MAILGUN_DOMAIN_NAME,
    }),
    UsersModule,
    RestaurantsModule,
    AuthModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  /*   configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  } */
}
