import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGithubIssueDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}
