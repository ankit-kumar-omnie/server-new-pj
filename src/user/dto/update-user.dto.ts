import { IsEmail, IsString } from 'class-validator';
import { Roles } from '../utils/roles.enum';

export class UpdateUserDto {
  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsString()
  role?: Roles;

  @IsString()
  dob?: string;

  @IsString()
  password?: string;
}

export class UpdateUserPayload {
  @IsString()
  id: string;

  payload: UpdateUserDto;
}
