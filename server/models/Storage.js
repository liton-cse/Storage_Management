import mongoose from "mongoose";

// Shared action schema for all models
const ActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "favorite",
      "copy",
      "rename",
      "duplicate",
      "delete",
      "share",
      "download",
    ],
  },
  oldName: String, // For rename actions
  sourceId: mongoose.Schema.Types.ObjectId, // For copy/duplicate actions
  sharedWith: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      permission: { type: String, enum: ["view", "edit"] },
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

// Folder schema
const FolderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: String,
  historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  entityType: { type: String, default: "folder" },
  isFavorite: { type: Boolean, default: false },
  sharedWith: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      permission: { type: String, enum: ["view", "edit"] },
    },
  ],
  actions: [ActionSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Folder = mongoose.model("Folder", FolderSchema);

// File Schema
const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: String,
  size: Number,
  entityType: { type: String },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isFavorite: { type: Boolean, default: false },
  sharedWith: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      permission: { type: String, enum: ["view", "edit"] },
    },
  ],
  historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
  actions: [ActionSchema],
  createdAt: { type: Date, default: Date.now },
});

export const File = mongoose.model("File", FileSchema);

// Note Schema
const NoteSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  size: {
    type: Number,
    default: 0,
  },
  historyId: { type: mongoose.Schema.Types.ObjectId, ref: "History" },
  entityType: { type: String, default: "note" },
  isFavorite: { type: Boolean, default: false },
  sharedWith: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      permission: { type: String, enum: ["view", "edit"] },
    },
  ],
  actions: [ActionSchema],
  createdAt: { type: Date, default: Date.now },
});

export const Note = mongoose.model("Note", NoteSchema);

// History Schema
const HistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  path: String,
  entityType: {
    type: String,
    enum: ["file", "folder", "note", "image", "pdf", "doc", "txt"],
  },
  entityName: { type: String },
  isFavorite: { type: Boolean, default: false },
  entityId: mongoose.Schema.Types.ObjectId,
  action: String,
  details: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export const History = mongoose.model("History", HistorySchema);
