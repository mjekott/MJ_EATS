import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { boolean } from 'joi';
import { Raw, Repository } from 'typeorm';
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
import {
  CreateDishInput,
  CreateDishOutput,
  DeleteDishInput,
  DeleteDishOuput,
  UpdateDishInput,
  UpdateDishOuput,
} from './dto/dishes.dtos';
import {
  RestaurantInput,
  RestaurantOutput,
  RestaurantsInput,
  RestaurantsOutput,
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/restaurant.inputs';
import {
  UpdateRestaurantInput,
  UpdateRestaurantOutput,
} from './dto/update-restaurant.input';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish) private readonly dishes: Repository<Dish>,
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
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurants.findAndCount({
        take: limit,
        skip: (page - 1) * limit,
        order: {
          isPromoted: 'DESC',
        },
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

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        relations: ['menu'],
      });
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Cound not laod restaurants',
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
    limit,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResult] = await this.restaurants.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${query}%'`),
        },
        take: limit,
        skip: (page - 1) * limit,
      });
      return {
        ok: true,
        totalPages: Math.ceil(totalResult / limit),
        restaurants,
      };
    } catch {
      {
        ok: false;
        error: 'Could not search for restaurants';
      }
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
        order: {
          isPromoted: 'DESC',
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

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
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
          error: 'You can not perform this operation',
        };
      }
      const dish = await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create Dish',
      };
    }
  }

  async updateDish(
    owner: User,
    updateDishInput: UpdateDishInput,
  ): Promise<UpdateDishOuput> {
    try {
      const dish = await this.dishes.findOne(updateDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }

      await this.dishes.save({
        id: updateDishInput.dishId,
        ...updateDishInput,
      });
    } catch {
      return {
        ok: false,
        error: 'Cound not Update Dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOuput> {
    try {
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      this.allowedToPerformTask(dish.restaurant.ownerId, owner.id);

      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Cound not Delete Dish',
      };
    }
  }

  allowedToPerformTask(
    resourceOwnerId: number,
    ownerId: number,
  ): { ok: boolean; error: string } {
    if (resourceOwnerId !== ownerId) {
      return {
        ok: false,
        error: 'Not Authorized to Perform Operation',
      };
    }
  }
}
