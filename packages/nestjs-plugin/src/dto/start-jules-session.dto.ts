import { IsString, IsNotEmpty } from 'class-validator';

export class StartJulesSessionDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  developerPrompt!: string;
}
