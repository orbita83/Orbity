// O Skia web pede o AssetRegistry do React Native para carregar imagens por require().
// O planeta procedural não usa imagens, e o react-native-web não tem esse módulo.
export function getAssetByID(): undefined {
  return undefined;
}
