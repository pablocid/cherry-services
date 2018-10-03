// tslint:disable-next-line:no-var-requires
const gsjson = require('google-spreadsheet-to-json');

// Local
import { tokenClient } from '@/libs/jwtClient';

const spreadsheetId = '14F5QbwlN_2p36GlQICZKKKpUzfdNnhwalwmjrhSAV28';

export default async (event: any, context: any) => {

    const token = await tokenClient;

    const sheet = gsjson({
        spreadsheetId: spreadsheetId,
        token: token ? token.access_token : '',
       // worksheet: ['Sheet6']
    });

    return await sheet;
};
