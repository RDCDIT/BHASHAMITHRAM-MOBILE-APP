const BaseTransformer = require('./base');

module.exports = {
  transform(row) {
    return {
      _id: Number(row.id || row._id),
      word: row.word ? String(row.word).trim() : '',
      phonetic_transcription: row.phonetic_transcription || null,
      root: row.root || null,
      etymology: row.etymology || null,
      cultural_note: row.cultural_note || null,
      synonyms: row.synonyms || null,
      antonyms: row.antonyms || null,
      dialects: row.dialects || null,
      proverb: row.proverb || null,
      similar_word: row.similar_word || null,
      novel_words: row.novel_words || null,
      pronunciation: row.pronunciation || null,
      cross_reference: row.cross_reference || null,
      inflections: row.inflections || null,
      
      equivalents: {
        kannada: row.equivalent_kannada || row.kannada || null,
        tamil: row.equivalent_tamil || row.tamil || null,
        telugu: row.equivalent_telugu || row.telugu || null,
        malayalam: row.equivalent_malayalam || row.malayalam || null
      },
      
      status: {
        approved: BaseTransformer.toBoolean(row.status_approved || row.approved),
        superuser_approved: BaseTransformer.toBoolean(row.status_superuser_approved || row.superuser_approved),
        done_by_user: BaseTransformer.toBoolean(row.status_done_by_user || row.done_by_user)
      },
      
      metadata: BaseTransformer.parseJson(row.metadata, {}),
      categories: BaseTransformer.parseJson(row.categories, []),
      images: BaseTransformer.stringToArray(row.images),
      meanings: BaseTransformer.parseJson(row.meanings, []),
      proverbs: BaseTransformer.parseJson(row.proverbs, [])
    };
  }
};
