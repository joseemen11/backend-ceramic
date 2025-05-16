import { Controller, Post, Body } from "@nestjs/common";
import { LitService } from "../services/lit.service";
import { CeramicService } from "../services/ceramic.service";

@Controller("kyc")
export class KycController {
  constructor(
    private readonly lit: LitService,
    private readonly ceramic: CeramicService
  ) {}

  @Post("store")
  async store(@Body("vc") vc: any, @Body("authSig") sig: any) {
    const enc = await this.lit.encrypt(vc, sig);
    const id = await this.ceramic.save(enc);
    return { streamId: id };
  }

  @Post("decrypt")
  async decrypt(@Body("streamId") id: string, @Body("authSig") sig: any) {
    const payload = await this.ceramic.load(id);
    const vc = await this.lit.decrypt(payload, sig);
    return { vc };
  }
}
