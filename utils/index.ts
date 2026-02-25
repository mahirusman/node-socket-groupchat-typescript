import { EnumTypes } from './types';

export function enumToArray(enumObject: any, enumType: EnumTypes): string[] {
  const enumValues: string[] = [];

  for (const value in enumObject) {
    if (typeof enumObject[value] === enumType) {
      enumValues.push(enumObject[value]);
    }
  }

  return enumValues;
}
