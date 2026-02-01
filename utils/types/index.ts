export interface TokenData {
  token: string;
  expires_in: number;
}

export interface DataStoredInToken {
  _id: string;
}

export enum EnumTypes {
  String = 'string',
  Number = 'number',
}
