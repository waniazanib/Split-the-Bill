import { useRef } from 'react';
import { useApp } from '../AppContext';

export default function Screen1() {
  const { dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        dispatch({ type: 'SET_RECEIPT_IMAGE', payload: result });
        dispatch({ type: 'SET_SCREEN', payload: 2 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const handleManualEntry = () => {
    dispatch({ type: 'SET_RECEIPT_IMAGE', payload: null });
    dispatch({ type: 'SET_SCREEN', payload: 3 });
  };

  return (
    <div
      className="screen container flex flex-col items-center justify-center"
      style={{ minHeight: '100vh' }}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: '48px' }}>
        <img
          src="/assets/Split The Bill.png"
          alt="Split the Bill"
          style={{ width: '320px', maxWidth: '80vw' }}
        />

        <div
          className="flex"
          style={{ gap: '16px', justifyContent: 'center' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={handleUploadImage}
            style={{
              padding: '12px 32px',
              borderRadius: '50px',
              border: '3px solid #c25164',
              background: '#f5dce1',
              color: '#761626',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minWidth: '180px',
            }}
          >
            upload receipt
          </button>

          <button
            onClick={handleManualEntry}
            style={{
              padding: '12px 32px',
              borderRadius: '50px',
              border: '3px solid #c25164',
              background: '#f5dce1',
              color: '#761626',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minWidth: '180px',
            }}
          >
            enter manually
          </button>
        </div>
      </div>
    </div>
  );
}
