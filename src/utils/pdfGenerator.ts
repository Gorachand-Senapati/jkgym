import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Member, TherapySession } from '../context/GymContext';


const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to load image", e);
    return '';
  }
};

const addHeader = async (doc: jsPDF) => {
  try {
    const logoBase64 = await fetchImageAsBase64('/whitelogo.jpeg');
    if (logoBase64) {
      doc.addImage(logoBase64, 'JPEG', 15, 10, 30, 30);
    }
  } catch (e) {
    // Ignore if image loading fails
  }

  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38); // Red color for gym name
  doc.text('JK MULTI GYM N PAIN REHAB CENTRE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Branch - Belghoria', 105, 28, { align: 'center' });
  doc.text('Branch Code - BGL0001', 105, 34, { align: 'center' });
  doc.text('Proprietor Name - Jaydeb Karmakar', 105, 40, { align: 'center' });
  doc.text('Gym Contact Number - 8585007016', 105, 46, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 52, 196, 52);
  return 58; // Returns the Y position after header
};

export const generateBillingPDF = async (member: Member, amount: number, offer: string, date: string, paymentMethod: string) => {
  const doc = new jsPDF();
  const startY = await addHeader(doc);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Payment Receipt', 105, startY, { align: 'center' });

  const receiptInfo = [
    ['Receipt Date:', date || ''],
    ['Member ID:', member?.id || ''],
    ['Member Name:', member?.name || ''],
    ['Contact:', member?.phone || ''],
    ['Particulars (Offer):', offer || ''],
    ['Payment Method:', paymentMethod ? paymentMethod.toUpperCase() : 'CASH']
  ];

  autoTable(doc, {
    startY: startY + 10,
    body: receiptInfo,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 100 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;


  autoTable(doc, {
    startY: finalY + 10,
    head: [['Description', 'Amount (Rs.)']],
    body: [
      [offer || '', amount.toString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 12, halign: 'left' },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const grandTotalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`Total Amount Paid: Rs. ${amount}`, 196, grandTotalY, { align: 'right' });

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for choosing JK Multi Gym & Pain Rehab Centre!', 105, 280, { align: 'center' });

  // 100% foolproof manual download trigger
  const fileName = `Receipt_${(member?.name || 'Member').replace(/\s+/g, '_')}_${date}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateTherapyPDF = async (session: TherapySession) => {
  const doc = new jsPDF();
  const startY = await addHeader(doc);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Therapy Session Bill', 105, startY, { align: 'center' });

  const receiptInfo = [
    ['Bill Date:', session.date],
    ['Client Name:', session.clientName],
    ['Contact (WhatsApp):', session.whatsapp],
    ['Therapy Detail:', session.therapyName]
  ];

  autoTable(doc, {
    startY: startY + 10,
    body: receiptInfo,
    theme: 'plain',
    styles: { fontSize: 12, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 100 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY || startY + 50;

  autoTable(doc, {
    startY: finalY + 10,
    head: [['Description', 'Amount (Rs.)']],
    body: [
      [`Therapy: ${session.therapyName}`, session.amount.toString()]
    ],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 12, halign: 'left' },
    columnStyles: {
      1: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const grandTotalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text(`Total Amount Paid: Rs. ${session.amount}`, 196, grandTotalY, { align: 'right' });

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Wish you a speedy recovery! - JK Multi Gym & Pain Rehab Centre', 105, 280, { align: 'center' });

  // 100% foolproof manual download trigger
  const fileName = `TherapyBill_${session.clientName.replace(/\s+/g, '_')}_${session.date}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
