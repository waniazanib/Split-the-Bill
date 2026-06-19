import { useState } from 'react';
import { useApp } from '../AppContext';
import { greedyRoute, evenRoute } from '../routing';
import { calculateBalances } from '../balances';

export default function Screen6() {
  const { state, dispatch, formatMoney, totalPaid, totalBill } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  const paid = totalPaid();
  const total = totalBill();
  const progressPercent = Math.min(100, (paid / total) * 100);

  const balances = calculateBalances(state.items, state.people, state.tax, state.tip);
  const smartTransactions = greedyRoute(balances);
  const evenTransactions = evenRoute(balances);

  const isComplete = Math.abs(paid - total) < 0.01;
  const isOverpaid = paid > total + 0.01;
  const isUnderpaid = paid < total - 0.01;

  const handleTogglePaid = (personId: string, enable: boolean) => {
    dispatch({
      type: 'UPDATE_PERSON_PAID',
      payload: { id: personId, amount: enable ? 0 : 0 },
    });
  };

  const handleAmountChange = (personId: string, amount: string) => {
    const parsed = parseFloat(amount) || 0;
    dispatch({
      type: 'UPDATE_PERSON_PAID',
      payload: { id: personId, amount: parsed },
    });
  };

  const handleContinue = () => {
    if (isComplete) {
      dispatch({ type: 'CALCULATE_TRANSACTIONS' });
      dispatch({ type: 'SET_SCREEN', payload: 7 });
    }
  };

  return (
    <div className="screen container flex flex-col">
      <div className="header">
        <button
          className="header-back"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 5 })}
        >
          ←
        </button>
        <h2 className="header-title">Who Paid?</h2>
      </div>

      <div className="mb-lg">
        <div className="flex justify-between mb-sm">
          <span>Total Bill</span>
          <span className="font-bold">{formatMoney(total)}</span>
        </div>

        <div className="progress-bar mb-sm">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              background: isOverpaid ? 'var(--warning)' : undefined,
            }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted">Amount entered: {formatMoney(paid)}</span>
          {isComplete && <span style={{ color: 'var(--success)' }}>✓ Complete</span>}
          {isOverpaid && (
            <span style={{ color: 'var(--warning)' }}>
              ⚠️ Over by {formatMoney(paid - total)}
            </span>
          )}
          {isUnderpaid && (
            <span style={{ color: 'var(--error)' }}>
              {formatMoney(total - paid)} still unaccounted
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 gap-md flex flex-col mb-lg">
        {state.people.map((person) => {
          const balance = balances.find((b) => b.personId === person.id);
          const share = balance?.share || 0;
          const [isPaid, setIsPaid] = useState(person.amountPaid > 0);

          return (
            <div
              key={person.id}
              className="card"
              style={{ padding: 'var(--spacing-md)' }}
            >
              <div className="flex items-center gap-md mb-md">
                <div
                  className="avatar"
                  style={{ background: person.color }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{person.name}</div>
                  <div className="text-sm text-muted">
                    Share: {formatMoney(share)}
                  </div>
                </div>
                <div
                  className={`toggle ${isPaid ? 'active' : ''}`}
                  onClick={() => {
                    setIsPaid(!isPaid);
                    handleTogglePaid(person.id, !isPaid);
                  }}
                >
                  <div className="toggle-knob" />
                </div>
              </div>

              {isPaid && (
                <div className="flex items-center gap-sm">
                  <span className="text-sm text-muted">Paid:</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={person.amountPaid || ''}
                    onChange={(e) => handleAmountChange(person.id, e.target.value)}
                    placeholder="0.00"
                    className="input"
                    style={{ flex: 1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card mb-lg" style={{ padding: 'var(--spacing-md)' }}>
        <button
          className="flex w-full items-center justify-between"
          onClick={() => setShowSettings(!showSettings)}
        >
          <span className="font-bold">Settings</span>
          <span>{showSettings ? '▲' : '▼'}</span>
        </button>

        {showSettings && (
          <div className="mt-md">
            <div className="mb-md">
              <label className="text-sm text-muted block mb-sm">Routing Mode</label>
              <div className="flex gap-sm">
                <button
                  className={`btn flex-1 ${state.settings.routingMode === 'smart'
                      ? 'btn-primary'
                      : 'btn-secondary'
                    }`}
                  onClick={() => dispatch({ type: 'SET_ROUTING_MODE', payload: 'smart' })}
                >
                  Smart (Min transactions)
                </button>
                <button
                  className={`btn flex-1 ${state.settings.routingMode === 'even'
                      ? 'btn-primary'
                      : 'btn-secondary'
                    }`}
                  onClick={() => dispatch({ type: 'SET_ROUTING_MODE', payload: 'even' })}
                >
                  Even (Proportional)
                </button>
              </div>
            </div>

            <div className="text-sm text-muted text-center">
              Smart: {smartTransactions.length} transactions · Even: {evenTransactions.length} transactions
            </div>
          </div>
        )}
      </div>

      <button
        className="btn btn-primary btn-large"
        onClick={handleContinue}
        disabled={!isComplete}
      >
        Settle up →
      </button>
    </div>
  );
}
