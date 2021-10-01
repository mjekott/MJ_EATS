import { InternalServerErrorException } from '@nestjs/common';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsString, Length, min } from 'class-validator';
import { Core } from 'src/common/entities/core.entities';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
export enum UserRole {
  CLIENT,
  OWNER,
  DELIVERY,
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType({ isAbstract: true })
@ObjectType()
@Entity('users')
export class User extends Core {
  @Column({ unique: true })
  @Field(() => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field(() => String)
  @IsString()
  @Length(5)
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @Column({ default: false })
  @Field(() => Boolean)
  verified: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hash(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(givenPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(givenPassword, this.password);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
