import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserInput } from '@src/domain/users/contracts/inputs/create-user.input';
import { GetOneUserByIdParams } from '@src/domain/users/contracts/params/get-one-user-by-id.params';
import { GetUserProfileParams } from '@src/domain/users/contracts/params/get-user-profile.params';
import { UserProfileRTO } from '@src/domain/users/contracts/rto/user-profile.rto';
import { UserEntity } from '@src/domain/users/entities/user.entity';
import { UserError } from '@src/domain/users/enums/user-error.enum';
import { UserRepository } from '@src/domain/users/repositories/user.repository';
import { PasswordHashingService } from '@src/domain/users/services/password-hashing.service';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordHashingService: PasswordHashingService,
  ) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    const { email, username, password } = input;

    const [emailTaken, usernameTaken] = await Promise.all([
      this.repository.existsByEmail(email),
      this.repository.existsByUsername(username),
    ]);

    if (emailTaken) {
      throw new BadRequestException(UserError.EMAIL_ALREADY_TAKEN);
    }
    if (usernameTaken) {
      throw new BadRequestException(UserError.USERNAME_ALREADY_TAKEN);
    }

    const hashedPassword = await this.passwordHashingService.hash(password);

    const user = this.repository.create({
      email,
      username,
      password: hashedPassword,
    });

    return this.repository.save(user);
  }

  async getOneById(params: GetOneUserByIdParams): Promise<UserEntity> {
    const { id } = params;

    return this.repository.getOneById(id);
  }

  async getProfile(dto: GetUserProfileParams): Promise<UserProfileRTO> {
    const { id } = dto;

    const user = await this.repository.getOneById(id);

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }
}
