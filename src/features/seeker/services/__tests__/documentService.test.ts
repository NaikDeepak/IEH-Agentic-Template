import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDocx, preparePdf } from '../documentService';

// Mock mammoth
vi.mock('mammoth', () => ({
  extractRawText: vi.fn().mockResolvedValue({ value: 'Extracted text from DOCX' })
}));

describe('documentService', () => {
  describe('parseDocx', () => {
    it('extracts text from a File object', async () => {
      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10))
      } as unknown as File;

      const text = await parseDocx(mockFile);
      expect(text).toBe('Extracted text from DOCX');
    });

    it('extracts text from an ArrayBuffer', async () => {
      const mockBuffer = new ArrayBuffer(10);
      const text = await parseDocx(mockBuffer);
      expect(text).toBe('Extracted text from DOCX');
    });

    it('throws error on failure', async () => {
      const mammoth = await import('mammoth');
      (mammoth.extractRawText as any).mockRejectedValueOnce(new Error('Mammoth error'));
      
      const mockBuffer = new ArrayBuffer(10);
      await expect(parseDocx(mockBuffer)).rejects.toThrow('Failed to parse DOCX file');
    });
  });

  describe('preparePdf', () => {
    it('reads a file as base64', async () => {
      // Mock FileReader using a class
      class MockFileReader {
        result: string = '';
        onload: (() => void) | null = null;
        onerror: ((err: Error) => void) | null = null;
        readAsDataURL() {
          this.result = 'data:application/pdf;base64,bW9jay1iYXNlNjQ=';
          if (this.onload) this.onload();
        }
      }
      vi.stubGlobal('FileReader', MockFileReader);

      const mockFile = {
        type: 'application/pdf',
        name: 'test.pdf'
      } as unknown as File;

      const result = await preparePdf(mockFile);

      expect(result.base64).toBe('bW9jay1iYXNlNjQ=');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.filename).toBe('test.pdf');
    });

    it('rejects on FileReader error', async () => {
      class MockFileReaderError {
        onload: (() => void) | null = null;
        onerror: ((err: Error) => void) | null = null;
        readAsDataURL() {
          if (this.onerror) this.onerror(new Error('Read error'));
        }
      }
      vi.stubGlobal('FileReader', MockFileReaderError);

      const mockFile = {} as unknown as File;

      await expect(preparePdf(mockFile)).rejects.toThrow('Failed to read PDF file');
    });
  });
});
