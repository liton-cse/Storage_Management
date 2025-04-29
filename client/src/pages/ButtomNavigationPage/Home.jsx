import React, { useEffect, useState } from "react";
import "../../styles/Home.css";
import { GrStorage } from "react-icons/gr";
import { FcFolder } from "react-icons/fc";
import { FaImage } from "react-icons/fa6";
import { BsFileEarmarkPdfFill } from "react-icons/bs";
import RecentFilesList from "../../components/Recent";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
const Home = () => {
  const [items, setItems] = useState([]);
  const { getStorage } = useAuth();

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
  }, [getStorage]);
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
        <RecentFilesList />
      </div>
      <div>
        <Button />
      </div>
    </div>
  );
};

export default Home;
