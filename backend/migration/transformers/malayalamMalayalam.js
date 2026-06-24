const BaseTransformer = require('./base');

module.exports = {
  transform(row) {
    return {
      _id: Number(row.id || row._id),
      word: row.word ? String(row.word).trim() : '',
      category: row.category || null,
      Category: row.Category || null,
      gender: row.gender || null,
      Gender: row.Gender || null,
      root: row.root || null,
      phonetic_transcription: row.phonetic_transcription || null,
      meanings: BaseTransformer.parseJson(row.meanings, []),
      proverbs: BaseTransformer.parseJson(row.proverbs, []),
      etymology: row.etymology || null,
      cultural_note: row.cultural_note || null,
      similar_word: BaseTransformer.parseJson(row.similar_word, BaseTransformer.stringToArray(row.similar_word)),
      novel_words: BaseTransformer.parseJson(row.novel_words, BaseTransformer.stringToArray(row.novel_words)),
      synonyms: BaseTransformer.parseJson(row.synonyms, BaseTransformer.stringToArray(row.synonyms)),
      antonyms: BaseTransformer.parseJson(row.antonyms, BaseTransformer.stringToArray(row.antonyms)),
      dialects: BaseTransformer.parseJson(row.dialects, BaseTransformer.stringToArray(row.dialects)),
      cross_reference: BaseTransformer.parseJson(row.cross_reference, BaseTransformer.stringToArray(row.cross_reference)),
      inflections: row.inflections || null,
      equivalents: {
        english: row.equivalent_english || row.english || null,
        tamil: row.equivalent_tamil || row.tamil || null,
        kannada: row.equivalent_kannada || row.kannada || null,
        telugu: row.equivalent_telugu || row.telugu || null,
        tulu: row.equivalent_tulu || row.tulu || null
      },
      images: BaseTransformer.stringToArray(row.images),
      status: {
        approved: BaseTransformer.toBoolean(row.status_approved || row.approved),
        superuser_approved: BaseTransformer.toBoolean(row.status_superuser_approved || row.superuser_approved),
        done_by_user: BaseTransformer.toBoolean(row.status_done_by_user || row.done_by_user)
      },
      metadata: {
        submitted_by_id: BaseTransformer.toObjectId(row.submitted_by_id),
        last_edited_by_id: BaseTransformer.toObjectId(row.last_edited_by_id),
        last_edited_at: row.last_edited_at ? new Date(row.last_edited_at) : null
      }
    };
  }
};
