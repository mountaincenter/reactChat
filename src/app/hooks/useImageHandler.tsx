import { useState } from "react";

interface UseImageHandlerResult {
  selectedFile: File | null;
  capturedImage: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImageCaptured: (imageSrc: string) => void;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setCapturedImage: React.Dispatch<React.SetStateAction<string | null>>;
}

const useImageHandler = (): UseImageHandlerResult => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsEditing(true);
    }
  };

  const handleImageCaptured = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setIsEditing(true);
  };

  return {
    selectedFile,
    capturedImage,
    handleFileChange,
    handleImageCaptured,
    isEditing,
    setIsEditing,
    setSelectedFile,
    setCapturedImage,
  };
};

export default useImageHandler;
