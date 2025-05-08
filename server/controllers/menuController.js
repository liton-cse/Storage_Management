import { Folder, File, Note, History } from "../models/Storage.js";
import { calculateStorageStats } from "../utils/storageUtils.js";
import fs from "fs";
import { formatDate } from "../utils/dateFormatter.js";

// FolderController Start
//@Folder Business Logic
//@method:post
//@endpoint: api/folder
export const createFolder = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const folder = new Folder({
      name,
      userId: req.user._id, // Associate with authenticated user
    });

    const history = new History({
      userId: req.user._id,
      action: "folder_create",
      entityName: name,
      entityId: folder._id,
      entityType: "folder",
      details: { folderName: name },
    });
    await history.save();
    folder.historyId = history._id;
    await folder.save();
    res.status(201).json({ folder });
  } catch (err) {
    console.error("Error creating folder:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//@Folder Business Logic
//@method:get
//@endpoint: api/folder
export const getFolders = async (req, res) => {
  try {
    const AuthencateId = req.user._id;
    const folders = await Folder.find({ userId: AuthencateId })
      .sort({ createdAt: -1 })
      .lean();
    const formattedFolders = folders.map((item) => ({
      ...item,
      formattedDate: formatDate(item.createdAt),
    }));
    res.status(200).json(formattedFolders);
  } catch (err) {
    console.error("Error fetching folders:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// FolderController End

// FileController Start
//@File controller Business logic
//@method:post
//@end-point: api/file/upload
export const uploadFile = async (req, res) => {
  try {
    const { folderId } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Verify folder belongs to user if folderId is provided
    if (folderId) {
      const folder = await Folder.findOne({
        _id: folderId,
        userId: req.user._id,
      });
      if (!folder) {
        files.forEach((file) => fs.unlinkSync(file.path));
        return res.status(403).json({ message: "Unauthorized folder access" });
      }
    }

    const { totalSize } = await calculateStorageStats(req.user._id); // User-specific stats
    const totalUploadSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize + totalUploadSize > 15 * 1024 * 1024 * 1024) {
      files.forEach((file) => fs.unlinkSync(file.path));
      return res.status(400).json({ message: "Storage limit exceeded" });
    }

    const savedFiles = [];
    // let history;
    for (const file of files) {
      const fileType = file.mimetype.startsWith("image")
        ? "image"
        : file.mimetype === "application/pdf"
        ? "pdf"
        : file.mimetype === "text/plain"
        ? "txt"
        : file.mimetype.includes("word")
        ? "doc"
        : "other";

      const newFile = new File({
        name: file.originalname,
        path: file.path,
        size: file.size,
        entityType: fileType,
        folder: folderId,
        userId: req.user._id,
      });

      await newFile.save();

      const history = new History({
        userId: req.user._id,
        action: "file_upload",
        path: file.path,
        entityName: file.originalname,
        entityType: fileType,
        entityId: newFile._id,
        details: { fileName: file.originalname, fileType },
      });
      await history.save();

      // Update the file with the history ID
      newFile.historyId = history._id;
      await newFile.save();

      // savedFiles.push(newFile);
    }

    res.status(201).json({ message: "File Upload sucessfully" });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//@File controller Business logic to find file in specific folder.
//@method:get
//@end-point: api/folder/:id/files
export const getFilesInFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const folderId = id;
    // Verify folder belongs to user
    const folder = await Folder.findOne({
      _id: folderId,
      userId: req.user._id,
    });
    if (!folder) return res.status(403).json({ message: "Unauthorized" });

    const files = await File.find({ folder: folderId, userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const formattedFiles = files.map((item) => ({
      ...item,
      formattedDate: formatDate(item.createdAt),
    }));
    res.status(200).json(formattedFiles);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//@File controller Business logic to find specific file.
//@method:get
//@end-point: api/images
export const getImages = async (req, res) => {
  try {
    // Find files where entityType is "image" and folder doesn't exist or is null
    const images = await File.find({
      userId: req.user._id,
      entityType: "image",
      $or: [{ folder: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedImages = images.map((image) => ({
      ...image,
      formattedDate: formatDate(image.createdAt),
    }));
    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

//@File controller Business logic to find specific file.
//@method:get
//@end-point: api/pdf
export const getPdf = async (req, res) => {
  try {
    // Find files where entityType is "image" and folder doesn't exist or is null
    const pdfs = await File.find({
      userId: req.user._id,
      entityType: "pdf",
      $or: [{ folder: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedImages = pdfs.map((pdf) => ({
      ...pdf,
      formattedDate: formatDate(pdf.createdAt),
    }));
    res.status(200).json(formattedImages);
  } catch (error) {
    console.error("Error fetching pdf:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
//@File controller Business logic to find specific file.
//@method:get
//@end-point: api/file/:id
export const getFilesById = async (req, res) => {
  try {
    const { id } = req.params;
    const fileId = id;
    const file = await File.findOne({ _id: fileId, userId: req.user._id });
    if (!file) return res.status(404).json({ message: "File not found" });
    res.status(200).json(file);
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// FileController End

// NoteController Start

//@note controller Business logic to create the note.
//@method:post
//@end-point: api/notes
export const createNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description required" });
    }

    const note = new Note({
      title,
      description,
      userId: req.user._id,
    });

    const history = new History({
      userId: req.user._id,
      action: "note_create",
      entityId: note._id,
      details: { noteTitle: title, noteDescription: description },
      entityType: "note",
      entityName: title,
    });
    await history.save();
    note.historyId = history._id;
    await note.save();

    res.status(201).json(note);
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//@note controller Business logic to get the note.
//@method: get
//@end-point: api/notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const formattedNotes = notes.map((note) => ({
      ...note,
      formattedDate: formatDate(note.createdAt),
    }));
    res.status(200).json(formattedNotes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//@note controller Business logic to get the note.
//@method: get
//@end-point: api/notes/:id
export const getNotesById = async (req, res) => {
  const { id } = req.params;
  try {
    const notes = await Note.find({ userId: req.user._id, _id: id });
    res.status(200).json(notes);
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//@note controller Business logic to update the note.
//@method: put
//@end-point: api/notes/:id
export const updateNote = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    console.log(id, title, description);
    // Validate required fields
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description required" });
    }

    // Find the existing note first to get previous values
    const existingNote = await Note.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!existingNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update the note
    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { title, description },
      { new: true, runValidators: true }
    );

    // Create history record with before/after details
    await History.create({
      userId: req.user._id,
      action: "update",
      entityType: "note",
      entityId: updatedNote._id,
      entityName: title,
      title,
      description,
      details: {
        previous: {
          title: existingNote.title,
          description: existingNote.description,
        },
        current: {
          title,
          description,
        },
        updatedAt: new Date(),
      },
      createdAt: new Date(),
    });

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Error updating note:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// NoteController End

// Storage Stats (user-specific)
export const getStorageStats = async (req, res) => {
  try {
    const stats = await calculateStorageStats(req.user._id); // Pass user ID
    res.status(200).json(stats);
  } catch (err) {
    console.error("Error fetching storage stats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// History (user-specific)
export const getHistory = async (req, res) => {
  try {
    const history = await History.find({
      userId: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedHistory = history.map((item) => ({
      ...item,
      formattedDate: formatDate(item.createdAt),
    }));

    res.status(200).json(formattedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Searching the content from any where.....

export const searchItems = async (req, res) => {
  try {
    const { query, section } = req.query;
    const userId = req.user.id;
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    let results;

    switch (section) {
      case "folder":
        results = await searchFolders(userId, query);
        break;
      case "images":
        results = await searchFiles(userId, query, "image");
        break;
      case "pdf":
        results = await searchFiles(userId, query, "pdf");
        break;
      case "notes":
        results = await searchNotes(userId, query, "note");
        break;
      case "favorite":
        results = await searchFavorites(userId, query);
        break;
      case "home":
        results = await searchHome(userId, query);
        break;
      default:
        return res.status(400).json({ error: "Invalid section specified" });
    }

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper functions searching start
async function searchFolders(userId, query) {
  return await Folder.find({
    userId,
    $or: [{ name: { $regex: query, $options: "i" } }],
  });
}

async function searchFiles(userId, query, type) {
  const searchConditions = {
    userId,
    entityType: type,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { "metadata.content": { $regex: query, $options: "i" } },
    ],
  };
  return await File.find(searchConditions);
}

async function searchNotes(userId, query, type) {
  const searchConditions = {
    userId,
    entityType: type,
    $or: [
      { name: { $regex: query, $options: "i" } },
      { "metadata.content": { $regex: query, $options: "i" } }, // ✅ Correct
    ],
  };
  return await Note.find(searchConditions);
}

async function searchFavorites(userId, query) {
  // Fetch all favorite items in parallel
  const [favoriteFiles, favoriteFolders, favoriteNotes] = await Promise.all([
    File.find({
      userId,
      isFavorite: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "metadata.content": { $regex: query, $options: "i" } }, // ✅ Fixed
      ],
    }),
    Folder.find({
      userId,
      isFavorite: true,
      $or: [{ name: { $regex: query, $options: "i" } }],
    }),
    Note.find({
      userId,
      isFavorite: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "metadata.content": { $regex: query, $options: "i" } }, // ✅ Fixed
      ],
    }),
  ]);

  // Combine into one array with type identifiers
  const combinedFavorites = [
    ...favoriteFiles.map((file) => ({ ...file.toObject() })),
    ...favoriteFolders.map((folder) => ({
      ...folder.toObject(),
    })),
    ...favoriteNotes.map((note) => ({ ...note.toObject() })),
  ];

  return combinedFavorites;
}
async function searchHome(userId, query) {
  // Fetch all favorite items in parallel
  const [homeFiles, homeFolders, homeNotes] = await Promise.all([
    File.find({
      userId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "metadata.content": { $regex: query, $options: "i" } }, // ✅ Fixed
      ],
    }),
    Folder.find({
      userId,
      $or: [{ name: { $regex: query, $options: "i" } }],
    }),
    Note.find({
      userId,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "metadata.content": { $regex: query, $options: "i" } }, // ✅ Fixed
      ],
    }),
  ]);

  // Combine into one array with type identifiers
  const combinedHomeData = [
    ...homeFiles.map((file) => ({ ...file.toObject() })),
    ...homeFolders.map((folder) => ({
      ...folder.toObject(),
    })),
    ...homeNotes.map((note) => ({ ...note.toObject() })),
  ];

  return combinedHomeData;
}

// Helper functions searching end....
