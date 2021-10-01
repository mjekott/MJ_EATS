import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entities';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  async create(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace('/ /g', '-');
      let category = await this.categories.findOne({ slug: categorySlug });
      if (!category) {
        category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      }
      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create restaurant',
      };
    }
  }

  findAll() {
    return `This action returns all restaurants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} restaurant`;
  }

  update(id: number, updateRestaurantInput: UpdateRestaurantInput) {
    return `This action updates a #${id} restaurant`;
  }

  remove(id: number) {
    return `This action removes a #${id} restaurant`;
  }
}
