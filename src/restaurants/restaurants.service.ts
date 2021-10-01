import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entities';
import {
  AllCategoriesOutput,
  CategoryInput,
  CatgeoryOutput,
} from './dto/category.inputs';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.input';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOuput,
} from './dto/delete-restaurant.input';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.inputs';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.input';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryResolver } from './restaurants.resolver';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
  ) {}

  async create(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;

      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );

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

  async update(
    owner: User,
    updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<UpdateRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        updateRestaurantInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }
      let category: Category = null;
      if (updateRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          updateRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: updateRestaurantInput.restaurantId,
          ...updateRestaurantInput,
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not update Restaurant',
      };
    }
  }

  async delete(
    owner: User,
    { restaurantid }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOuput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantid);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: true,
          error: "You can't edit a restaurant that you don't own",
        };
      }

      await this.restaurants.delete(restaurantid);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not delete Restaurant',
      };
    }
  }

  async allRestaurants({
    page,
    limit,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurants.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
      });
      return {
        ok: true,
        totalPages: Math.ceil(totalResult / limit),
        results: restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restuarants',
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories: categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  async countRestaurants(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({
    slug,
    page,
    limit,
  }: CategoryInput): Promise<CatgeoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: limit,
        skip: (page - 1) * limit,
      });
      const totalResults = Math.ceil(
        (await this.countRestaurants(category)) / limit,
      );

      return {
        ok: true,
        category,
        restaurants,
        totalPages: totalResults,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cound not load category ',
      };
    }
  }
}
