import { each, transform } from 'async';

export const jsonToArray = (records: any, callback: any) => {
    const final: any[] = [];

    const userInput = Array.isArray(records) ? records : [records];
    const headers = Array.isArray(records) ? Object.keys(records[0]) : Object.keys(records);
    final.push(headers);

    each(userInput, (eachRecord, recordCallback) => {
        const element = JSON.stringify(eachRecord);
        const arr: any[] = [];
        transform(JSON.parse(element), (obj, val, key, trCallback) => {
            setImmediate(() => {
                arr.push(val);
                trCallback();
            });
        }, (err, result1) => {
            final.push(arr);
            recordCallback();
        });
    }, () => {

        callback(final);
    });
};
