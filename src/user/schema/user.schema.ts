import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Roles } from '../utils/roles.enum';

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  role: Roles;

  @Prop({ required: true })
  dob: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
