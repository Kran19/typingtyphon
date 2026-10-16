import { ArrayMaxSize, IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { CreateSessionDto as ICreateSessionDto, TestMode } from '@typingtyphon/contracts';

export class CreateSessionDto implements ICreateSessionDto {
  @IsString()
  @IsIn(['speed_test', 'lesson', 'practice', 'contest'])
  sessionType!: 'speed_test' | 'lesson' | 'practice' | 'contest';

  @IsInt()
  @Min(1)
  @Max(600)
  durationSeconds!: number;

  @IsNumber()
  @Min(0)
  @Max(350, { message: 'Implausible speed metric: netWpm exceeds realistic mechanical threshold.' })
  netWpm!: number;

  @IsNumber()
  @Min(0)
  @Max(400)
  grossWpm!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  accuracyPct!: number;

  @IsInt()
  @Min(0)
  totalKeystrokes!: number;

  @IsInt()
  @Min(0)
  correctKeystrokes!: number;

  @IsInt()
  @Min(0)
  errorCount!: number;

  @IsString()
  @IsIn(['words', 'time', 'quote', 'zen', 'custom', 'sentences', 'curriculum-intro', 'curriculum-word', 'curriculum-remedial'])
  mode!: TestMode;

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
}

