import { google } from 'googleapis';
import config from '@/util/config';

const scope = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/calendar'];

export const jwtClient = new google.auth.JWT(config.privatekey.client_email, undefined, config.privatekey.private_key, scope);

export const tokenClient: any = new Promise((res, rej) => {
    jwtClient.authorize( (err, tokens) => {
        if (err) {
            rej(err);
            return;
        }
        res(tokens);
    });
});
