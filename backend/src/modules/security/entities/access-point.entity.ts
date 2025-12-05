import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('access_points')
export class AccessPoint {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['door', 'window'],
  })
  type: 'door' | 'window';

  @Column({ length: 255 })
  location: string;

  @Column({
    type: 'enum',
    enum: ['open', 'closed', 'locked', 'unlocked'],
    default: 'closed',
  })
  status: 'open' | 'closed' | 'locked' | 'unlocked';

  @Column({ name: 'monitoring_enabled', default: true })
  monitoringEnabled: boolean;

  @Column({ name: 'alert_threshold', type: 'int', default: 300 })
  alertThreshold: number; // seconds

  @Column({ name: 'last_status_change', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastStatusChange: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
