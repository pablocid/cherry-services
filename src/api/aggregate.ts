import { MongoClient } from 'mongodb';
// tslint:disable-next-line:no-var-requires
const EJSON = require('mongodb-extended-json');
// tslint:disable-next-line:no-var-requires
const jsonexport = require('jsonexport');
import config from '@/util/config';
import { jsonToArray } from '@/libs/jsonToArray/jsonToArray';
import { gsCreateWorksheet, gsWriteData } from '@/libs/gs_data/gs_data';

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

const sheetIdFromUrl = (resourceUrl: string): string => {
    const matches = /\/([\w-_]{15,})\/(.*?gid=(\d+))?/.exec(resourceUrl);

    if (matches) {
        // console.log("Spreadsheet: " + matches[1]);
        // console.log("Sheet: " + matches[3]);
        return matches[1];
    }
    return '';

};

const toCSV = (data: any) => {
    return new Promise((res, rej) => {
        jsonexport(data, (err: any, csv: any) => {
            if (err) {
                rej(err);
                return;
            }
            res(csv);
        });
    });
};

const toArray = (data: any) => {
    return new Promise((res, rej) => {

        jsonToArray(data, (result: any) => {
            res(result);
        });
    });
};
export default async (event: any, context: any) => {
    context.callbackWaitsForEmptyEventLoop = false;
    // console.log('event', event);
    // console.log('context', context);
    const body = JSON.parse(event.body);
    const query = EJSON.parse(body.query);
    const database = body.db;
    const sheetUrl = body.sheeturl;
    const sheetId = sheetIdFromUrl(sheetUrl);
    const range = body.range;

    console.log(database, sheetUrl, sheetId, range);

    // Connect and query
    const client = await MongoClient.connect(uri, { useNewUrlParser: true });
    const collection = client.db(database).collection('records');
    const result = await collection.aggregate(query).toArray();
    if (!result || !Array.isArray(result))
        throw new Error('Something is wrong with the db');

    client.close();
    const jta = await toArray(result);
    try {
        await gsCreateWorksheet(sheetId, range);
    } catch (e) { console.log('already created'); }

    try {
        console.log('escribiendo los datos');
        await gsWriteData(sheetId, range, jta);
    } catch (e) {
        return 'Error al ingresar los datos';
    }
    return 'OK';
};

// "{\"query\":\"[{\\\"$match\\\":{\\\"schm\\\":{\\\"$oid\\\":\\\"57a4e152c830e2bdff1a160a\\\"}}},{\\\"$project\\\":{\\\"code_base\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"cod_base\\\"]}}},0]}},\\\"in\\\":\\\"$$a.number\\\"}},\\\"fecha_cruzamiento\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"fecha_cruzamiento\\\"]}}},0]}},\\\"in\\\":\\\"$$a.number\\\"}},\\\"madre\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"madre\\\"]}}},0]}},\\\"in\\\":\\\"$$a.reference\\\"}},\\\"padre\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"padre\\\"]}}},0]}},\\\"in\\\":\\\"$$a.reference\\\"}}}},{\\\"$lookup\\\":{\\\"from\\\":\\\"records\\\",\\\"localField\\\":\\\"madre\\\",\\\"foreignField\\\":\\\"_id\\\",\\\"as\\\":\\\"madre\\\"}},{\\\"$lookup\\\":{\\\"from\\\":\\\"records\\\",\\\"localField\\\":\\\"padre\\\",\\\"foreignField\\\":\\\"_id\\\",\\\"as\\\":\\\"padre\\\"}},{\\\"$project\\\":{\\\"code_base\\\":1,\\\"fecha_cruzamiento\\\":1,\\\"madre\\\":{\\\"$arrayElemAt\\\":[\\\"$madre\\\",0]},\\\"padre\\\":{\\\"$arrayElemAt\\\":[\\\"$padre\\\",0]}}},{\\\"$project\\\":{\\\"code_base\\\":1,\\\"fecha_cruzamiento\\\":1,\\\"madre\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$madre.attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"nombre\\\"]}}},0]}},\\\"in\\\":\\\"$$a.string\\\"}},\\\"padre\\\":{\\\"$let\\\":{\\\"vars\\\":{\\\"a\\\":{\\\"$arrayElemAt\\\":[{\\\"$filter\\\":{\\\"input\\\":\\\"$padre.attributes\\\",\\\"as\\\":\\\"attr\\\",\\\"cond\\\":{\\\"$eq\\\":[\\\"$$attr.id\\\",\\\"nombre\\\"]}}},0]}},\\\"in\\\":\\\"$$a.string\\\"}}}},{\\\"$limit\\\":10}]\",\"db\":\"heroku_240bqtmh\",\"sheeturl\":\"https:\/\/docs.google.com\/spreadsheets\/d\/14F5QbwlN_2p36GlQICZKKKpUzfdNnhwalwmjrhSAV28\/edit#gid=2104752735\",\"range\":\"Sheet6\"}"
// const body = JSON.parse(event.body);
// const query = EJSON.parse(body.query);
