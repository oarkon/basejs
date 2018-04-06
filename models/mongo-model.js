const logger = require('../lib/logger');
const connection = require('../lib/mongodb');
const ObjectId = require('mongodb').ObjectId;

function toObjectId(id) {
  // Invalid id should return null
  try {
    return new ObjectId(id);
  } catch (err) {
    return null;
  }
}

class MongoModel {
  constructor (collectionName) {
    this.collectionName = collectionName;
    connection.then(db => {
      if (db)
        db.collection(collectionName, { strict: true }, (err, collection) => {
          this.collection = collection;
          if (err) logger.warn(`Cannot access '${collectionName}' collection: ${err.message}`);
        });
      else
        logger.warn(`Cannot access '${collectionName}' collection. DB not connected`);
    });
  }

  // ***** Collections
  async addOne(item = {}) {
    await this.collection.insertOne(item);
    return item;
  }

  getMany(filter = {}, sort = null, skip = 0, limit = 20, projection = null) {
    return this.collection.find(filter, { sort, skip, limit, projection }).toArray();
  }

  updateMany(filter = {}, item = {}) {
    return this.collection.updateMany(filter, { $set: item });
  }

  deleteMany(filter = {}) {
    return this.collection.deleteMany(filter);
  }

  // ***** Documents
  isExist(filter = {}) {
    return this.collection.find(filter, { limit: 1 }).count({ limit: true });
  }

  getOneById(id, projection = null) {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    return this.collection.findOne({ _id: objectId }, { projection });
  }

  async updateOneById(id, item = {}) {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    const result = await this.collection.updateOne({ _id: objectId }, { $set: item });
    return result.modifiedCount === 1;
  };

  async replaceOneById(id, item = {}) {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    const result = await this.collection.replaceOne({ _id: objectId }, item);
    return result.modifiedCount === 1;
  };

  async deleteOneById(id) {
    const objectId = toObjectId(id);
    if (!objectId) return null;
    const result = await this.collection.deleteOne({ _id: objectId });
    return result.deletedCount === 1;
  }
}

module.exports = MongoModel;
