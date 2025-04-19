const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function base62Encode(num: number): string {
  let str = '';
  while (num > 0) {
    str = chars[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str;
}
