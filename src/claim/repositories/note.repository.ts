import { DataSource } from 'typeorm';
import { TypeOrmRepository } from 'src/config/repository/typeorm.repository';
import { Note } from '../entities/note.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class NoteRepository extends TypeOrmRepository<Note> {
  constructor(private readonly dataSource: DataSource) {
    super(Note, dataSource.createEntityManager());
  }
}
