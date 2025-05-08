// ShareModal.jsx
import React, { useState, useEffect } from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  EmailShareButton,
  EmailIcon,
} from "react-share";
import "../styles/componentStyle/ShareModal.css";
import {
  generateShareDataFunction,
  shareViaPlatformFunction,
} from "../context/ActionFunction";

const ShareModal = ({ isOpen, onClose, entityType, entityId }) => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("social");
  const [directShare, setDirectShare] = useState({
    platform: "whatsapp",
    recipient: "",
  });

  useEffect(() => {
    if (isOpen && !shareData) {
      const fetchShareData = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await generateShareDataFunction(
            entityType,
            entityId
          );
          setShareData(response.message);
        } catch (err) {
          console.log("Failed to load share data", err);
          setError("Failed to load share data");
        } finally {
          setLoading(false);
        }
      };

      fetchShareData();
    }
  }, [isOpen, entityId, entityType, shareData]);

  const handleDirectShare = async () => {
    if (!directShare.recipient && directShare.platform !== "facebook") {
      setError("Recipient is required");
      return;
    }

    try {
      setLoading(true);
      const platform = directShare.platform;
      const recipient = directShare.recipient;
      const response = await shareViaPlatformFunction(
        entityType,
        entityId,
        platform,
        recipient
      );

      if (response.message.requiresExternal) {
        window.open(response.message.shareLink, "_blank");
      } else {
        window.location.href = response.message.shareLink;
      }
    } catch (err) {
      console.log("Failed to share", err);
      setError("Failed to share");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareData.url);
    setError("Copied to clipboard!");
    setTimeout(() => setError(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>

        <h2 className="modal-title">
          Share {shareData?.entityName || entityType}
        </h2>

        {loading && <div className="loading-spinner">Loading...</div>}

        {error && (
          <div
            className={`error-message ${
              error.includes("Copied") ? "success" : ""
            }`}
          >
            {error}
          </div>
        )}

        {shareData && (
          <>
            <div className="share-tabs">
              <button
                className={`tab-button ${
                  activeTab === "social" ? "active" : ""
                }`}
                onClick={() => setActiveTab("social")}
              >
                Social Media
              </button>
              <button
                className={`tab-button ${
                  activeTab === "direct" ? "active" : ""
                }`}
                onClick={() => setActiveTab("direct")}
              >
                Direct Share
              </button>
              <button
                className={`tab-button ${activeTab === "link" ? "active" : ""}`}
                onClick={() => setActiveTab("link")}
              >
                Copy Link
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "social" && (
                <div className="social-share-grid">
                  <FacebookShareButton
                    url={shareData.url}
                    quote={shareData.title}
                    className="share-button"
                  >
                    <FacebookIcon size={48} round />
                    <span>Facebook</span>
                  </FacebookShareButton>

                  <FacebookMessengerShareButton
                    url={shareData.url}
                    appId="your-messenger-app-id"
                    className="share-button"
                  >
                    <FacebookMessengerIcon size={48} round />
                    <span>Messenger</span>
                  </FacebookMessengerShareButton>

                  <WhatsappShareButton
                    url={shareData.url}
                    title={shareData.title}
                    className="share-button"
                  >
                    <WhatsappIcon size={48} round />
                    <span>WhatsApp</span>
                  </WhatsappShareButton>

                  <TelegramShareButton
                    url={shareData.url}
                    title={shareData.title}
                    className="share-button"
                  >
                    <TelegramIcon size={48} round />
                    <span>Telegram</span>
                  </TelegramShareButton>

                  <TwitterShareButton
                    url={shareData.url}
                    title={shareData.title}
                    className="share-button"
                  >
                    <TwitterIcon size={48} round />
                    <span>Twitter</span>
                  </TwitterShareButton>

                  <EmailShareButton
                    url={shareData.url}
                    subject={shareData.title}
                    body={shareData.description}
                    className="share-button"
                  >
                    <EmailIcon size={48} round />
                    <span>Email</span>
                  </EmailShareButton>
                </div>
              )}

              {activeTab === "direct" && (
                <div className="direct-share-form">
                  <div className="form-group">
                    <label htmlFor="platform">Platform</label>
                    <select
                      id="platform"
                      value={directShare.platform}
                      onChange={(e) =>
                        setDirectShare({
                          ...directShare,
                          platform: e.target.value,
                        })
                      }
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recipient">
                      {directShare.platform === "whatsapp"
                        ? "Phone Number"
                        : directShare.platform === "telegram"
                        ? "Telegram Username"
                        : "Email Address"}
                    </label>
                    <input
                      id="recipient"
                      type="text"
                      value={directShare.recipient}
                      onChange={(e) =>
                        setDirectShare({
                          ...directShare,
                          recipient: e.target.value,
                        })
                      }
                      placeholder={
                        directShare.platform === "whatsapp"
                          ? "e.g. +1234567890"
                          : directShare.platform === "telegram"
                          ? "e.g. @username"
                          : "e.g. user@example.com"
                      }
                    />
                  </div>

                  <button
                    className="share-button primary"
                    onClick={handleDirectShare}
                    disabled={loading}
                  >
                    {loading ? "Sharing..." : "Send"}
                  </button>
                </div>
              )}

              {activeTab === "link" && (
                <div className="link-share-container">
                  <div className="share-url-box">
                    <input
                      type="text"
                      value={shareData.url}
                      readOnly
                      className="share-url-input"
                    />
                    <button className="copy-button" onClick={copyToClipboard}>
                      Copy
                    </button>
                  </div>

                  <div className="share-meta">
                    <h3>{shareData.title}</h3>
                    <p>{shareData.description}</p>
                    {shareData.thumbnail && (
                      <img
                        src={shareData.thumbnail}
                        alt="Preview"
                        className="thumbnail-preview"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
