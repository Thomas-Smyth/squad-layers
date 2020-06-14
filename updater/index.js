import fs from 'fs';

import getSheets from './google-sheets.js';
import getEstimatedSuitablePlayerCount from './get-estimated-suitable-player-count.js';
import classnameConverter from './classname-converter.js';

const spreadsheetId = '194eZBaJGI-AAx5WzHLoLQDyTt7HiIGKzGkrC4Hx9EnU';
const spreadsheetName = 'B19 Map Layers!';
const vanillaRange = `${spreadsheetName}B8:N183`;
const cafRange = `${spreadsheetName}B186:N214`;

async function main(){
    const layers = (await getLayers()).map(layer => getEstimatedSuitablePlayerCount(layer));

    fs.writeFileSync('../layers.json', JSON.stringify(layers, null, 4), 'utf8');
}

async function getLayers(){
    const sheets = await getSheets();

    let layers = [];
    layers = layers.concat(await getVanillaLayers(sheets));
    layers = layers.concat(await getCAFLayers(sheets));

    return layers;
}

async function getVanillaLayers(sheets){
    let layers = [];

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
            .replace('Logar', 'Logar Valley');

        if(map !== '' && !map.includes('km')) {
            currentMapName = map;
            currentMapSize = rows[i+1][0];
        }
        const layer = `${currentMapName} ${layerRaw}`;
        const [gamemode, version] = layerRaw.split(' ');

        layers.push({
            layer: layer,
            map: currentMapName,
            layerClassname: classnameConverter(layer),
            mapSize: currentMapSize,
            gamemode,
            version,
            lighting,
            info: info === '--' ? null : info,
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
        });
    }

    return layers;
}

async function getCAFLayers(sheets){
    let layers = [];

    const cafRows = (
        await sheets.spreadsheets.values.get({ spreadsheetId, range: cafRange })
    ).data.values;

    for(let row of cafRows){
        if(row.length === 0) continue;

        let [
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

        const layer = classnameConverter(`${mapRaw} ${layerRaw}`);
        const [gamemode, version] = layerRaw.split(' ');

        layers.push({
            layer: layer.replace('Manic', 'Manic-5'),
            map: mapRaw,
            layerClassname: layer,
            gamemode,
            version,
            dlc: 'CAF',
            lighting,
            info: info === '--' ? null : info,
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
        });
    }

    return layers;
}

main().then(() => { console.log('Main finished.'); }).catch((err) => { console.log(`Main throw an error: ${err}`); });