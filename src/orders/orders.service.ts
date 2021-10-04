import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dish } from '../restaurants/entities/dish.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { User, UserRole } from '../users/entities/user.entities';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrdersInputType, GetOrdersOutput } from './dtos/get-orders.dtos';
import { OrderItem } from './entity/order-item';
import { Order } from './entity/orders';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orders: Repository<Order>,
    @InjectRepository(OrderItem) private orderitems: Repository<OrderItem>,
    @InjectRepository(Dish) private dishes: Repository<Dish>,
    @InjectRepository(Restaurant) private restaurants: Repository<Restaurant>,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant Not Found',
        };
      }

      let orderTotalPrice = 0;
      const OrderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishes.findOne(item.dishId);

        if (!dish) {
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishTotalPrice: number = dish.price;
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              dishTotalPrice += dishOption.extra;
            } else {
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice.extra) {
                dishTotalPrice += dishOptionChoice.extra;
              }
            }
          }
        }
        orderTotalPrice += dishTotalPrice;
        const orderItem = await this.orderitems.save(
          this.orderitems.create({
            dish,
            options: item.options,
          }),
        );

        OrderItems.push(orderItem);
      }

      await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderTotalPrice,
          items: OrderItems,
        }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Coudnt create Order',
      };
    }
  }

  async getOrders(
    user: User,
    getOrdersInput: GetOrdersInputType,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.CLIENT) {
        orders = await this.orders.find({
          where: {
            customer: user,
          },
        });
      } else if (user.role === UserRole.DELIVERY) {
        orders = await this.orders.find({
          where: {
            driver: user,
          },
        });
      } else if (user.role === UserRole.OWNER) {
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });
        orders = (await restaurants)
          .map((restaurant) => restaurant.orders)
          .flat(1);
      }

      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }
}
