export const sleep = (time: number = 1) =>
  new Promise<void>(resolve => setTimeout(resolve, time * 1000))

export const getAbbreviation = (title: string): string => {
  return title
    .match(/[\p{Alpha}\p{Nd}]+/gu)!
    .reduce(
      (previous, next) =>
        previous +
        (+next === 0 || parseInt(next) ? parseInt(next) : next[0] || ''),
      ''
    )
    .toUpperCase()
}
