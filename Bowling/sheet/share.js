const {google} = require('googleapis');

async function shareSheet(spreadsheetId, emailAddress) {
    const auth = new google.auth.GoogleAuth({
        keyFile: 'credentials.json',
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({version: 'v3', auth});
    await drive.permissions.create({
        resource: {
            type: 'user',
            role: 'writer',
            emailAddress: emailAddress,
        },
        fileId: spreadsheetId,
        fields: 'id',
    });

    console.log('Sheet shared successfully.');
}

const spreadsheetId = '1rbEMm_e6kgJ91JOqMi4j3LIiGQmxD_lnlmvSlJZrGSA'; // Replace with your actual spreadsheet ID
const emailAddress = 'joel.bines115@gmail.com'; // Replace with the email you want to share with

shareSheet(spreadsheetId, emailAddress).catch(console.error);
