import React, { useEffect, useState } from "react";
import "../../styles/Home.css";
import { GrStorage } from "react-icons/gr";
import { FcFolder } from "react-icons/fc";
import { FaImage } from "react-icons/fa6";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import RecentFilesList from "../../components/Recent";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import { createFolderFunction, uploadFile } from "../../context/MenuFunction";
const Home = () => {
  const [items, setItems] = useState([]);
  const { getStorage } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await getStorage();
        if (response.success) {
          setItems(response.message);
        }
      } catch (error) {
        console.log("Storage Item Does not found !", error);
      }
    };
    fetchItems();
  }, [getStorage, refreshTrigger]);

  //Handling a file Uploading
  const handleCreateFolder = async (folderName) => {
    try {
      const response = await createFolderFunction(folderName);
      if (response.success) {
        setRefreshTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateNote = async () => {};

  const handleFileUpload = async (files) => {
    try {
      // 1. Create FormData object
      const formData = new FormData();

      // 2. Append each file to FormData
      Array.from(files).forEach((file) => {
        formData.append("files", file); // 'files' should match your backend expectation
      });
      const response = await uploadFile(formData);
      if (response.success) {
        setRefreshTrigger((prev) => !prev);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="home-area">
      {items && (
        <div className="home-card">
          <div className="home-card-first">
            <div className="home-card-duble">
              <div className="home-card-heading">
                <GrStorage className="img" />
                <h1>Your Storage:{items.storageLimit}</h1>
              </div>
              <p>Usage Storage:{items.usedSize} </p>
              <p>Available Storage:{items.availableSize} </p>
            </div>
            <div className="home-card-single">
              <div className="home-card-heading">
                <FcFolder className="img" />
                <h1>Folder</h1>
              </div>
              <p>Total Item: {items.totalFolders} </p>
              <p>Storage: {items.totalFolderSize} </p>
            </div>
          </div>
          <div className="home-card-second">
            <div className="home-card-single">
              <div className="home-card-heading">
                <img src="/note.png" alt="note" />
                <h1>Note</h1>
              </div>
              <p>Total Item: {items.totalNotes}</p>
              <p>Storage: {items.totalNoteSize}</p>
            </div>
            <div className="home-card-single">
              <div className="home-card-heading">
                <FaImage className="img-image" />
                <h1>Image</h1>
              </div>
              <p>Total Item: {items.imageCount}</p>
              <p>Storage: {items.imageSize}</p>
            </div>
            <div className="home-card-single">
              <div className="home-card-heading">
                <BsFileEarmarkPdfFill className="img-pdf" />
                <h1>Pdf</h1>
              </div>
              <p>Total Item: {items.pdfCount}</p>
              <p>Storage: {items.pdfSize}</p>
            </div>
          </div>
        </div>
      )}
      {/* Recent File Folder notes,image pdf show */}
      <div className="recent-area">
        <RecentFilesList data={refreshTrigger} />
      </div>
      <div>
        <Button
          onFolderCreate={handleCreateFolder}
          onNoteCreate={handleCreateNote}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default Home;
