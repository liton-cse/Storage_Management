import { File, Folder, Note } from "../models/Storage.js";

const TOTAL_STORAGE_GB = 15; // 15GB total storage
const BYTES_TO_KB = 1024;
const BYTES_TO_MB = 1024 * 1024;
const BYTES_TO_GB = 1024 * 1024 * 1024;

// Improved note size calculation including metadata
const calculateNoteSizeBytes = (note) => {
  // Calculate text content size
  const textContent = `${note.title || ""}\n${note.description || ""}`;
  const textSize = new TextEncoder().encode(textContent).length;

  // Calculate approximate metadata size
  const metadataSize = Buffer.byteLength(
    JSON.stringify({
      _id: note._id,
      userId: note.userId,
      entityType: note.entityType,
      isFavorite: note.isFavorite,
      sharedWith: note.sharedWith,
      actions: note.actions,
      historyId: note.historyId,
      createdAt: note.createdAt,
      __v: note.__v,
    })
  );

  return textSize + metadataSize;
};

// Enhanced size formatter that shows appropriate units
const formatSize = (bytes) => {
  if (bytes < BYTES_TO_KB) return `${bytes} bytes`;
  if (bytes < BYTES_TO_MB) return `${(bytes / BYTES_TO_KB).toFixed(2)} KB`;
  if (bytes < BYTES_TO_GB) return `${(bytes / BYTES_TO_MB).toFixed(2)} MB`;
  return `${(bytes / BYTES_TO_GB).toFixed(2)} GB`;
};

export const calculateStorageStats = async (userId) => {
  const [files, folders, notes] = await Promise.all([
    File.find({ userId }),
    Folder.find({ userId }),
    Note.find({ userId }),
  ]);

  // Calculate total note sizes (improved)
  const totalNoteSizeBytes = notes.reduce((sum, note) => {
    return sum + calculateNoteSizeBytes(note);
  }, 0);

  // Calculate folder sizes
  const folderSizes = {};
  folders.forEach((folder) => {
    const filesInFolder = files.filter(
      (file) => file.folder && file.folder.equals(folder._id)
    );
    folderSizes[folder._id] = filesInFolder.reduce(
      (sum, file) => sum + file.size,
      0
    );
  });

  // Total storage calculations
  const totalFilesSizeBytes = files.reduce(
    (total, file) => total + file.size,
    0
  );
  const totalSizeBytes = totalFilesSizeBytes + totalNoteSizeBytes;
  const usedSizeMB = totalSizeBytes / BYTES_TO_MB;
  const availableSizeMB = TOTAL_STORAGE_GB * 1024 - usedSizeMB;

  return {
    totalSize: formatSize(totalSizeBytes),
    usedSize: formatSize(totalSizeBytes),
    availableSize: `${availableSizeMB.toFixed(2)} MB / ${(
      availableSizeMB / 1024
    ).toFixed(2)} GB`,
    storageLimit: `${TOTAL_STORAGE_GB} GB`,
    fileCount: files.length,
    totalFolders: folders.length,
    totalNotes: notes.length,
    totalNoteSize: formatSize(totalNoteSizeBytes),
    totalFolderSize: formatSize(
      Object.values(folderSizes).reduce((sum, size) => sum + size, 0)
    ),
    // File type specific stats
    pdfSize: formatSize(
      files
        .filter((f) => f.entityType === "pdf")
        .reduce((sum, f) => sum + f.size, 0)
    ),
    imageSize: formatSize(
      files
        .filter((f) => f.entityType === "image")
        .reduce((sum, f) => sum + f.size, 0)
    ),
    txtSize: formatSize(
      files
        .filter((f) => f.entityType === "txt")
        .reduce((sum, f) => sum + f.size, 0)
    ),
    docSize: formatSize(
      files
        .filter((f) => f.entityType === "doc")
        .reduce((sum, f) => sum + f.size, 0)
    ),
    pdfCount: files.filter((f) => f.entityType === "pdf").length,
    imageCount: files.filter((f) => f.entityType === "image").length,
    txtCount: files.filter((f) => f.entityType === "txt").length,
    docCount: files.filter((f) => f.entityType === "doc").length,
  };
};
