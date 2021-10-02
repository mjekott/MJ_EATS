import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import {
  CategoryResolver,
  DishResolver,
  RestaurantsResolver,
} from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, Dish])],
  providers: [
    RestaurantsResolver,
    RestaurantsService,
    CategoryResolver,
    DishResolver,
  ],
})
export class RestaurantsModule {}
