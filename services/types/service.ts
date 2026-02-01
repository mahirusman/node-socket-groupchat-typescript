export interface Update {
  status: boolean;
  id?: string;
  errors?: string[];
  messages?: Array<string>;
}
export interface Retrieve {
  status: boolean;
  errors?: Array<string>;
  data?: { [key: string]: string };
}

export interface Criteria {
  [key: string]: string | number | boolean;
}

export enum MongoErrorCodeNames {
  DuplicateKey = 'DuplicateKey',
}

export interface DeleteResponse {
  ok?: number | undefined;
  n?:
    | number
    | (undefined & {
        deletedCount?: number | undefined;
      });
}
