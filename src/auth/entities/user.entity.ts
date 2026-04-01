import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Favorite } from 'src/favorites/entities/favorite.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  fullName: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { select: false })
  password: string;

  @Column('text', { unique: true })
  nickname: string;

  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @Column('text', { nullable: true })
  birthdate: string;

  @Column('text', {
    nullable: true,
    default: 'https://c.psprices.com/400/01a5be07a4119cc35580bbfc2fe17ab9.webp',
  })
  imgProfile: string;

  @Column('text', { nullable: true })
  address: string;

  @Column('text', { nullable: true })
  city: string;

  @Column('text', { nullable: true })
  state: string;

  @Column('int', { nullable: true })
  zip: number;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
    this.password = bcrypt.hashSync(this.password, 10);
  }
}
