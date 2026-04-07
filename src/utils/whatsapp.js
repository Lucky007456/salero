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

  let txt = `🍌 *ALPHOVINS GLOBAL AGRO EXPORTS*\n\n`;
  txt += `Hello ${bill.merchantName || 'Sir/Madam'},\n\n`;
  txt += `Your bill dated *${dateStr}* (ID: ${bill.billId}) for *${varietyLabel}* has been generated.\n\n`;
  
  if (bill.paymentStatus === 'paid') {
    txt += `💵 *Amount Paid:* ${formatINR(bill.totalAmount)} ✅\n\n`;
  } else if (bill.paymentStatus === 'partial') {
    const balance = (bill.totalAmount || 0) - (bill.amountPaid || 0);
    txt += `💵 *Total Bill:* ${formatINR(bill.totalAmount)}\n`;
    txt += `🔴 *Balance Due:* ${formatINR(balance)} ⚠️\n\n`;
  } else {
    txt += `🔴 *Amount Due:* ${formatINR(bill.totalAmount)} 🔴\n\n`;
  }

  txt += `📎 *Please find your official detailed PDF invoice attached below.*\n\n`;
  
  if (prefs.whatsappGreeting && prefs.whatsappGreeting.trim()) {
    txt += `💬 _${prefs.whatsappGreeting}_\n`;
  }

  return txt;
}
