const BaseTransformer = require('./base');

module.exports = {
  transform(row) {
    const validGenders = ["പുല്ലിംഗം", "സ്ത്രീലിംഗം", "നപുംസകലിംഗം", "ഉഭയലിംഗം"];
    const gender = row.gender ? String(row.gender).trim() : null;
    const finalGender = validGenders.includes(gender) ? gender : null;

    return {
      _id: Number(row.id || row._id),
      word: row.word ? String(row.word).trim() : '',
      category: row.category || null,
      gender: finalGender,
      root: row.root || null,
      phonetic_transcription: row.phonetic_transcription || null,
      meanings: BaseTransformer.parseJson(row.meanings, []),
      proverbs: BaseTransformer.parseJson(row.proverbs, []),
      images: BaseTransformer.stringToArray(row.images),
      status: {
        superuser_approved: BaseTransformer.toBoolean(row.status_superuser_approved || row.superuser_approved),
        done_by_user: BaseTransformer.toBoolean(row.status_done_by_user || row.done_by_user)
      },
      metadata: {
        submitted_by_id: BaseTransformer.toObjectId(row.submitted_by_id),
        last_edited_by_id: BaseTransformer.toObjectId(row.last_edited_by_id),
        created_at: row.created_at ? new Date(row.created_at) : null,
        last_edited_at: row.last_edited_at ? new Date(row.last_edited_at) : null
      }
    };
  }
};
