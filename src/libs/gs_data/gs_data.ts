// import { google } from 'googleapis';
// tslint:disable-next-line:no-var-requires
const { google } = require('googleapis');
import { tokenClient, jwtClient } from '@/libs/jwtClient';
// tslint:disable-next-line:no-var-requires
const gsjson = require('google-spreadsheet-to-json');
const sheets = google.sheets('v4');

export const gsReadData = async (spreadsheetId: string, worksheet: string) => {
    const tokens = await tokenClient;
    return await gsjson({
        spreadsheetId,
        token: tokens.access_token,
        worksheet
    });

};

export const gsWriteData = async (spreadsheetId: string, range: string, values: any) => {

    try {
        console.log('Limpiando la sheet');
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range,
            auth: jwtClient
        });
    } catch (err) {
        console.log('Error en limpiar la sheet', err);
    }
    let response;

    try {
        console.log('Appending to sheet', );
        response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
            auth: jwtClient
        });
        // console.log('response', response);
    } catch (error) {
        console.log('Error appending the sheet', error);
    }

    return response;
};

export const gsAppendData = async (spreadsheetId: string, range: string, values: any) => {
    let response;

    try {
        console.log('Appending to sheet', );
        response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
            auth: jwtClient
        });
        // console.log('response', response);
    } catch (error) {
        console.log('Error appending the sheet', error);
    }

    return response;
};

export const gsCleanWorksheet = (spreadsheetId: string, range: string) => {

    return sheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
        auth: jwtClient
    });

};

export const gsCreateWorksheet = async (spreadsheetId: string, title: string) => {

    const requests: any[] = [];

    requests.push({
        addSheet: {
            properties: {
                title
            }
        }
    });
    const batchUpdateRequest = { requests };
    const result = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: batchUpdateRequest,
        auth: jwtClient
    });

    return result.status;
};
