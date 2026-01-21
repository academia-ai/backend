import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { hash, compare } from 'bcrypt';
import { UserDto } from 'src/users/dto/user.dto';
import { LoginDto } from 'src/users/dto/login.dto';
import { AuthHelper, TokenService } from 'src/utils/helper';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly tokenService: TokenService,
    private readonly authHelper: AuthHelper,
    private readonly jwtHelper: TokenService,
    private readonly configService: ConfigService,
  ) {}

  /** REGISTER USER **/
  async register(dto: UserDto) {
    try {
      const existingUser = await this.userModel.findOne({ email: dto.email });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await hash(dto.password, 10);

      const user = await this.userModel.create({
        fullName: dto.fullName,
        email: dto.email,
        password: hashedPassword,
      });

      const token = await this.jwtHelper.generateToken(user._id.toString());

      return {
        message: 'User created successfully',
        user,
        token,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  /** LOGIN USER **/
  async login(dto: LoginDto) {
    try {
      const { email, password } = dto;

      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new NotFoundException('Invalid credentials');
      }

      const isMatch = await compare(password, user.password);

      if (!isMatch) {
        throw new BadRequestException('Invalid credentials');
      }
      const token = await this.jwtHelper.generateToken(user._id.toString());

      return {
        message: 'Login successful',
        user,
        token,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof Error)
        throw new InternalServerErrorException(error.message);
      throw new InternalServerErrorException('Failed to login user');
    }
  }

  /** LOGOUT USER **/
  logout() {
    try {
      return {
        message: 'Logout successful',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to logout user');
    }
  }
}
