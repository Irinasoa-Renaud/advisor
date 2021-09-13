export function getChunks<T>(array: Array<T>, chunkSize: number): T[][] {
  return [...new Array(Math.ceil(array.length / chunkSize))].map<T[]>((_, i) =>
    array.slice(i * chunkSize, i + chunkSize)
  );
}
