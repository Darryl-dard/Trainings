import { Transform } from 'class-transformer';
import { normalizeEmail, trimString } from '../../common/transforms';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMemberDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email!: string;
}
