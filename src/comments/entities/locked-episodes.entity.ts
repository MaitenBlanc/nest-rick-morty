import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('locked_episodes')
export class LockedEpisodes {
  @PrimaryColumn()
  episodeId: number;

  @Column({ default: true })
  isLocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
