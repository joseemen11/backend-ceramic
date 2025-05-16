import { Module } from '@nestjs/common';
import { KycController } from './controllers/kyc.controller';
import { LitService } from './services/lit.service';
import { CeramicService } from './services/ceramic.service';

@Module({
  controllers: [KycController],
  providers: [LitService, CeramicService],
})
export class KycModule {}
