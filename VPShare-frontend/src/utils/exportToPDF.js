import html2pdf from 'html2pdf.js';

/**
 * Exports a specific HTML element to a PDF file.
 * @param {string} elementId - The ID of the element to be converted to PDF.
 * @param {string} fileName - The desired name for the output PDF file.
 */
export const exportToPDF = (elementId, fileName = 'resume.pdf') => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return;
  }

  const opt = {
    margin:       0.5,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().from(element).set(opt).save();
};