import {
  Document,
  FilterQuery,
  Model,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';

class BaseService<T> {
  private collection: Model<any>;

  constructor(collection: Model<any>) {
    this.collection = collection;
  }

  async getOne(
    criteria: FilterQuery<any>,
    fields: string[] = [],
    options = {}
  ): Promise<T | null> {
    return (await this.collection.findOne(criteria, fields, options)) as T | null;
  }

  async getMany(
    criteria: FilterQuery<any>,
    fields: string[] = [],
    options = {}
  ): Promise<T[] | null> {
    return (await this.collection.find(criteria, fields, options)) as T[] | null;
  }

  async getOneById(id: string): Promise<Document | null> {
    return this.collection.findById(id);
  }

  async count(criteria: FilterQuery<any>): Promise<number> {
    return this.collection.countDocuments(criteria);
  }

  async aggregate(criteria: any): Promise<any[]> {
    return this.collection.aggregate(criteria);
  }

  async deleteOne(criteria: FilterQuery<any>): Promise<any> {
    return this.collection.deleteOne(criteria);
  }

  async deleteMany(criteria: FilterQuery<any>): Promise<any> {
    return this.collection.deleteMany(criteria);
  }

  async updateOne(
    criteria: FilterQuery<any>,
    data: UpdateQuery<any>,
    upsert = false,
    returnDocument = true
  ): Promise<T | null> {
    return (await this.collection.findOneAndUpdate(criteria, data, {
      new: returnDocument,
      upsert,
      setDefaultsOnInsert: true,
      runValidators: true,
    })) as T | null;
  }

  async updateMany(
    criteria: FilterQuery<any>,
    data: UpdateQuery<any>,
    upsert: boolean
  ): Promise<UpdateWriteOpResult> {
    return this.collection.updateMany(criteria, data, { upsert });
  }
}

export default BaseService;
