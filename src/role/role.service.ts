import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { UserRoles } from '../utils/types';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getRoles() {
    try {
      const roles = await this.roleRepository.find();

      if (!roles) throw new NotFoundException('Role not found.');

      return {
        success: true,
        message: 'Roles fetched successfully',
        data: roles,
      };
    } catch (error) {
      throw error;
    }
  }

  async getRoleById(id: string) {
    try {
      const role = await this.roleRepository.findOneBy({ id });

      if (!role) throw new NotFoundException('Role not found.');

      return {
        success: true,
        message: 'Role fetched successfully',
        data: role,
      };
    } catch (error) {
      throw error;
    }
  }

  async getRoleByPermission(permission: UserRoles) {
    try {
      const role = await this.roleRepository.findOneBy({ permission });

      if (!role) return null;

      return {
        success: true,
        message: 'Role fetched successfully',
        data: role,
      };
    } catch (error) {
      throw error;
    }
  }
}
