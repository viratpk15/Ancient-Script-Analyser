import React, { useRef, useState } from 'react';
import './ImageUpload.css';

interface Props {
  onSelectImage: (file: File) => void;
}

const FLOATING_GLYPHS = ['𒀭', '𒆠', '𒁹', '𒈗'];

const ImageUpload: React.FC<Props> = ({ onSelectImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onSelectImage(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="upload-container glass-panel fade-in">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Floating cuneiform backdrop */}
        <div className="glyph-field" aria-hidden="true">
          {FLOATING_GLYPHS.map((g, i) => (
            <span key={i} className={`float-glyph fg-${i + 1}`}>{g}</span>
          ))}
        </div>

        <div className="upload-icon-wrap">
          <span className="pulse-ring ring-a" />
          <span className="pulse-ring ring-b" />
          <span className="upload-icon">🏺</span>
        </div>

        <h2>Drop your inscription here</h2>
        <p>or click to browse — PNG, JPG or WEBP</p>
        <button className="btn-primary mt-4">Select File</button>

        <div className="upload-mini-steps">
          <span>01 · Upload</span>
          <span className="ms-arrow">→</span>
          <span>02 · Analyse</span>
          <span className="ms-arrow">→</span>
          <span>03 · Decode</span>
        </div>

        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={(e) => e.target.files && onSelectImage(e.target.files[0])}
        />
      </div>
    </div>
  );
};

export default ImageUpload;
