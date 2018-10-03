
// Dependencies
import { ObjectId, MongoClient } from 'mongodb';
// tslint:disable-next-line:no-var-requires
const EJSON = require('mongodb-extended-json');
// Local
import config from '@/util/config';

// Load config as constants
const uri = config.db.uri;

// Local functions
const getParameter = (event: any, key: string): string => {
    if (!event.queryStringParameters)
        throw new Error('Missing queryStringParameters');
    if (!event.queryStringParameters[key])
        throw new Error(`Missing query parameter: '${key}'`);

    return event.queryStringParameters[key];
};

export default async (event: any, context: any) => {
    // Init data from parameters
    const body = JSON.parse(event.body);
    const query = EJSON.parse(body.query);
    const coll = body.collection;
    const database = body.db;

    // Connect and query
    const client = await MongoClient.connect(uri);
    const collection = client.db(database).collection(coll);
    const result = await collection.aggregate(query).toArray();
    client.close();

    if (!result || !Array.isArray(result))
        throw new Error('Something is wrong with the db');

    return result;
};
