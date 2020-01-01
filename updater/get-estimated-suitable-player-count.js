export default function(layer, layerInfo){
    switch(layerInfo.gamemode){
        case 'Skirmish':
            return skirmish(layer, layerInfo);
        case 'AAS':
        case 'RAAS':
            return aas(layer, layerInfo);
        case 'Invasion':
            return invasion(layer, layerInfo);
        case 'Destruction':
            return destruction(layer, layerInfo);
        case 'Insurgency':
            return insurgency(layer, layerInfo);
        case 'Training':
            return training(layer, layerInfo);
    }
}

function skirmish(layer, layerInfo){
    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { mix: 0, max: 40}
    }
}

function aas(layer, layerInfo){
    let min = 0;
    let max = 80;

    // maps with no commander tend to be small
    if(!layerInfo.commander) min = 36;

    // maps with tanks and helicopters tend to be very large
    else if(layerInfo.tanks !== 'N/A' && layerInfo.helicopters !== 'N/A') min = 54;

    // maps with helicopters or tanks tend to be quite large
    else if(layerInfo.helicopters !== 'N/A' || layerInfo.tanks !== 'N/A') min = 45;

    // guess based on map size
    else if(layerInfo.mapSize) min = getAASCountBySize(layerInfo.mapSize);

    // other maps tend to be of medium size
    else min = 40;

    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { min, max }
    }

}

function getAASCountBySize(size){
    const area = getArea(size);
    if(area <= 4) return 36;
    if(area <= 9) return 45;
    else return 54;
}

function invasion(layer, layerInfo){
    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function destruction(layer, layerInfo){
    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function insurgency(layer, layerInfo){
    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function training(layer, layerInfo){
    return {
        ...layerInfo,
        estimatedSuitablePlayerCount: { min: 0, max: 80 }
    }
}

function getArea(size){
    const [h, w] = size.replace('km', '').split('x');
    return h * w;
}