import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SubmitFeedbackDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  feedback!: string;

  @IsString()
  @IsOptional()
  breadcrumbs?: string;

  @IsOptional()
  userId?: string | number;
}
