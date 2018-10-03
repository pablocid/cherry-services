import { gsCreateWorksheet, gsAppendData } from '@/libs/gs_data/gs_data';

// Local functions
const sheetIdFromUrl = (resourceUrl: string): string => {
    const matches = /\/([\w-_]{15,})\/(.*?gid=(\d+))?/.exec(resourceUrl);

    if (matches) {
        // console.log("Spreadsheet: " + matches[1]);
        // console.log("Sheet: " + matches[3]);
        return matches[1];
    }
    return '';

};

export default async (event: any, context: any) => {

    const body = JSON.parse(event.body);
    const sheetUrl = body.sheeturl;
    const sheetId = sheetIdFromUrl(sheetUrl);
    const range = body.range;
    const values = body.values;

    console.log( sheetUrl, sheetId, range);

    // const values = [[123, 234, 345, 567, 123]];
    try {
        await gsCreateWorksheet(sheetId, range);
    } catch (e) { console.log('already created'); }

    try {
        console.log('escribiendo los datos');
        await gsAppendData(sheetId, range, values);
    } catch (e) {
        return 'Error al ingresar los datos';
    }
    return 'OK';
};
