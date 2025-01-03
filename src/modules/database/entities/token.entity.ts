import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('tokens')
export class TokenEntity extends BaseEntity {
  @Column({ name: 'mint_address', unique: true })
  @Index()
  mint_address: string;

  @Column()
  name: string;

  @Column()
  symbol: string;

  @Column({ nullable: true })
  decimals: number;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'jsonb', default: {} })
  data: Record<string, any>;
} 