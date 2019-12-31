const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), loadLayers);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

async function loadLayers(auth) {
    const sheets = google.sheets({version: 'v4', auth});

    const layers = {};

    // get vanilla layers
    const vanillaRows = (
        await sheets.spreadsheets.values.get({
            spreadsheetId: '1Ej4vcnOAAGWGRoUlwQSPa8jM9wMaN7pH7lSLf2ery_A',
            range: 'B18 Map Layers!B8:N184',
        })
    ).data.values;

    let currentMapName = null;
    let currentMapSize = null;

    for(let row of vanillaRows){
        if(row.length === 0) continue;

        const [
            map,
            layer,
            lighting,
            info,
            commander,
            flagCount,
            teamOneFaction,
            teamTwoFaction,
            teamOneTickets,
            teamTwoTickets,
            tanks,
            helicopters,
            newForVersion
        ] = row;

        const [gamemode, version] = layer.split(' ');

        if(map !== '' && !map.includes('km')) currentMapName = map;
        if(map !== '' && map.includes('km')) currentMapSize = map;

        layers[`${currentMapName} ${layer}`] = {
            map: currentMapName,
            mapSize: currentMapSize,
            gamemode,
            version,
            lighting,
            info,
            commander: commander === 'Yes',
            flagCount: parseInt(flagCount) || 0,
            teamOne : {
                faction: teamOneFaction,
                tickets: teamOneTickets
            },
            teamTwo: {
                faction: teamTwoFaction,
                tickets: teamTwoTickets
            },
            tanks,
            helicopters,
            newForVersion: !!newForVersion
        };
    }

    // get vanilla layers
    const cafRows = (
        await sheets.spreadsheets.values.get({
            spreadsheetId: '1Ej4vcnOAAGWGRoUlwQSPa8jM9wMaN7pH7lSLf2ery_A',
            range: 'B18 Map Layers!B187:N211',
        })
    ).data.values;

    for(let row of cafRows){
        if(row.length === 0) continue;

        const [
            mapRaw,
            layerRaw,
            lighting,
            info,
            commander,
            flagCount,
            teamOneFaction,
            teamTwoFaction,
            teamOneTickets,
            teamTwoTickets,
            tanks,
            helicopters,
            newForVersion
        ] = row;

        const map = mapRaw
            .replace(' ', '_')
            .replace('Manic-5', 'Manic')
            .replace('Jensen\'s Range', 'Jensens_Range');

        const layer = layerRaw.replace(' ', '_');
        const [gamemode, version] = layerRaw.split(' ');


        layers[`${map}_${layer}`] = {
            map,
            gamemode,
            version,
            lighting,
            info: info || null,
            commander: commander === 'Yes',
            flagCount: parseInt(flagCount) || 0,
            teamOne : {
                faction: teamOneFaction,
                tickets: teamOneTickets
            },
            teamTwo: {
                faction: teamTwoFaction,
                tickets: teamTwoTickets
            },
            tanks,
            helicopters,
            newForVersion: !!newForVersion
        };
    }

    fs.writeFileSync('../layers.json', JSON.stringify(layers, null, 4), 'utf8');
}