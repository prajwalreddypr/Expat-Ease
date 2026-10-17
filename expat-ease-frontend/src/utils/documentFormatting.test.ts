import { describe, expect, it } from 'vitest';
import { formatFileSize, getFileIcon } from './documentFormatting';

describe('document formatting', () => {
  it('formats byte sizes using readable units', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('selects icons from document content types', () => {
    expect(getFileIcon('application/pdf')).toBe('📄');
    expect(getFileIcon('image/png')).toBe('🖼️');
    expect(getFileIcon('application/msword')).toBe('📝');
    expect(getFileIcon('text/plain')).toBe('📎');
  });
});
