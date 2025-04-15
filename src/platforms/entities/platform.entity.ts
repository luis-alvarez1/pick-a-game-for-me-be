import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Game } from 'src/games/entities/game.entity';

@Entity()
export class Platform {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: false, unique: true })
  name: string;

  @OneToMany(() => Game, (game) => game.platform)
  games: Game[];
}
