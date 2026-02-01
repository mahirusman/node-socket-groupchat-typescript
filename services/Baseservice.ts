import {
  Document,
  FilterQuery,
  Model,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import { DeleteResponse } from './types/Service';

class MainService<T extends Document> {
  private collection: Model<T>;
  constructor(collection: Model<T>) {
    this.collection = collection;
  }

  /** Get first matching result  */
  async getOne(
    criteria: FilterQuery<T>,
    fields: string[] = [],
    options = {}
  ): Promise<T | null> {
    return await this.collection.findOne(criteria, fields, options);
  }

  /** Get all matching results  */
  async getMany(
    criteria: FilterQuery<T>,
    fields = [],
    options = {}
  ): Promise<T[] | null> {
    return await this.collection.find(criteria, fields, options);
  }

  /** Get first matching result just by id  */
  async getOneById(id: string): Promise<Document | null> {
    return await this.collection.findById(id);
  }

  /** Get total number of matching results  */
  async count(criteria: FilterQuery<T>): Promise<number> {
    return await this.collection.countDocuments(criteria);
  }

  /** Return result for given aggregate pipeline  */
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async aggregate(criteria: any): Promise<any[]> {
    return await this.collection.aggregate(criteria);
  }

  /** Delete first matching document  */
  async deleteOne(criteria: FilterQuery<T>): Promise<DeleteResponse> {
    return await this.collection.deleteOne(criteria);
  }

  /** Delete all "matching" document  */
  async deleteMany(criteria: FilterQuery<T>): Promise<DeleteResponse> {
    return await this.collection.deleteMany(criteria);
  }

  /** Update first matching document  */
  async updateOne(
    criteria: FilterQuery<T>,
    data: UpdateQuery<T>,
    upsert = false,
    returnDocument = true
  ): Promise<T | null> {
    return await this.collection.findOneAndUpdate(criteria, data, {
      new: returnDocument,
      upsert,
      setDefaultsOnInsert: true,
      runValidators: true,
    });
  }

  /** Update all "matching" document  */
  async updateMany(
    criteria: FilterQuery<T>,
    data: UpdateQuery<T>,
    upsert: boolean
  ): Promise<UpdateWriteOpResult> {
    return await this.collection.updateMany(criteria, data, { upsert });
  }
}

export default MainService;
