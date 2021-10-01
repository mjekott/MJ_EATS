import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Core } from '../../common/entities/core.entities';
import { User } from './user.entities';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  CLIENT,
  OWNER,
  DELIVERY,
}

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends Core {
  @Column()
  @Field(() => String)
  code: string;

  @Column()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  creteCode(): void {
    this.code = uuidv4();
  }
}
