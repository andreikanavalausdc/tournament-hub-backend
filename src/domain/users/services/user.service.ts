import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateUserInput } from '@src/domain/users/contracts/inputs/create-user.input';
import type { GetOneUserByIdParams } from '@src/domain/users/contracts/params/get-one-user-by-id.params';
import type { GetUserProfileParams } from '@src/domain/users/contracts/params/get-user-profile.params';
import type { ValidateUserParams } from '@src/domain/users/contracts/params/validate-user.params';
import type { ValidateUserResult } from '@src/domain/users/contracts/results/validate-user.result';
import type { UserProfileRTO } from '@src/domain/users/contracts/rto/user-profile.rto';
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

  async validate(params: ValidateUserParams): Promise<ValidateUserResult> {
    const { email, password } = params;

    const user = await this.repository.findOne({ where: { email }, select: ['id', 'password'] });
    if (!user) {
      throw new BadRequestException(UserError.INCORRECT_CREDENTIALS);
    }

    const passwordMatch = await this.passwordHashingService.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException(UserError.INCORRECT_CREDENTIALS);
    }

    return { id: user.id };
  }
}
