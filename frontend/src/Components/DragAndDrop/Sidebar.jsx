import React from "react";

const SidebarItem = ({ item, onAddItem }) => (
  <div
    className="sidebar-item"
    onClick={() => onAddItem(item)}
    style={{ cursor: "pointer" }}
  >
    {item.name}
  </div>
);

const Sidebar = ({ onAddItem, onSave, onLoad, onOpen }) => {
  const items = [
    { id: 1, type: "rectangle", name: "Rectangle" },
    { id: 2, type: "circle", name: "Circle" },
    { id: 3, type: "text", name: "Text" },
    { id: 4, type: "triangle-up", name: "Triangle-up" },
    { id: 6, type: "triangle-down", name: "Triangle-down" },
    // { id: 5, type: "square", name: "Square" },
    // { id: 7, type: "ellipse", name: "Ellipse" },
  ];

  return (
    <div className="sidebar">
      {items.map((item) => (
        <SidebarItem key={item.id} item={item} onAddItem={onAddItem} />
      ))}
      <button onClick={onSave} className="save-button">
        Save Drop Zone
      </button>
      <button onClick={onLoad} className="load-button">
        Load Drop Zone
      </button>
      <button onClick={onOpen} className="add-bdd-button">
        Add BDD
      </button>
    </div>
  );
};

export default Sidebar;
