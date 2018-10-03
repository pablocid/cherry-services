import { Model } from 'mongoose';
import { IRecordModel } from '@/libs/graphql/interface';
import { MongoConnection } from '@/libs/graphql/connection';
import { RecordSchema } from '@/libs/graphql/mongoschema';

export const Records: Model<IRecordModel> = new MongoConnection('records', RecordSchema).model;
