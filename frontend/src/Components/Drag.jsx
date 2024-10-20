import React, { useState, useRef } from "react";
import Sidebar from "./DragAndDrop/Sidebar";
import DropZone from "./DragAndDrop/DropZone";
import PropertiesPanel from "./DragAndDrop/PropertiesPanel";
import { useSelector } from "react-redux";
import SavePopup from "./Partial/savePop";
import domtoimage from "dom-to-image";

const Drag = () => {
  const [droppedItems, setDroppedItems] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [dropZoneBackgroundColor, setDropZoneBackgroundColor] =
    useState("#b6b6b6");
  const dropZoneRef = useRef(null);
  const userId = useSelector((state) => state.user.id);
  const [showPopup, setShowPopup] = useState(false);

  const addItemToDropZone = (item) => {
    const newItem = {
      id: Date.now(),
      type: item.type,
      x: item.x || 0,
      y: item.y || 0,
      width: item.width || 100,
      height: item.height || 100,
      backgroundColor:
        item.type === "text" ? "rgba(0, 0, 0, 0)" : "rgba(211, 211, 211, 1)",
      text: item.type === "text" ? "Editable Text" : "",
      borderStyle: item.borderStyle || "solid",
      borderWidth: item.borderWidth || "1px",
      borderColor: item.borderColor || "#000000",
      borderRadius: item.type === "circle" ? "50%" : "0",
      color: item.color || "#000000",
      size: item.fontSize || "16px",
      zIndex: item.zIndex || 1,
    };
    console.log(newItem);
    setDroppedItems([...droppedItems, newItem]);
  };

  const handleElementSelect = (item) => {
    setSelectedElement(item);
  };

  const handleElementMove = (movedElement) => {
    setDroppedItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === movedElement.id ? { ...item, ...movedElement } : item
      );
      handleSave(updatedItems); // Enregistrez après déplacement
      return updatedItems;
    });
  };

  const handleElementUpdate = (updatedElement) => {
    setDroppedItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === updatedElement.id ? { ...item, ...updatedElement } : item
      );
      handleSave(updatedItems); // Enregistrez après mise à jour
      return updatedItems;
    });
  };

  const handleElementDelete = (element) => {
    setDroppedItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== element.id);
      handleSave(updatedItems); // Enregistrez après suppression
      return updatedItems;
    });
    setSelectedElement(null);
  };

  // save local storage
  const handleSave = (data = {}) => {
    const itemsToSave = Array.isArray(data.items) ? data.items : droppedItems;

    const saveData = {
      userId: userId,
      backgroundColor: dropZoneBackgroundColor,
      items: itemsToSave.map((item) => ({ ...item })),
    };

    console.log("Drop zone saved:", saveData);
    localStorage.setItem("dropZoneData", JSON.stringify(saveData));
  };

  // Charger les données depuis le localStorage
  const handleLoad = () => {
    const savedData = localStorage.getItem("dropZoneData");
    if (savedData) {
      const { items, backgroundColor } = JSON.parse(savedData);
      setDropZoneBackgroundColor(backgroundColor);

      if (dropZoneRef.current) {
        const dropZoneBounds = dropZoneRef.current.getBoundingClientRect();

        const updatedItems = items.map((item) => {
          // Conversion des positions de pourcentage à pixels
          const xPos = (item.x / 100) * dropZoneBounds.width;
          const yPos = (item.y / 100) * dropZoneBounds.height;

          return {
            ...item,
            // Si x dépasse la largeur, remettre à 0 ou autre valeur
            x: xPos > dropZoneBounds.width ? 0 : xPos,
            // Si y dépasse la hauteur, remettre à 0 ou autre valeur
            y: yPos > dropZoneBounds.height ? 0 : yPos,
          };
        });

        setDroppedItems(updatedItems);
      }
    }
  };

  // POPUP
  const onOpen = () => {
    setShowPopup(true);
  };

  const onClose = () => {
    setShowPopup(false);
  };

  // Fonction pour soumettre le formulaire
  const handleFormSubmit = (formData) => {
    // Vérifier si la drop zone est disponible
    if (dropZoneRef.current) {
      // Utiliser dom-to-image pour capturer la drop zone
      domtoimage
        .toPng(dropZoneRef.current, {
          style: {
            margin: 0, // Assurez-vous qu'il n'y a pas de marge
            padding: 0, // Assurez-vous qu'il n'y a pas de remplissage
            border: "none", // Assurez-vous qu'il n'y a pas de bordure
          },
        })
        .then((dataUrl) => {
          // Créer une image à partir de l'URL de données
          const img = new Image();
          img.src = dataUrl;

          // Convertir l'URL de données en blob
          fetch(img.src)
            .then((res) => res.blob())
            .then((blob) => {
              // Créer un fichier à partir du blob
              const file = new File([blob], "dropzone-image.png", {
                type: "image/png",
              });

              // Créer un objet FormData pour envoyer l'image avec les données du formulaire
              const formDataWithImage = new FormData();
              formDataWithImage.append("file", file);
              formDataWithImage.append(
                "data",
                JSON.stringify({
                  ...formData, // Données du formulaire
                  userId,
                  droppedItems, // Sauvegarde des éléments dans la drop zone
                  backgroundColor: dropZoneBackgroundColor,
                })
              );

              fetch("http://localhost:9000/api/v1/sheet/create", {
                method: "POST",
                body: formDataWithImage, // Utiliser FormData ici
                credentials: "include", // Assurez-vous que les cookies sont inclus dans la requête
              })
                .then((response) => response.json())
                .then((data) => {
                  console.log("Data saved successfully:", data);
                  setShowPopup(false); // Fermer la popup après sauvegarde
                })
                .catch((error) => console.error("Error saving data:", error));
            });
        })
        .catch((error) => {
          console.error("Error capturing image:", error);
        });
    }
  };

  return (
    <div className="drag">
      <Sidebar
        onAddItem={addItemToDropZone}
        onSave={handleSave}
        onLoad={handleLoad}
        onOpen={onOpen}
      />
      <DropZone
        dropZoneRef={dropZoneRef}
        droppedItems={droppedItems}
        setDroppedItems={setDroppedItems}
        onSelectElement={handleElementSelect}
        setSelectedElement={setSelectedElement}
        backgroundColor={dropZoneBackgroundColor}
        onUpdateElement={handleElementUpdate}
        onMoveElement={handleElementMove}
      />
      <PropertiesPanel
        selectedElement={selectedElement}
        onUpdate={handleElementUpdate}
        onDelete={handleElementDelete}
        setSelectedElement={setSelectedElement}
        onBackgroundColorChange={setDropZoneBackgroundColor}
        dropZoneBackgroundColor={dropZoneBackgroundColor}
      />
      {/* Popup */}
      {showPopup && (
        <SavePopup onClick={onClose} onSubmitForm={handleFormSubmit} />
      )}
    </div>
  );
};

export default Drag;
