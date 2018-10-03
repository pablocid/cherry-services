import { gsReadData } from '@/libs/gs_data/gs_data';

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
        return matches[1];
    }
    return '';

};

export default async (event: any, context: any) => {

    const sheetUrl = getParameter(event, 'sheeturl');
    const range = getParameter(event, 'range');
    const sheetId = sheetIdFromUrl(sheetUrl);

    console.log(sheetId, range);

    try {
        console.log('leyendo los datos');
        return await gsReadData(sheetId, range);
    } catch (e) {
        return 'Error al ingresar los datos';
    }
};
