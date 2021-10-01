import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entities';

export type AllowedRoles = keyof typeof UserRole | 'ANY';

export const Role = (roles: AllowedRoles[]) => SetMetadata('roles', roles);
