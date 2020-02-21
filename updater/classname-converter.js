export default function (name, layer = true) {
    name = name
        .replace(/ /g, '_')
        .replace('\'', '')
        .replace('Kokan', 'Kokan_Valley')
        .replace('Manic-5', 'Manic')
        .replace('Training_v', 'v');

    if(layer){
        name = name
            .replace('Fools_Road', 'FoolsRoad');
    }

    return name;
}