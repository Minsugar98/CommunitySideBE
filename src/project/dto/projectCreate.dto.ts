import { IsString,IsOptional,IsArray,IsNumber } from 'class-validator';

export class ProjectCreateDto {
  @IsString()
  startDate:string;
  @IsString()
  endDate:string;
  @IsString()
  content:string;
  @IsString()
  summary:string;
  @IsString()
  title:string;
  @IsArray()
  @IsString({each:true})
  position:string[];
  @IsArray()
  @IsString({each:true})
  techStacks:string[];
}