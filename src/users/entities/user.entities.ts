import { Core } from 'src/common/entities/core.entities';
import { Column, Entity } from 'typeorm';
export enum UserRole {
  CLIENT = 'client',
  OWNER = 'owner',
  DELIVERY = 'devliery',
}

@Entity('users')
export class User extends Core {
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
}
