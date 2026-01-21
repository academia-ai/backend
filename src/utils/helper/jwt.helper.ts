import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Global()
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(userId: string) {
    const accessToken = await this.jwt.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('ACCESS_JWT_SEC') || 'Secret',
        expiresIn: '30m',
      },
    );

    const refreshToken = await this.jwt.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('REFRESH_JWT_SEC') || 'Secret',
        expiresIn: '7d',
      },
    );

    // Set cookies
    // res.cookie('accessToken', accessToken, {
    //   httpOnly: true,
    //   sameSite: 'strict',
    //   maxAge: 15 * 60 * 1000,
    // });

    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true,
    //   sameSite: 'strict',
    //   secure: process.env.NODE_ENV === 'production',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return { accessToken, refreshToken };
  }
}

// import {
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { User, UserDocument } from 'src/users/schemas/user.schema';
// import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class TokenService {
//   constructor(
//     @InjectModel(User.name)
//     private readonly userModel: Model<UserDocument>,
//     private readonly jwt: JwtService,
//     private readonly configService: ConfigService,
//   ) {}

//   private parseExpiry(expiry: string): number {
//     const unit = expiry.slice(-1);
//     const value = parseInt(expiry.slice(0, -1));

//     switch (unit) {
//       case 'm':
//         return value * 60 * 1000;
//       case 'h':
//         return value * 60 * 60 * 1000;
//       case 'd':
//         return value * 24 * 60 * 60 * 1000;
//       default:
//         return 7 * 24 * 60 * 60 * 1000;
//     }
//   }

//   async generateTokens(userId: string, isRefresh = false) {
//     try {
//       const user = await this.userModel.findById({ _id: userId });
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const payload = {
//         sub: { userId },
//         tokenVersion: user.tokenVersion,
//       };

//       const accessTokenExpiry =
//         this.configService.get<string>('ACESS_TOKEN_EXPIRY') || '15m';
//       const refreshTokenExpiryToStr =
//         this.configService.get<string>('REFRESH_TOKEN_EXPIRY') || '7d';
//       const accessToken = await this.jwt.signAsync(payload, {
//         secret: this.configService.get<string>('JWT_ACCESS_TOKEN'),
//         expiresIn: this.parseExpiry(accessTokenExpiry),
//       });

//       if (isRefresh) {
//         const refreshedToken = await this.jwt.signAsync(payload, {
//           secret: this.configService.get<string>('JWT_REFRESH_TOKEN'),
//           expiresIn: this.parseExpiry(refreshTokenExpiryToStr),
//         });
//         return { accessToken, refreshedToken };
//       }

//       return { accessToken };
//     } catch (error: unknown) {
//       console.error('Error generqating token', error);
//       if (error instanceof Error) {
//         throw new InternalServerErrorException(error.message);
//       }
//       throw new InternalServerErrorException();
//     }
//   }
// }
