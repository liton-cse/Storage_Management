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
