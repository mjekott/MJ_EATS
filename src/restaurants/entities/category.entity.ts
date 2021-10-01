import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { Column, Entity, OneToMany } from 'typeorm';
import { Core } from '../../common/entities/core.entities';
import { Restaurant } from './restaurant.entity';

@InputType('CategoryInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Category extends Core {
  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => String)
  @Column()
  @IsString()
  coverImage: string;

  @Field(() => [Restaurant])
  @OneToMany(() => Restaurant, (restaurant) => restaurant.category)
  restaurants: Restaurant[];
}
