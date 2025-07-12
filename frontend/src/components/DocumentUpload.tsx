import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  Article,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useLegalResearchStore } from '../store/legalStore';
import { legalApi } from '../services/legalApi';

const DocumentUpload: React.FC = () => {
  const {
    uploadedDocuments,
    isUploading,
    uploadProgress,
    setIsUploading,
    setUploadProgress,
    addUploadedDocument,
    setUploadedDocuments,
  } = useLegalResearchStore();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setSuccess(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FileList-like object
      const fileList = Object.assign(acceptedFiles, {
        item: (index: number) => acceptedFiles[index] || null,
        namedItem: (name: string) => acceptedFiles.find(file => file.name === name) || null,
      }) as FileList;

      const response = await legalApi.uploadDocuments(fileList);
      
      response.documents.forEach(doc => {
        addUploadedDocument(doc);
      });

      setSuccess(`Successfully uploaded ${response.total_uploaded} document(s)`);
      
      // Refresh the documents list
      refreshDocuments();
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }, [addUploadedDocument, setIsUploading, setUploadProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: true,
    maxFiles: 10,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const refreshDocuments = async () => {
    try {
      const docs = await legalApi.getUploadedDocuments();
      setUploadedDocuments(docs);
    } catch (err) {
      console.error('Failed to refresh documents:', err);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await legalApi.deleteDocument(documentId);
      const updatedDocs = uploadedDocuments.filter(doc => doc.document_id !== documentId);
      setUploadedDocuments(updatedDocs);
      setSuccess('Document deleted successfully');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete document');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case '.pdf':
        return <PictureAsPdf color="error" />;
      case '.doc':
      case '.docx':
        return <Description color="primary" />;
      case '.txt':
        return <Article color="info" />;
      default:
        return <Description />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  React.useEffect(() => {
    refreshDocuments();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Document Upload
      </Typography>

      {/* Upload Area */}
      <Paper
        elevation={3}
        sx={{
          mb: 3,
          p: 3,
          border: isDragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
          transition: 'all 0.3s ease',
        }}
      >
        <div {...getRootProps()}>
          <motion.div
            style={{ cursor: 'pointer', textAlign: 'center' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: PDF, DOC, DOCX, TXT (Max 50MB per file, 10 files max)
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            sx={{ mt: 2 }}
            disabled={isUploading}
          >
            Select Files
          </Button>
          </motion.div>
        </div>
      </Paper>

      {/* Upload Progress */}
      {isUploading && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Uploading documents...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {uploadProgress}% complete
          </Typography>
        </Paper>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Uploaded Documents List */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Uploaded Documents ({uploadedDocuments.length})
          </Typography>
          <Button onClick={refreshDocuments} variant="outlined" size="small">
            Refresh
          </Button>
        </Box>

        {uploadedDocuments.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No documents uploaded yet. Upload some documents to start using the RAG pipeline.
          </Typography>
        ) : (
          <List>
            {uploadedDocuments.map((doc) => (
              <motion.div
                key={doc.document_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ListItem
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    {getFileIcon(doc.file_type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.filename}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          label={doc.file_type.toUpperCase()}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={formatFileSize(doc.file_size)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setPreviewDoc(doc)}
                      title="View details"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteDocument(doc.document_id)}
                      title="Delete document"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              </motion.div>
            ))}
          </List>
        )}
      </Paper>

      {/* Document Preview Dialog */}
      <Dialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Document Details</DialogTitle>
        <DialogContent>
          {previewDoc && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Filename:</strong> {previewDoc.filename}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Type:</strong> {previewDoc.file_type}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Size:</strong> {formatFileSize(previewDoc.file_size)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Document ID:</strong> {previewDoc.document_id}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>File Path:</strong> {previewDoc.file_path}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDoc(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentUpload;
