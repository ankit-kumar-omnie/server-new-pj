import { IsEmail, IsString, IsEnum, IsDateString, MinLength } from 'class-validator';
import { Roles } from '../utils/roles.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Ankit', description: 'User full name' })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name: string;

  @ApiProperty({ example: 'ankit@omniesolutions.com', description: 'User email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ 
    example: Roles.CLIENT, 
    enum: Roles,
    description: 'User role in the system' 
  })
  @IsEnum(Roles, { message: 'Role must be one of: superAdmin, admin, client' })
  role: Roles;

  @ApiProperty({ example: '1990-09-22', description: 'Date of birth in YYYY-MM-DD format' })
  @IsDateString({}, { message: 'Date of birth must be a valid date in YYYY-MM-DD format' })
  dob: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'User password (min 8 characters)' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}
