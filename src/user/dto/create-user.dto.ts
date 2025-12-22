import { IsEmail, IsString } from 'class-validator';
import { Roles } from '../utils/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ankit' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ankit@omniesolutions.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'superAdmin' })
  @IsString()
  role: Roles;

  @ApiProperty({ example: '09/22/2001' })
  @IsString()
  dob: string;

  @ApiProperty({ example: 'Ankit@123' })
  @IsString()
  password: string;
}
