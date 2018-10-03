import { Schema, Connection, createConnection, Model, Document, ConnectionOptionsBase } from 'mongoose';
import mongoose = require('mongoose');
import config from '@/util/config';

export class MongoConnection {
    public static STRING_CONNECTION: string = config.db.uri;

    public model: Model<Document>;
    public MConnOptions: ConnectionOptionsBase;

    private connect: Connection;

    constructor(name: string, schm: Schema) {

        this.MConnOptions = {};
        // use q promises
        global.Promise = require('q').Promise;
        // use q library for mongoose promise
        mongoose.Promise = global.Promise;
        this.connect = createConnection(MongoConnection.STRING_CONNECTION, { dbName: 'graphql_test' });
        this.model = this.connect.model(name, schm);
    }
}
