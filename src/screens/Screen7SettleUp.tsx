import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { useApp } from '../AppContext';
import { calculateBalances } from '../balances';

export default function Screen7() {
  const { state, dispatch, formatMoney } = useApp();
  const settleRef = useRef<HTMLDivElement>(null);
  const [allPaid, setAllPaid] = useState(false);

  const balances = calculateBalances(state.items, state.people, state.tax, state.tip);

  useEffect(() => {
    const allTransactionsPaid = state.transactions.length > 0 &&
      state.transactions.every((t) => t.paid);
    setAllPaid(allTransactionsPaid);
  }, [state.transactions]);

  useEffect(() => {
    if (allPaid) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [allPaid]);

  const getPerson = (id: string) => state.people.find((p) => p.id === id);



  const handleShare = async () => {
    if (!settleRef.current) return;

    try {
      const canvas = await html2canvas(settleRef.current, {
        backgroundColor: '#FFF5F7',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = 'split-bill.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to create share card:', error);
    }
  };

  const handleNewSplit = () => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_SCREEN', payload: 1 });
  };

  return (
    <div className="screen container flex flex-col">
      <style>{`
        .custom-settle-btn {
          flex: 1;
          background: #ffffff;
          color: #c25164;
          border: 3px solid #c25164;
          border-radius: 20px;
          padding: 14px 20px;
          font-family: 'Bernoru SemiCondensed', 'Impact', 'Arial Black', sans-serif;
          font-size: 1.15rem;
          font-weight: bold;
          text-transform: lowercase;
          cursor: pointer;
          transition: all 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }
        .custom-settle-btn:hover {
          background: #fdf5f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(194, 81, 100, 0.1);
        }
        .custom-settle-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
      `}</style>
      <div className="header">
        <button
          className="header-back"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 6 })}
        >
          ←
        </button>
        <h2 className="header-title">Settle Up</h2>
      </div>

      <div ref={settleRef} className="flex-1">
        

        <div className="card mb-lg">
          <h4 className="font-bold mb-md">Per Person Summary</h4>
          {balances.map((balance) => {
            const person = getPerson(balance.personId);
            if (!person) return null;

            return (
              <div key={balance.personId} className="flex items-center gap-md mb-sm">
                <div className="avatar" style={{ background: person.color }}>
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{person.name}</div>
                  <div className="text-sm text-muted">
                    Paid {formatMoney(balance.paid)} · Share {formatMoney(balance.share)}
                  </div>
                </div>
                <div
                  className="font-bold"
                  style={{
                    color: balance.balance >= 0 ? 'var(--success)' : 'var(--error)',
                    textAlign: 'right',
                    minWidth: '80px',
                  }}
                >
                  {balance.balance >= 0 ? '+ ' : '-'}
                  {Math.abs(balance.balance).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {state.transactions.length > 0 && (
          <div className="card">
            <h4 className="font-bold mb-md">Transactions</h4>
            {state.transactions.map((transaction, index) => {
              const from = getPerson(transaction.from);
              const to = getPerson(transaction.to);
              if (!from || !to) return null;

              return (
                <div
                  key={index}
                  className="transaction-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    background: 'var(--surface)',
                  }}
                >
                  <span className="font-bold" style={{ textAlign: 'right', flex: 1 }}>{from.name}</span>
                  <span className="text-muted">pays</span>
                  <span className="font-bold">{formatMoney(transaction.amount)}</span>
                  <span className="text-muted">to</span>
                  <span className="font-bold" style={{ textAlign: 'left', flex: 1 }}>{to.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-sm mt-lg">
        <button className="custom-settle-btn" onClick={handleShare}>
          share card
        </button>
        <button className="custom-settle-btn" onClick={handleNewSplit}>
          start new split
        </button>
      </div>
    </div>
  );
}
