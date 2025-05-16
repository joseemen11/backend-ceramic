import { Injectable, OnModuleInit } from '@nestjs/common';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { encryptString, decryptToString } from '@lit-protocol/encryption';
import { LIT_NETWORK } from '@lit-protocol/constants';
import type { UnifiedAccessControlConditions, Chain } from '@lit-protocol/types';

@Injectable()
export class LitService implements OnModuleInit {
  private lit!: LitNodeClientNodeJs;

  async onModuleInit() {
    this.lit = new LitNodeClientNodeJs({ litNetwork: LIT_NETWORK.DatilTest });
    await this.lit.connect();
  }

 
  private static readonly uacc: UnifiedAccessControlConditions = [
    {
      conditionType: 'evmBasic',
      chain: 'polygon',         
      contractAddress: '',
      standardContractType: '',
      method: 'eth_getBalance',
      parameters: [':userAddress', 'latest'],
      returnValueTest: { comparator: '>=', value: '0' },
    },
  ] as const;

  async encrypt(vc: any, authSig: any) {
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        unifiedAccessControlConditions: LitService.uacc,
        chain: 'polygon',
        dataToEncrypt: JSON.stringify(vc),
        authSig,
      } as any,                              
      this.lit
    );
    return { ciphertext, dataHash: dataToEncryptHash, uacc: LitService.uacc };
  }

  async decrypt(payload: any, authSig: any) {
    const plain = await decryptToString(
      {
        unifiedAccessControlConditions: payload.uacc,
        ciphertext: payload.ciphertext,
        dataToEncryptHash: payload.dataHash,
        chain: 'polygon',
        authSig,
      } as any,
      this.lit
    );
    return JSON.parse(plain);
  }
}
