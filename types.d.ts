type RequestBody =
  | {
      [key: string]: boolean | number | string | string[] | number[] | null;
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | any;

type AllowedParameters = Array<string>;

type DecodeUser = {
  _id: Pick<IUserDocument, "_id">;
} | null;
