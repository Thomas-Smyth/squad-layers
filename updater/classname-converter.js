export default function (name) {
    return name
      .replace(/ /g, '_')
      .replace('\'', '')
      .replace('Al_Basrah', 'Albasrah')
      .replace('Kokan', 'Kokan_Valley')
      .replace('Logar_Valley', 'LogarValley')
      .replace('Manic-5', 'Manic')
      .replace('Training_v', 'v');
}