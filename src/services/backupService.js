import { getAllBills, getDeletedBills } from './billService';
import { getPreferences } from './preferenceService';
import { formatMonthYear } from '../utils/format';

export async function downloadDatabaseBackup() {
  try {
    const [activeBills, deletedBills, preferences] = await Promise.all([
      getAllBills(),
      getDeletedBills(),
      getPreferences()
    ]);

    const backupData = {
      exportDate: new Date().toISOString(),
      app: "Salero Wholesale Billing",
      version: "1.0.0",
      preferences,
      bills: {
        active: activeBills,
        deleted: deletedBills
      }
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    // e.g. "April-2026"
    const dateStr = new Date().toISOString().substring(0, 7);
    const monthStr = formatMonthYear(dateStr).replace(/\s+/g, '-');
    
    a.download = `Salero_Backup_${monthStr}.json`;
    
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (err) {
    console.error("Database backup failed:", err);
    return false;
  }
}
