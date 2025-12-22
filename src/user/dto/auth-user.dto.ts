import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'ankit@omniesolutions.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ankit@123' })
  @IsString()
  password: string;
}
