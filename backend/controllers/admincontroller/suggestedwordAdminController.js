const SuggestedWord = require("../../models/SuggestedWord");

// Helper function to format DB suggestions to frontend requirements
const formatSuggestion = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  
  let statusString = "pending";
  if (obj.status) {
    if (obj.status.approved) {
      statusString = "approved";
    } else if (obj.status.rejected) {
      statusString = "rejected";
    }
  }

  const englishWord = obj.word || (obj.equivalents && obj.equivalents.english) || "";

  let malayalamMeaning = "";
  if (obj.meanings && obj.meanings.length > 0) {
    malayalamMeaning = obj.meanings.map(m => m.meaning).join(", ");
  } else if (obj.equivalents && obj.equivalents.malayalam) {
    malayalamMeaning = obj.equivalents.malayalam;
  } else {
    malayalamMeaning = obj.root || obj.etymology || "";
  }

  return {
    ...obj,
    _id: String(obj._id),
    englishWord: englishWord,
    malayalamMeaning: malayalamMeaning || "No meaning provided",
    status: statusString
  };
};

// Get all suggestions
exports.getAllSuggestions = async (req, res) => {
  try {
    const suggestions = await SuggestedWord
      .find()
      .sort({ createdAt: -1 });

    const formatted = suggestions.map(formatSuggestion);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch suggestions",
      error: error.message,
    });
  }
};

// Get only pending suggestions
exports.getPendingSuggestions = async (req, res) => {
  try {
    const suggestions = await SuggestedWord
      .find({
        "status.approved": false,
        $or: [
          { "status.rejected": false },
          { "status.rejected": { $exists: false } }
        ]
      })
      .sort({ createdAt: -1 });

    const formatted = suggestions.map(formatSuggestion);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch pending suggestions",
      error: error.message,
    });
  }
};

// Approve suggestion
exports.approveSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedWord.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    suggestion.status = {
      approved: true,
      superuser_approved: suggestion.status?.superuser_approved || false,
      done_by_user: suggestion.status?.done_by_user || false,
      rejected: false
    };
    await suggestion.save();

    res.status(200).json({
      message: "Suggestion approved",
      suggestion: formatSuggestion(suggestion),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to approve suggestion",
      error: error.message,
    });
  }
};

// Reject suggestion
exports.rejectSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedWord.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    suggestion.status = {
      approved: false,
      superuser_approved: suggestion.status?.superuser_approved || false,
      done_by_user: suggestion.status?.done_by_user || false,
      rejected: true
    };
    await suggestion.save();

    res.status(200).json({
      message: "Suggestion rejected",
      suggestion: formatSuggestion(suggestion),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reject suggestion",
      error: error.message,
    });
  }
};

// Delete suggestion
exports.deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await SuggestedWord.findByIdAndDelete(
      req.params.id
    );

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    res.status(200).json({
      message: "Suggestion deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete suggestion",
      error: error.message,
    });
  }
};

// Get suggestion by ID
exports.getSuggestionById = async (req, res) => {
  try {
    const suggestion = await SuggestedWord.findById(req.params.id);

    if (!suggestion) {
      return res.status(404).json({
        message: "Suggestion not found",
      });
    }

    res.status(200).json(formatSuggestion(suggestion));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch suggestion details",
      error: error.message,
    });
  }
};