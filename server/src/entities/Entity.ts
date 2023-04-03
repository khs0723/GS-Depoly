import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { instanceToPlain } from "class-transformer";

export default abstract class Entity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  toJSON() {
    return instanceToPlain(this);
  }
}
