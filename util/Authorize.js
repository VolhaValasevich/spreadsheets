const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const logger = require('./logger').logger;
const path = require('path');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * Authorizes a user for Google Spreadsheets.
 * 
 * @param {Object} creds - User credentials.
 * 
 * @returns {Promise} An authorized OAuth2 client.
 */
function authorize(creds) {
    const { client_secret, client_id, redirect_uris } = creds.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const credentials = JSON.parse(JSON.stringify(creds))   //create a copy to modify
    credentials.token_path.unshift(__dirname, '..');
    const tokenPath = path.join(...credentials.token_path);
    if (fs.existsSync(tokenPath)) {
        const token = fs.readFileSync(tokenPath);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        return getNewToken(oAuth2Client, tokenPath);
    }
}

/**
 * Gets a new access token and authorizes a user for Google Spreadsheets.
 * 
 * @param {oAuth2Client} oAuth2Client - Google OAuth2 client.
 * @param {string} tokenPath - Path where the new user token will be stored. 
 * 
 * @returns {Promise} An authorized OAuth2 client.
 */
function getNewToken(oAuth2Client, tokenPath) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    return new Promise((resolve, reject) => {
        logger.info(`Authorize this app by visiting this url: ${authUrl}`);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) reject(err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFileSync(tokenPath, JSON.stringify(token));
                logger.info(`Token stored to [${tokenPath}]`);
                resolve(oAuth2Client);
            });
        });
    })
}

module.exports = authorize;