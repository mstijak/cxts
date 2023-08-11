export function quoteStr(str: string): string {
   if (str == null) return str;
   return JSON.stringify(str);
}
