import fs from 'fs';

import getSheets from './google-sheets.js';
import getEstimatedSuitablePlayerCount from './get-estimated-suitable-player-count.js';

const spreadsheetId = '1Ej4vcnOAAGWGRoUlwQSPa8jM9wMaN7pH7lSLf2ery_A';
const spreadsheetName = 'B18 Map Layers!';
const vanillaRange = `${spreadsheetName}B8:N184`;
const cafRange = `${spreadsheetName}B187:N211`;

async function main(){
    const layers = await getLayers();

    Object.keys(layers).forEach(key => { layers[key] = getEstimatedSuitablePlayerCount(key, layers[key] )});

    fs.writeFileSync('../layers.json', JSON.stringify(layers, null, 4), 'utf8');
}

async function getLayers(){
    const sheets = await getSheets();
    return {
        ...await getVanillaLayers(sheets),
        ...await getCAFLayers(sheets)
    }
}

async function getVanillaLayers(sheets){
    let layers = {};

    const rows = (
        await sheets.spreadsheets.values.get({ spreadsheetId, range: vanillaRange })
    ).data.values;

    let currentMapName = null;
    let currentMapSize = null;

    for(let i = 0; i < rows.length; i++){
        const row = rows[i];

        if(row.length === 0) continue;

        const [
            mapRaw,
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

        const map = mapRaw
            .replace('Logar', 'Logar Valley');

        const [gamemode, version] = layer.split(' ');

        if(map !== '' && !map.includes('km')) {
            currentMapName = map;
            currentMapSize = rows[i+1][0];
        }

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

    return layers;
}

async function getCAFLayers(sheets){
    let layers = {};

    const cafRows = (
        await sheets.spreadsheets.values.get({ spreadsheetId, range: cafRange })
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
            .replace(/ /g, '_')
            .replace('Manic-5', 'Manic')
            .replace('Jensen\'s', 'Jensens');

        const layer = layerRaw.replace(' ', '_');
        const [gamemode, version] = layerRaw.split(' ');


        layers[`${map}_${layer}`] = {
            map,
            gamemode,
            version,
            dlc: 'CAF',
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

    return layers;
}

main().then(() => { console.log('Main finished.'); }).catch((err) => { console.log(`Main throw an error: ${err}`); });