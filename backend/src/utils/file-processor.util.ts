import fs from 'fs';
import path from 'path';
const pdf: any = require('pdf-parse');
import mammoth from 'mammoth';

export class FileProcessor {
  /**
   * Extract text content from a file based on its extension.
   * Supported formats: .pdf, .docx, .txt
   */
  static async extractText(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return '';
      }

      const ext = path.extname(filePath).toLowerCase();

      switch (ext) {
        case '.pdf':
          return await this.extractFromPdf(filePath);
        case '.docx':
          return await this.extractFromDocx(filePath);
        case '.txt':
          return await this.extractFromTxt(filePath);
        default:
          console.warn(`Unsupported file type: ${ext} for file ${filePath}`);
          return '';
      }
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
      return '';
    }
  }

  private static async extractFromPdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private static async extractFromDocx(filePath: string): Promise<string> {
     const result = await mammoth.extractRawText({ path: filePath });
     return result.value;
  }

  private static async extractFromTxt(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf-8');
  }
}
