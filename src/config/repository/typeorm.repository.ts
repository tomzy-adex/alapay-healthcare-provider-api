import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import {
  ObjectLiteral,
  Repository,
  EntityTarget,
  EntityManager,
  FindManyOptions,
} from 'typeorm';

export class TypeOrmRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  constructor(
    private readonly entityTarget: EntityTarget<Entity>,
    private readonly entityManager: EntityManager,
  ) {
    super(entityTarget, entityManager);
  }

  findMany(
    options: IPaginationOptions,
    findOptions?: FindManyOptions<Entity>,
  ): Promise<Pagination<Entity>> {
    return paginate<Entity>(this, options, findOptions);
  }
}
