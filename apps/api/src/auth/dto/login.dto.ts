import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { LoginDto as ILoginDto } from '@typingtyphon/contracts';

export class LoginDto implements ILoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  @IsNotEmpty({ message: 'Email address is required.' })
  email!: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MaxLength(100, { message: 'Password cannot exceed 100 characters.' })
  password!: string;
}
