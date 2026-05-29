"use client";

import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { checkUnpaidFees } from "@/lib/fee-utils";
import { IoImageOutline, IoInformationCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { t, localizeHref } = useLanguage();
  
  const [totalFee, setTotalFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`${localizeHref("/login")}?redirect=${encodeURIComponent(localizeHref("/checkout"))}`);
    }
  }, [user, authLoading, router, localizeHref]);

  useEffect(() => {
    async function loadFees() {
      if (user) {
        const fees = await checkUnpaidFees(user.id, user.email);
        if (fees.hasUnpaid && fees.totalFee > 0) {
          setTotalFee(fees.totalFee);
        } else {
          // No unpaid fees
          setTotalFee(0);
        }
        setLoading(false);
      }
    }
    loadFees();
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setErrorMsg("Please upload a screenshot of your payment.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const fileName = `${user?.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event_pic') // reusing existing bucket for simplicity
        .upload(`payments/${fileName}`, image);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('event_pic')
        .getPublicUrl(`payments/${fileName}`);

      // Insert into payments table
      const { error: dbError } = await supabase.from('payments').insert({
        user_id: user!.id,
        amount: totalFee,
        screenshot_url: publicUrl,
        status: 'pending'
      });

      if (dbError) throw dbError;

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to submit payment. Please try again or contact support.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="loading-spinner-small"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar />
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px', paddingTop: '80px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Payment Checkout</h1>
        
        {totalFee === 0 ? (
          <div style={{ padding: '24px', backgroundColor: 'var(--card-background)', borderRadius: '12px', textAlign: 'center' }}>
            <IoCheckmarkCircleOutline size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h2>You're all caught up!</h2>
            <p style={{ color: 'var(--secondary-text)' }}>You have no unpaid fees.</p>
            <button 
              onClick={() => router.push(localizeHref('/'))}
              style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Back to Home
            </button>
          </div>
        ) : success ? (
          <div style={{ padding: '24px', backgroundColor: 'var(--card-background)', borderRadius: '12px', textAlign: 'center' }}>
            <IoCheckmarkCircleOutline size={48} color="var(--success)" style={{ marginBottom: '16px' }} />
            <h2>Payment Submitted</h2>
            <p style={{ color: 'var(--secondary-text)' }}>Your payment screenshot has been uploaded and is waiting for admin verification. Once verified, you will be able to create events again.</p>
            <button 
              onClick={() => router.push(localizeHref('/'))}
              style={{ marginTop: '24px', padding: '12px 24px', backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card-background)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border)' }}>
            <div style={{ backgroundColor: 'rgba(255, 69, 58, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <IoInformationCircleOutline size={24} color="#ff453a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 8px 0', color: '#ff453a', fontSize: '16px' }}>Action Required</h3>
                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>You have unpaid fees from your past events. Please transfer the exact amount below using InstaPay and upload the receipt.</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p style={{ fontSize: '16px', color: 'var(--secondary-text)', marginBottom: '8px' }}>Total Amount Due</p>
              <h2 style={{ fontSize: '42px', margin: '0 0 8px 0', color: 'var(--primary)' }}>{totalFee} <span style={{ fontSize: '20px' }}>EGP</span></h2>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Scan to Pay via InstaPay</h3>
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
                <img src="/qr.jpg" alt="InstaPay QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
              </div>
              <p style={{ fontSize: '14px', color: 'var(--secondary-text)', marginBottom: '12px' }}>Or use the payment link:</p>
              <a 
                href="https://ipn.eg/S/omarrmdn/instapay/2wJsRd" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', padding: '12px 24px', backgroundColor: 'var(--primary-transparent)', borderRadius: '8px', display: 'inline-block' }}
              >
                Open InstaPay App
              </a>
            </div>

            <form onSubmit={handleSubmit}>
              <h3 style={{ margin: '0 0 16px 0' }}>Upload Screenshot</h3>
              <p style={{ fontSize: '13px', color: 'var(--secondary-text)', marginBottom: '16px' }}>Please take a screenshot of your successful transfer message and upload it here.</p>
              
              <div 
                style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '12px', 
                  padding: imagePreview ? '8px' : '40px 20px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '24px',
                  backgroundColor: 'var(--background)'
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }} />
                ) : (
                  <>
                    <IoImageOutline size={48} color="var(--secondary-text)" style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Tap to upload screenshot</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--secondary-text)' }}>JPG, PNG up to 5MB</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
                accept="image/*"
              />

              {errorMsg && (
                <div style={{ color: 'var(--error)', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || !image}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  backgroundColor: image ? 'var(--primary)' : 'var(--border)', 
                  color: '#fff', 
                  borderRadius: '12px', 
                  border: 'none', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  cursor: image ? 'pointer' : 'not-allowed',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
