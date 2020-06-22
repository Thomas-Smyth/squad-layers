export default function(layer){
    switch(layer.gamemode){
        case 'Skirmish':
            return skirmish(layer);
        case 'AAS':
        case 'RAAS':
        case 'TC':
            return aas(layer);
        case 'Invasion':
            return invasion(layer);
        case 'Destruction':
            return destruction(layer);
        case 'Insurgency':
            return insurgency(layer);
        case 'Training':
            return training(layer);
        case 'Tanks':
            return tanks(layer);
        default:
            return layer;
    }
}

function skirmish(layer){
    return {
        ...layer,
        estimatedSuitablePlayerCount: { mix: 0, max: 40}
    }
}

function aas(layer){
    let min = 0;
    let max = 80;

    // maps with no commander tend to be small
    if(!layer.commander) min = 36;

    // maps with tanks and helicopters tend to be very large
    else if(layer.tanks !== 'N/A' && layer.helicopters !== 'N/A') min = 54;

    // maps with helicopters or tanks tend to be quite large
    else if(layer.helicopters !== 'N/A' || layer.tanks !== 'N/A') min = 45;

    // guess based on map size
    else if(layer.mapSize) min = getAASCountBySize(layer.mapSize);

    // other maps tend to be of medium size
    else min = 40;

    return {
        ...layer,
        estimatedSuitablePlayerCount: { min, max }
    }

}

function getAASCountBySize(size){
    const area = getArea(size);
    if(area <= 4) return 36;
    if(area <= 9) return 45;
    else return 54;
}

function invasion(layer){
    return {
        ...layer,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function destruction(layer){
    return {
        ...layer,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function tanks(layer) {
    return {
        ...layer,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function insurgency(layer){
    return {
        ...layer,
        estimatedSuitablePlayerCount: { min: 54, max: 80 }
    }
}

function training(layer){
    return {
        ...layer,
        estimatedSuitablePlayerCount: { min: 0, max: 80 }
    }
}

function getArea(size){
    const [h, w] = size.replace('km', '').split('x');
    return h * w;
}