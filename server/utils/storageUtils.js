import { File, Folder, Note } from "../models/Storage.js";

const TOTAL_STORAGE_GB = 15; // 15GB total storage
const BYTES_TO_MB = 1024 * 1024;
const BYTES_TO_GB = 1024 * 1024 * 1024;

export const calculateStorageStats = async () => {
  const [files, folders, notes] = await Promise.all([
    File.find(),
    Folder.find(),
    Note.find(),
  ]);

  const totalFolders = folders.length;
  const totalNotes = notes.length;

  // Helper function to format size (MB or GB)
  const formatSize = (bytes) => {
    const mb = bytes / BYTES_TO_MB;
    return mb < 1024
      ? `${mb.toFixed(2)} MB`
      : `${(bytes / BYTES_TO_GB).toFixed(2)} GB`;
  };

  // Calculate note sizes (sum of all note content)
  const totalNoteSizeBytes = notes.reduce((sum, note) => {
    return (
      sum +
      Buffer.byteLength((note.title || "") + (note.description || ""), "utf8")
    );
  }, 0);

  // Calculate folder sizes (sum of all files in each folder)
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

  // Total folder size (sum of all folder sizes)
  const totalFolderSizeBytes = Object.values(folderSizes).reduce(
    (sum, size) => sum + size,
    0
  );

  // Total storage calculations (files + notes)
  const totalFilesSizeBytes = files.reduce(
    (total, file) => total + file.size,
    0
  );
  const totalSizeBytes = totalFilesSizeBytes + totalNoteSizeBytes;
  const usedSizeMB = totalSizeBytes / BYTES_TO_MB;
  const availableSizeMB = TOTAL_STORAGE_GB * 1024 - usedSizeMB;

  // Calculate size by file type (in formatted MB/GB)
  const getTypeSize = (type) =>
    formatSize(
      files
        .filter((file) => file.entityType === type)
        .reduce((total, file) => total + file.size, 0)
    );

  return {
    totalSize: formatSize(totalSizeBytes),
    usedSize: `${usedSizeMB.toFixed(2)} MB`,
    availableSize: `${availableSizeMB.toFixed(2)} MB / ${(
      availableSizeMB / 1024
    ).toFixed(2)} GB`,
    storageLimit: `${TOTAL_STORAGE_GB} GB`,
    fileCount: files.length,
    totalFolders,
    totalNotes, // Added note count
    totalNoteSize: formatSize(totalNoteSizeBytes), // Added note size
    totalFolderSize: formatSize(totalFolderSizeBytes),
    pdfSize: getTypeSize("pdf"),
    imageSize: getTypeSize("image"),
    txtSize: getTypeSize("txt"),
    docSize: getTypeSize("doc"),
    pdfCount: files.filter((file) => file.entityType === "pdf").length,
    imageCount: files.filter((file) => file.entityType === "image").length,
    txtCount: files.filter((file) => file.entityType === "txt").length,
    docCount: files.filter((file) => file.entityType === "doc").length,
  };
};
