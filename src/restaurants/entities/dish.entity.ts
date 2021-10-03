import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsCurrency,
  IsNumber,
  isString,
  IsString,
  Length,
} from 'class-validator';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Core } from '../../common/entities/core.entities';
import { Restaurant } from './restaurant.entity';

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
class DishChoice {
  @Field(() => String)
  name: string;
  @Field(() => Number, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => [String], { nullable: true })
  @IsString()
  choices?: DishChoice[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  extra?: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends Core {
  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Number)
  @Column()
  @IsNumber()
  price: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field(() => String)
  @IsString()
  @Length(5, 150)
  description: string;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;

  @Field(() => Restaurant)
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @Field(() => [DishOption], { nullable: true })
  @Column({ type: 'json' })
  options?: DishOption[];
}
