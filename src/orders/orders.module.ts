import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entity/orders';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { OrderItem } from './entity/order-item';
import { Dish } from '../restaurants/entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Restaurant, OrderItem, Dish])],
  providers: [OrdersResolver, OrdersService],
})
export class OrdersModule {}
