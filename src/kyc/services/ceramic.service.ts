// src/kyc/services/ceramic.service.ts
import { Injectable } from '@nestjs/common';
import { randomBytes } from '@stablelib/random';

const dynamicImport = new Function(
  'm',
  'return import(/* webpackIgnore: true */ m);',
) as (module: string) => Promise<any>;

@Injectable()
export class CeramicService {
  private ceramic: any;
  private TileDocument: any;
  public ready!: Promise<void>;

  async onModuleInit() {
    this.ready = this.bootstrap();
    await this.ready;
  }

  constructor() {
    this.bootstrap();
  }

  private async bootstrap() {
    const { CeramicClient } = await dynamicImport(
      '@ceramicnetwork/http-client',
    );
    const { TileDocument } = await dynamicImport('@ceramicnetwork/stream-tile');
    const { DID } = await dynamicImport('dids');
    const { Ed25519Provider } = await dynamicImport('key-did-provider-ed25519');
    const { getResolver } = await dynamicImport('key-did-resolver');
    this.TileDocument = TileDocument;
    this.ceramic = new CeramicClient('http://localhost:7007');

    const seed = randomBytes(32);
    const provider = new Ed25519Provider(seed);
    const resolver = { ...getResolver() };
    const did = new DID({ provider, resolver });
    await did.authenticate();
    this.ceramic.did = did;
  }

  async save(content: any) {
    await this.ready;
    const doc = await this.TileDocument.create(this.ceramic, content, {
      controllers: [this.ceramic.did.id],
    });

    return doc.id.toString();
  }

  async load(id: string): Promise<any> {
    await this.ready;
    const doc = await this.TileDocument.load(this.ceramic, id);
    return doc.content;
  }
}
