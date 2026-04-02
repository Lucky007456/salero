import { formatINR, formatDate, BANANA_VARIETIES } from './format';
import { getPreferences } from '../services/preferenceService';

export async function getWhatsAppShareUrl(billData) {
  const message = await generateWhatsAppMessage(billData);
  const encodedMessage = encodeURIComponent(message);
  
  if (billData.merchantPhone && billData.merchantPhone.trim() !== '') {
    // Basic cleanup of phone number (remove spaces, ensure country code)
    let phone = billData.merchantPhone.replace(/[\s\-\(\)]/g, '');
    if (!phone.startsWith('+')) {
      if (phone.length === 10) phone = '91' + phone; // Default to India if 10 digits
    } else {
      phone = phone.substring(1); // remove +
    }
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }
  
  // No phone, just open WhatsApp selection
  return `https://wa.me/?text=${encodedMessage}`;
}

export async function generateWhatsAppMessage(bill) {
  const prefs = await getPreferences();
  
  const varietyLabel = bill.bananaVariety === 'custom' 
    ? bill.customVariety 
    : BANANA_VARIETIES.find(v => v.value === bill.bananaVariety)?.label || 'Unknown';

  const dateStr = formatDate(bill.saleDate);
  const timestamp = new Date().toLocaleString('en-IN');

  const divider = '———————————————';

  let txt = `🍌 *ALPHOVINS GLOBAL AGRO EXPORTS*\n`;
  txt += `${divider}\n`;
  txt += `📋 *Bill No:* ${bill.billId}\n`;
  txt += `📅 *Date:* ${dateStr}\n`;
  txt += `👤 *Merchant:* ${bill.merchantName || 'N/A'}\n`;
  txt += `🍌 *Variety:* ${varietyLabel}\n`;
  txt += `${divider}\n`;
  txt += `*WEIGHT DETAILS / எடை விவரம்*\n\n`;

  // ASCII Table for weight entries
  // Padding logic for neat columns (though WA monospace isn't guaranteed, this is standard)
  /* 
    | Qty | Weight |
    |-----|--------|
    | 4   | 60 kg  |
  */
  // Wait, WhatsApp does not support monospace perfectly unless we use ```, but users prefer normal text tables.
  txt += `| Qty | Weight |\n`;
  txt += `|-----|--------|\n`;
  (bill.weightEntries || []).forEach(e => {
    const qtyPad = String(e.quantity).padEnd(3, ' ');
    const wtPad = String(e.weight).padEnd(4, ' ');
    txt += `| ${qtyPad} | ${wtPad} kg |\n`;
  });
  txt += `\n${divider}\n`;
  txt += `📦 *Total Quantity:* ${bill.totalQuantity} thars\n`;
  txt += `⚖️ *Gross Weight:* ${(bill.grossWeight || 0).toFixed(2)} kg\n`;
  if (bill.wastage > 0) {
    txt += `🗑️ *Wastage:* ${(bill.wastage || 0).toFixed(2)} kg\n`;
  }
  txt += `✅ *Net Weight:* ${(bill.netWeight || 0).toFixed(2)} kg\n`;
  txt += `${divider}\n`;
  txt += `💰 *Rate:* ${formatINR(bill.ratePerKg)} / kg\n`;
  txt += `💵 *Total Amount:* ${formatINR(bill.totalAmount)}\n`;
  txt += `${divider}\n`;

  // Payment Status block
  if (bill.paymentStatus === 'paid') {
    txt += `💳 *Payment Status:* Paid ✅\n`;
    txt += `💵 *Amount Received:* ${formatINR(bill.totalAmount)}\n`;
  } else if (bill.paymentStatus === 'partial') {
    const balance = (bill.totalAmount || 0) - (bill.amountPaid || 0);
    txt += `💳 *Payment Status:* Partial ⚠️\n`;
    txt += `💵 *Amount Paid:* ${formatINR(bill.amountPaid)}\n`;
    txt += `🔴 *Balance Due:* ${formatINR(balance)}\n`;
  } else {
    txt += `💳 *Payment Status:* Pending 🔴\n`;
    txt += `🔴 *Amount Due:* ${formatINR(bill.totalAmount)}\n`;
  }

  txt += `${divider}\n`;
  if (prefs.whatsappGreeting && prefs.whatsappGreeting.trim()) {
    txt += `💬 ${prefs.whatsappGreeting}\n`;
    txt += `${divider}\n`;
  }
  txt += `_ALPHOVINS GLOBAL AGRO EXPORTS_\n`;
  txt += `_Generated on ${timestamp}_\n`;

  return txt;
}
