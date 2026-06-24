const BaseTransformer = require('./base');

module.exports = {
  transform(row) {
    return {
      _id: Number(row.id || row._id),
      word: row.word ? String(row.word).trim() : '',
      Category: row.Category || row.category || null,
      Gender: row.Gender || row.gender || null,
      root: row.root || null,
      phonetic_transcription: row.phonetic_transcription || null,
      meanings: BaseTransformer.parseJson(row.meanings, []),
      proverbs: BaseTransformer.parseJson(row.proverbs, []),
      images: BaseTransformer.stringToArray(row.images),
      status: {
        approved: BaseTransformer.toBoolean(row.status_approved || row.approved),
        superuser_approved: BaseTransformer.toBoolean(row.status_superuser_approved || row.superuser_approved),
        done_by_user: BaseTransformer.toBoolean(row.status_done_by_user || row.done_by_user)
      },
      metadata: {
        submitted_by_id: row.submitted_by_id ? Number(row.submitted_by_id) : null,
        last_edited_by_id: row.last_edited_by_id ? Number(row.last_edited_by_id) : null,
        last_edited_at: row.last_edited_at ? new Date(row.last_edited_at) : null
      }
    };
  }
};
