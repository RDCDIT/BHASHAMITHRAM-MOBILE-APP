const BaseTransformer = require('./base');

module.exports = {
  transform(row) {
    return {
      _id: Number(row.id || row._id),
      word: row.word ? String(row.word).trim() : '',
      synonyms: BaseTransformer.parseJson(row.synonyms, BaseTransformer.stringToArray(row.synonyms))
    };
  }
};
