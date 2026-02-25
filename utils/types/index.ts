export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface DataStoredInToken {
  userId: string;
}

export enum EnumTypes {
  String = 'string',
  Number = 'number',
}
