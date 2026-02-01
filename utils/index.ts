import { EnumTypes } from './types';

export function enumToArray(
  enumToArray: any,
  enumType: EnumTypes
): Array<string> {
  const enumValues: Array<string> = [];

  for (const value in enumToArray) {
    if (typeof enumToArray[value] === enumType) {
      enumValues.push(enumToArray[value]);
    }
  }
  return enumValues;
}
