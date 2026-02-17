export const parseDocx = async (file: File | ArrayBuffer): Promise<string> => {
    try {
        const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
        // Dynamically import mammoth to reduce initial bundle size
        const mammoth = await import('mammoth');

        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value; // The generated raw text
    } catch (error) {
        console.error('Error parsing DOCX:', error);
        throw new Error('Failed to parse DOCX file. Please ensure it is a valid document.');
    }
};

/**
 * Prepares a PDF file for processing by the Gemini File API.
 * Currently, we convert the file to a base64 string for easier transport
 * or direct inclusion in the Gemini API request.
 * @param file The PDF file object
 * @returns Promise resolving to a base64 string and metadata
 */
export const preparePdf = async (file: File): Promise<{ base64: string; mimeType: string; filename: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1] ?? '';
            resolve({
                base64: base64String,
                mimeType: file.type,
                filename: file.name
            });
        };
        reader.onerror = (error) => {
            console.error('Error reading PDF file:', error);
            reject(new Error('Failed to read PDF file for processing.'));
        };
        reader.readAsDataURL(file);
    });
};
