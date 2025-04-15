import { Platform } from 'src/platforms/entities/platform.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: false })
  name: string;

  @Column('boolean', { nullable: false, default: false })
  completed: boolean;

  @Column('boolean', { nullable: false, default: true })
  isActive: boolean;

  @ManyToOne(() => Platform, (platform) => platform.id, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  platform: Platform;
}
