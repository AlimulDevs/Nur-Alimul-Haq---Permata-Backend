import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Author } from '@/authors/entities/author.entity';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  title: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ unique: true, length: 20 })
  isbn: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'published_date', type: 'date', nullable: true })
  publishedDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Author, (author) => author.books, {
    eager: false,
    onDelete: 'NO ACTION', // MSSQL equivalent of RESTRICT
  })
  @JoinColumn({ name: 'author_id' })
  author: Author;
}
