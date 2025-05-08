// controllers/favoritesController.js
import { File, Folder, Note } from "../models/Storage.js";
import { formatDate } from "../utils/dateFormatter.js";

export const getFavoriteItems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all favorite items in parallel
    const [favoriteFiles, favoriteFolders, favoriteNotes] = await Promise.all([
      File.find({ userId, isFavorite: true }),
      Folder.find({ userId, isFavorite: true }),
      Note.find({ userId, isFavorite: true }),
    ]);

    // Combine into one array with type identifiers
    const combinedFavorites = [
      ...favoriteFiles.map((file) => ({ ...file.toObject() })),
      ...favoriteFolders.map((folder) => ({
        ...folder.toObject(),
      })),
      ...favoriteNotes.map((note) => ({ ...note.toObject() })),
    ];

    // Sort the data by createdAt
    combinedFavorites.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    //Formatted the date ....
    const formattedFavorite = combinedFavorites.map((data) => ({
      ...data,
      formattedDate: formatDate(data.createdAt),
    }));

    res.status(200).json(formattedFavorite);
  } catch (err) {
    console.error("Error fetching favorite items:", err);
    res.status(500).json({
      message: "Failed to fetch favorite items",
    });
  }
};

//get item by the date from my all database...like Folder, File, Note...
export const getCalenderData = async (req, res) => {
  const { date } = req.body; // Expected format: "2025-5-15" (YYYY-M-D)
  console.log(date);
  if (!date) {
    return res
      .status(400)
      .json({ error: "Date is required in the request body." });
  }

  try {
    // Step 1: Parse the input date (e.g., "2025-5-15") into a Date object (Bangladesh Time)
    const [year, month, day] = date.split("-").map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0); // Start of day (00:00:00)
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999); // End of day (23:59:59.999)

    // Step 2: Adjust for Bangladesh Time (GMT+6)
    startDate.setHours(startDate.getHours() - 6); // Convert to UTC
    endDate.setHours(endDate.getHours() - 6); // Convert to UTC

    // Step 3: Query all collections for documents created on this date (sorted by latest first)
    const [folders, files, notes] = await Promise.all([
      Folder.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).sort({ createdAt: -1 }), // Sort by newest first
      File.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).sort({ createdAt: -1 }),
      Note.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).sort({ createdAt: -1 }),
    ]);

    const combineData = [
      ...folders.map((folder) => ({ ...folder.toObject() })),
      ...files.map((file) => ({ ...file.toObject() })),
      ...notes.map((note) => ({ ...note.toObject() })),
    ];

    const response = combineData.map((data) => ({
      ...data,
      formattedDate: formatDate(data.createdAt),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).json({ error: "Failed to fetch calendar data." });
  }
};
