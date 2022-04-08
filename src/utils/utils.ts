export const sleep = (time: number = 1) =>
  new Promise<void>(resolve => setTimeout(resolve, time * 1000))
