export interface Meaning {
  id?: number;
  meaning: string;
  context_usage?: string;
}

export interface Proverb {
  id?: number;
  proverb: string;
  context_usage?: string;
}

export interface Category {
  id?: number;

  category?: string;

  meaning?: string;
  meanings?: string;

  context?: string;
  context_usage?: string;
}

export interface DictionaryEntry {
  id?: number;

  word: string;

  english_equivalent?: string;
  primary_malayalam_meaning?: string;

  gender?: string;
  root?: string;
  phonetic_transcription?: string;

  etymology?: string;
  cultural_note?: string;

  similar_word?: string[];
  novel_words?: string[];

  synonyms?: string[];
  antonyms?: string[];
  dialects?: string[];
  cross_reference?: string[];
  inflections?: string[];

  meanings?: Meaning[];
  proverbs?: Proverb[];

  // Malayalam dictionary
  category?: string[];

  // English dictionary
  Category?: Category[];
  categories?: Category[];
  category_names?: string[];

  equivalents?: {
    english?: string;
    tamil?: string;
    kannada?: string;
    telugu?: string;
    tulu?: string;
  };

  // Keep this if the JSON may contain it,
  // but don't display it in the UI.
  images?: string[];
}