const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'controllers', 'malayalam_english_controllers.js');
let content = fs.readFileSync(file, 'utf8');

// The new function body
const newFunc = `const browseMalayalamWords = async (req, res) => {
  try {
    const { query = "" } = req.query;
    let whereClause = {};
    
    if (query && query.trim() !== "") {
      const trimmedQuery = query.trim();
      const isEnglish = /^[A-Za-z]/.test(trimmedQuery);
      
      if (isEnglish) {
        whereClause.english_equivalent = { [Op.like]: '%' + trimmedQuery + '%' };
      } else {
        if (trimmedQuery === "അ") {
          whereClause.word = { [Op.like]: 'അ%' };
        } else {
          whereClause.word = { [Op.like]: trimmedQuery + '%' };
        }
      }
    }

    const words = await SQLDictionary.findAll({
      where: whereClause,
      order: [['word', 'ASC']],
      attributes: ['id', 'word', 'english_equivalent', 'meaning']
    });

    const mappedWords = words.map(w => ({
      _id: w.id,
      word: w.word,
      meanings: [
        {
          meaning: w.english_equivalent || w.meaning || "",
          context_usage: ""
        }
      ]
    }));

    res.status(200).json(mappedWords);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};`;

// Use Regex to replace the whole function regardless of CRLF
content = content.replace(/const browseMalayalamWords = async \(req, res\) => \{[\s\S]*?\n\};\r?\n/m, newFunc + '\n');
fs.writeFileSync(file, content);
console.log('Fixed browseMalayalamWords');
