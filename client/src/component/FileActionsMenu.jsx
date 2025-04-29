// FileActionsMenu.js
import React from "react";
import PropTypes from "prop-types";

const FileActionsMenu = ({ file, onActionClick, menuStyle, menuRef }) => {
  const getActionId = () => (file.historyId ? file.historyId : file._id);

  const getTargetId = () => (file.historyId ? file._id : file.entityId);

  return (
    <div
      className="action-menu"
      style={menuStyle}
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="menu-item"
        onClick={() =>
          onActionClick(
            getActionId(),
            file.entityType,
            getTargetId(),
            "favorite"
          )
        }
      >
        {file.isFavorite ? "Remove Favorite" : "Add Favorite"}
      </button>
      <button
        className="menu-item"
        onClick={() =>
          onActionClick(file._id, file.entityType, file.entityId, "copy")
        }
      >
        Copy
      </button>
      <button
        className="menu-item"
        onClick={() =>
          onActionClick(file._id, file.entityType, file.entityId, "duplicate")
        }
      >
        Duplicate
      </button>
      <button
        className="menu-item"
        onClick={() =>
          onActionClick(file._id, file.entityType, file.entityId, "rename")
        }
      >
        Rename
      </button>
      <button
        className="menu-item"
        onClick={() =>
          onActionClick(file._id, file.entityType, file.entityId, "share")
        }
      >
        Share
      </button>
      <button
        className="menu-item delete"
        onClick={() =>
          onActionClick(getActionId(), file.entityType, getTargetId(), "delete")
        }
      >
        Delete
      </button>
    </div>
  );
};

FileActionsMenu.propTypes = {
  file: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    entityType: PropTypes.string.isRequired,
    entityId: PropTypes.string,
    historyId: PropTypes.string,
    isFavorite: PropTypes.bool,
  }).isRequired,
  onActionClick: PropTypes.func.isRequired,
  menuStyle: PropTypes.object,
  menuRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

FileActionsMenu.defaultProps = {
  menuStyle: {},
  menuRef: null,
};

export default FileActionsMenu;
