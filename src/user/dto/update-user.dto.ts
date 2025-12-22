import { IsEmail, IsString, IsEnum, IsDateString, MinLength, IsOptional } from 'class-validator';
import { Roles } from '../utils/roles.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ankit Kumar', description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @ApiPropertyOptional({ example: 'newemail@omniesolutions.com', description: 'User email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({ 
    example: Roles.ADMIN, 
    enum: Roles,
    description: 'User role in the system' 
  })
  @IsOptional()
  @IsEnum(Roles, { message: 'Role must be one of: superAdmin, admin, client' })
  role?: Roles;

  @ApiPropertyOptional({ example: '1990-09-22', description: 'Date of birth in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date in YYYY-MM-DD format' })
  dob?: string;

  @ApiPropertyOptional({ example: 'NewSecurePassword123!', description: 'New password (min 8 characters)' })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}

export interface UpdateUserPayload extends UpdateUserDto {
  id: string;
}
