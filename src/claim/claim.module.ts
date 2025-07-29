import { Global, Module } from '@nestjs/common';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from './entities/claim.entity';
import { ClaimRepository } from './repositories/claim.repository';
import { ProviderClaimRepository } from './repositories/provider-claim.repository';
import { ProviderClaim } from './entities/provider-claim.entity';
import { Note } from './entities/note.entity';
import { NoteRepository } from './repositories/note.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Claim, ProviderClaim, Note])],
  providers: [
    ClaimService,
    ClaimRepository,
    ProviderClaimRepository,
    NoteRepository,
  ],
  controllers: [ClaimController],
  exports: [
    ClaimService,
    ClaimRepository,
    ProviderClaimRepository,
    NoteRepository,
  ],
})
export class ClaimModule {}
