import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Platform {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: false, unique: true })
  name: string;
}
