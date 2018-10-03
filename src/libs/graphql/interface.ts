import { Document } from 'mongoose';

// tslint:disable-next-line:interface-name
export interface Record {
  _id: string;
  schm: string;
  created: Date;
  attributes: [Attribute];
}

// tslint:disable-next-line:interface-name
export interface Attribute {
  id: string;
  string?: string;
  number?: number;
  boolean?: boolean;
  list?: string[];
  listOfObj?: [{}];
  reference?: string;
}

export interface IRecord {
  schm?: string;
  created?: Date;
  attributes?: Attribute[];
}

export interface IRecordModel extends IRecord, Document {
  // custom methods for your model would be defined here
}
