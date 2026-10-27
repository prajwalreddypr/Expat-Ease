export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const unitSize = 1024;
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(unitSize));
  return `${parseFloat((bytes / Math.pow(unitSize, unitIndex)).toFixed(2))} ${units[unitIndex]}`;
};

export const formatDocumentDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const getFileIcon = (contentType: string): string => {
  if (contentType.includes('pdf')) return '📄';
  if (contentType.includes('image')) return '🖼️';
  if (contentType.includes('word')) return '📝';
  return '📎';
};
