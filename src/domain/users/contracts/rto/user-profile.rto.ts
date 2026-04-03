import { PickType } from '@nestjs/swagger';
import { UserRTO } from '@src/domain/users/contracts/rto/user.rto';

export class UserProfileRTO extends PickType(UserRTO, ['id', 'email', 'username']) {}
