# Storage Management System

A full-featured cloud storage management system built using the **MERN stack**. This platform allows authenticated users to securely store and manage files including folders, notes, images, and PDFs with advanced functionality.

---

## 🧰 Features

### 🧑‍💼 Authentication
- User Registration & Login (Manual and Google OAuth)
- Forgot Password / Reset Password via Email
- Logout Functionality
- Delete Account
- Edit Profile and Change Password

### 💾 Storage
- Each user gets **15 GB** of personal storage.
- Users can upload and manage:
  - 📁 Folders
  - 📝 Notes
  - 🖼️ Images
  - 📄 PDFs

### 🛠️ File Operations
- Rename
- Delete
- Copy
- Share
- Mark as Favorite

### 📅 Calendar Features
- Upload tracking by date
- Filter uploaded items by calendar date

### 👤 Profile Section
- View and edit user details
- Change password
- Account deletion option
- Terms & condition
- Privacy and policy
- Supports

---

## 🔧 Tech Stack

- **Frontend**: React.js, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, Google OAuth
- **File Storage**: Multer + Local Storage

---

## 📦 Installation
#### 1. Clone the repo
```bash
git clone https://github.com/yourusername/storage-management-system.git
cd storage-management-system
````
#### 2. Install server dependencies
```bash
cd server
npm install
```
#### 3. Install client dependencies
```bash
cd ../client
npm install
```
#### 4. Start the backend server
```bash
cd server
npm run dev
```
#### 5. Start the frontend app
```bash
cd ../client
npm run dev
```

