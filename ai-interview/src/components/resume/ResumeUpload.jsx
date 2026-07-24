import { useState, useRef } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import styles from './ResumeUpload.module.css';

export default function ResumeUpload({ resume, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await handleUpload(file);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) await handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      if (onUpload) await onUpload(file);
    } finally {
      setUploading(false);
    }
  };

  // Already uploaded — show status
  if (resume?.parsed_json) {
    return (
      <div className={styles.uploaded}>
        <div className={styles.fileInfo}>
          <div className={styles.fileIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 2h8l4 4v12a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <div className={`${styles.fileName} data-text`}>
              {resume.file_path?.split('/').pop() || 'resume.pdf'}
            </div>
            <Badge variant="completed">Parsed</Badge>
          </div>
        </div>
        {resume.parsed_json.skills && (
          <div className={styles.skills}>
            {resume.parsed_json.skills.slice(0, 6).map((skill, i) => (
              <Badge key={i} variant="navy" mono>{skill}</Badge>
            ))}
            {resume.parsed_json.skills.length > 6 && (
              <Badge variant="default" mono>+{resume.parsed_json.skills.length - 6}</Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  // Upload zone
  return (
    <div
      className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className={styles.fileInput}
      />

      {uploading ? (
        <div className={styles.uploading}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} />
          </div>
          <span className="data-text">Uploading & parsing...</span>
        </div>
      ) : (
        <>
          <div className={styles.uploadIcon}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 20V8m0 0l-5 5m5-5l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 22v4a2 2 0 002 2h16a2 2 0 002-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <p className={styles.dropText}>
            Drop your resume here or <span className={styles.link}>browse</span>
          </p>
          <p className={styles.hint}>PDF format only</p>
        </>
      )}
    </div>
  );
}
