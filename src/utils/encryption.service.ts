import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { config } from '../config';

@Injectable()
export class EncryptionService {
  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hash(plain: string): Promise<string> {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plain, salt);
  }

  generateToken(payload: any): string {
    return sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
    });
  }

  verifyToken(token: string) {
    const jwt = verify(token, config.jwt.publicKey, {
      complete: true,
      issuer: config.jwt.issuer,
    });
    return jwt.payload;
  }
}
