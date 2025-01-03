import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetTokenDto {
  @ApiProperty({ description: 'Mint address của token' })
  @IsNotEmpty()
  @IsString()
  address: string;
}

export class GetTokensDto {
  @ApiProperty({ 
    description: 'Danh sách mint address của tokens, phân cách bởi dấu phẩy',
    example: 'address1,address2,address3'
  })
  @IsNotEmpty()
  @Transform(({ value }) => value.split(','))
  @IsArray()
  @ArrayMinSize(1)
  addresses: string[];
} 