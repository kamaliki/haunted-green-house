import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Greenhouse } from './greenhouse.entity';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'greenhouse_id', type: 'uuid' })
  greenhouseId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'order_index', type: 'integer' })
  orderIndex: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Greenhouse, (greenhouse) => greenhouse.zones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'greenhouse_id' })
  greenhouse: Greenhouse;
}
