import React from 'react';
import { getWhatsAppShareUrl, generateWhatsAppMessage } from '../utils/whatsapp';
import { getBillPDFBlob, buildFilename } from '../services/pdfService';

// Internal SVG for WhatsApp Icon (since lucide-react doesn't have official WA logo)
const WhatsAppIcon = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} height={size} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
    <path d="M9 10a8.5 8.5 0 0 0 8.5 8.5" />
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.672.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.065-.297-.15-1.265-.462-2.406-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.297-.019-.461.13-.606.134-.131.295-.352.443-.531.148-.176.197-.298.297-.497.101-.197.05-.371-.025-.521-.075-.148-.672-1.62-.922-2.206-.24-.579-.481-.501-.672-.51l-.572-.01c-.198 0-.52.074-.792.372-.271.295-1.04 1.015-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.195 2.095 3.195 5.076 4.478.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.767-.722 2.016-1.421.248-.7.248-1.299.174-1.422-.075-.122-.272-.194-.571-.343z"/>
  </svg>
);

export default function WhatsAppShareButton({ bill, variant = 'pill', className = '' }) {
  const handleShare = async (e) => {
    e.stopPropagation(); // prevent clicking card underneath
    
    try {
      // Create PDF Blob
      const pdfBlob = getBillPDFBlob(bill);
      const filename = buildFilename(bill);
      const file = new File([pdfBlob], filename, { type: 'application/pdf' });
      
      const messageText = await generateWhatsAppMessage(bill);

      // Check if native sharing supports files (works great on Mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bill ${bill.billId}`,
          text: messageText
        });
        return;
      }
    } catch (err) {
      console.log('Native share failed or fell through, using Web fallback', err);
      // If user cancelled, don't drop to fallback
      if (err.name === 'AbortError') return; 
    }

    // Fallback exactly to the classic web approach (but it only sends text)
    const url = await getWhatsAppShareUrl(bill);
    window.open(url, '_blank');
  };

  if (variant === 'icon') {
    return (
      <button 
        onClick={handleShare}
        className={`w-10 h-10 rounded-full flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all transform hover:scale-110 active:scale-95 border border-[#25D366]/30 ${className}`}
        title="Share on WhatsApp"
      >
        <WhatsAppIcon size={20} />
      </button>
    );
  }

  // Pill variant
  return (
    <button 
      onClick={handleShare}
      className={`w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BE5A] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] active:scale-95 ${className}`}
    >
      <WhatsAppIcon size={22} className="fill-current text-white" />
      <span>Share on WhatsApp <span className="text-sm opacity-90 mx-1">/</span> வாட்ஸ்ப்பில் அனுப்பு</span>
    </button>
  );
}
