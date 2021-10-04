import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { Core } from '../../common/entities/core.entities';
import { Dish } from '../../restaurants/entities/dish.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';
import { User } from '../../users/entities/user.entities';
import { OrderItem } from './order-item';

export enum OrderStatus {
  PENDING = 'PENDING',
  COOKING = 'COOKING',
  PICKEDUP = 'PICKEDUP',
  DELIVERD = 'DELIVERED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends Core {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, {
    onDelete: 'SET NULL',
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.rides, {
    onDelete: 'SET NULL',
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  restaurant?: Restaurant;

  @Field(() => [OrderItem])
  @ManyToMany(() => OrderItem)
  @JoinTable()
  items: OrderItem[];

  @Field(() => Float, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  total?: number;

  @Field(() => OrderStatus)
  @Column({ enum: OrderStatus, type: 'enum', default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
