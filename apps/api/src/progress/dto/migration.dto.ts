import { ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  GuestSessionMigrationDto as IGuestSessionMigrationDto,
  GuestSessionMigrationItem as IGuestSessionMigrationItem,
} from '@typingtyphon/contracts';

export class GuestSessionMigrationItemDto implements IGuestSessionMigrationItem {
  @IsString()
  @IsNotEmpty()
  localId!: string;

  @IsString()
  sessionType!: 'speed_test' | 'lesson' | 'practice' | 'contest';

  @IsNumber()
  durationSeconds!: number;

  @IsNumber()
  netWpm!: number;

  @IsNumber()
  grossWpm!: number;

  @IsNumber()
  accuracyPct!: number;

  @IsNumber()
  totalKeystrokes!: number;

  @IsNumber()
  correctKeystrokes!: number;

  @IsNumber()
  errorCount!: number;

  @IsString()
  mode!: any;

  @IsOptional()
  @IsString()
  textSeed?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(600)
  timeSeries?: any[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(150)
  perKeyStats?: any[];

  @IsString()
  clientTimestamp!: string;

  @IsBoolean()
  isMigrated!: boolean;

  @IsString()
  @IsNotEmpty()
  dedupHash!: string;
}

export class GuestSessionMigrationDto implements IGuestSessionMigrationDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => GuestSessionMigrationItemDto)
  guestSessions!: GuestSessionMigrationItemDto[];
}

