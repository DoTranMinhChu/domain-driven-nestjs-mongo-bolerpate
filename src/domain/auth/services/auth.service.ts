import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { IAccessToken } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { BadRequestException } from '@shared/exceptions/bad-request.exception';
import { EXCEPTION } from '@shared/exceptions/exception';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  generateToken<TRecord extends object>(
    payload: TRecord,
    expiresIn: string = '1h',
  ): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  /**
   * Decode và verify JWT, trả về payload đã giải mã hoặc ném lỗi nếu invalid
   */
  async decodeToken<TRecord extends object>(token: string): Promise<TRecord> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (err) {
      throw new Error('Invalid or expired JWT');
    }
  }

  async loginWithGoogle(code: string) {
    const clientId = this.configService.get('google.clientId');
    const clientSecret = this.configService.get('google.clientSecret');
    const redirectUri = this.configService.get('google.redirectUri');
    const oauth2Client = new OAuth2Client(clientId);
    // 1. Đổi code lấy token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const { id_token, access_token } = tokenResponse.data;
    if (!id_token) throw new BadRequestException(EXCEPTION.BAD_TOKEN);

    // 2. Xác minh ID token và lấy payload
    const ticket = await oauth2Client.verifyIdToken({
      idToken: id_token,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestException(EXCEPTION.BAD_REQUEST);

    return {
      email: payload.email!,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      sub: payload.sub,
      locale: payload.locale,
      profile: payload.profile,
    };
  }
}
