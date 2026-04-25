import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BillDetail from './BillDetail';
import { getBillById } from '../services/billService';

export default function BillDetailWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bill, setBill] = useState(location.state?.bill || null);
  const [loading, setLoading] = useState(!bill);

  useEffect(() => {
    if (!bill && id) {
      const fetchBill = async () => {
        try {
          const fetchedBill = await getBillById(id);
          setBill(fetchedBill);
        } catch (error) {
          console.error("Failed to fetch bill", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBill();
    }
  }, [id, bill]);

  const handleBack = () => navigate(-1);
  const handleUpdate = () => {
    // Optionally trigger a refetch or just navigate back
    navigate('/admin/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-20 text-green-500/50">
        Bill not found.
      </div>
    );
  }

  return <BillDetail bill={bill} onBack={handleBack} onUpdate={handleUpdate} />;
}
