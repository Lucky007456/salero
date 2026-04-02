import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { formatDate, BANANA_VARIETIES } from '../utils/format';

// PDF-safe currency formatter (jsPDF's built-in fonts don't support ₹)
function formatPDFCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0.00';
  const num = Number(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const formatted = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = formatted + ',' + last3;
  }
  const result = `Rs. ${intPart}.${decPart}`;
  return isNegative ? `-${result}` : result;
}

export function generateBillPDF(bill) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ---- HEADER ----
  doc.setFillColor(20, 83, 45);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ALPHOVINS GLOBAL AGRO EXPORTS', pageWidth / 2, 18, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Banana Cultivation & Trading | Tamil Nadu, India', pageWidth / 2, 26, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SALE BILL', pageWidth / 2, 38, { align: 'center' });

  y = 55;

  // ---- BILL INFO BOX ----
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'S');
  
  doc.setTextColor(20, 83, 45);
  doc.setFontSize(10);
  
  // Left column — consistent label/value positions
  const leftLabelX = margin + 5;
  const leftValueX = margin + 30;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Bill ID:', leftLabelX, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(String(bill.billId || 'N/A'), leftValueX, y + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', leftLabelX, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(String(formatDate(bill.saleDate)), leftValueX, y + 16);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Merchant:', leftLabelX, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(String(bill.merchantName || 'N/A'), leftValueX, y + 24);
  
  // Right column — consistent label/value positions
  const rightLabelX = pageWidth / 2 + 10;
  const rightValueX = rightLabelX + 25;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Variety:', rightLabelX, y + 8);
  doc.setFont('helvetica', 'normal');
  const variety = BANANA_VARIETIES.find(v => v.value === bill.bananaVariety);
  doc.text(String(variety ? variety.label : (bill.customVariety || bill.bananaVariety || 'N/A')), rightValueX, y + 8);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', rightLabelX, y + 16);
  doc.setFont('helvetica', 'normal');
  const statusText = bill.paymentStatus === 'paid' ? 'PAID' : 
                     bill.paymentStatus === 'partial' ? 'PARTIAL' : 'PENDING';
  const statusColor = bill.paymentStatus === 'paid' ? [34, 197, 94] : 
                      bill.paymentStatus === 'partial' ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(...statusColor);
  doc.text(statusText, rightValueX, y + 16);

  y += 40;

  // ---- WEIGHT TABLE ----
  doc.setTextColor(20, 83, 45);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Weight Details', margin, y);
  y += 5;

  const weightRows = (bill.weightEntries || []).map((entry, i) => [
    i + 1,
    entry.quantity || 0,
    `${Number(entry.weight || 0).toFixed(2)} kg`,
  ]);

  weightRows.push([
    { content: 'TOTAL', colSpan: 1, styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } },
    { content: bill.totalQuantity || 0, styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } },
    { content: `${Number(bill.grossWeight || 0).toFixed(2)} kg`, styles: { fontStyle: 'bold', fillColor: [220, 252, 231] } },
  ]);

  autoTable(doc, {
    startY: y,
    head: [['S.No', 'Quantity (Thars)', 'Weight (kg)']],
    body: weightRows,
    theme: 'grid',
    headStyles: {
      fillColor: [22, 101, 52],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [20, 83, 45],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 244],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 60, halign: 'center' },
      2: { halign: 'right' },
    },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ---- CALCULATION SUMMARY ----
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 83, 45);
  doc.text('Bill Summary', margin, y);
  y += 5;

  const summaryData = [
    ['Gross Weight', `${Number(bill.grossWeight || 0).toFixed(2)} kg`],
    ['Wastage', `${Number(bill.wastage || 0).toFixed(2)} kg`],
    ['Net Weight', `${Number(bill.netWeight || 0).toFixed(2)} kg`],
    ['Rate per kg', formatPDFCurrency(bill.ratePerKg || 0)],
    ['Total Amount', formatPDFCurrency(bill.totalAmount || 0)],
  ];

  if (bill.paymentStatus === 'partial') {
    summaryData.push(
      ['Amount Paid', formatPDFCurrency(bill.amountPaid || 0)],
      ['Balance Due', formatPDFCurrency((bill.totalAmount || 0) - (bill.amountPaid || 0))]
    );
  }

  autoTable(doc, {
    startY: y,
    body: summaryData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 10,
      textColor: [20, 83, 45],
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
    didParseCell: function(data) {
      if (data.row.index === summaryData.length - 1 || 
          (data.row.cells[0] && data.row.cells[0].raw && String(data.row.cells[0].raw).includes('Total Amount'))) {
        data.cell.styles.fontSize = 12;
        data.cell.styles.fillColor = [220, 252, 231];
      }
    }
  });

  y = doc.lastAutoTable.finalY + 15;

  // ---- FOOTER ----
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  
  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text('This is a computer-generated bill.', pageWidth / 2, y, { align: 'center' });
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, pageWidth / 2, y + 5, { align: 'center' });

  return doc;
}

// Build a clean filename: BILL-2026-001_Kumar_Traders.pdf
function buildFilename(bill) {
  const billId = bill.billId || 'bill';
  const merchant = (bill.merchantName || 'unknown')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${billId}_${merchant}.pdf`;
}

export function downloadBillPDF(bill) {
  try {
    const doc = generateBillPDF(bill);
    const filename = buildFilename(bill);
    const blob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);

    // Open PDF in a new tab — 100% reliable, user can view/print/save
    const pdfWindow = window.open(blobUrl, '_blank');
    
    if (pdfWindow) {
      // Set the tab title to the filename
      pdfWindow.addEventListener('load', () => {
        try { pdfWindow.document.title = filename; } catch(e) {}
      });
    } else {
      // Popup blocked — fallback to file-saver download
      saveAs(blob, filename);
    }

    // Also try a direct download as backup
    setTimeout(() => {
      try {
        saveAs(blob, filename);
      } catch(e) {
        // Ignore — user already has the PDF open in a tab
      }
    }, 500);

    // Cleanup blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error('PDF generation error:', err);
    alert('Failed to generate PDF. Please try again.');
  }
}

export function getBillPDFBlob(bill) {
  const doc = generateBillPDF(bill);
  return new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
}
