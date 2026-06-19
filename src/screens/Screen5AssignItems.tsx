import { useApp } from '../AppContext';
import { calculatePersonShares } from '../balances';
import { roundToCents } from '../money';

function PersonChip({
  person,
  active,
  onClick,
  size = 'normal',
}: {
  person: { id: string; name: string; color: string };
  active: boolean;
  onClick: () => void;
  size?: 'normal' | 'small';
}) {
  const initial = person.name.charAt(0).toUpperCase();

  return (
    <button
      className={`chip chip-person chip-assignable ${active ? 'active' : ''}`}
      style={{
        width: size === 'small' ? '32px' : '40px',
        height: size === 'small' ? '32px' : '40px',
        background: person.color,
        fontSize: size === 'small' ? '0.85rem' : '1rem',
      }}
      onClick={onClick}
    >
      {initial}
    </button>
  );
}

export default function Screen5() {
  const { state, dispatch, formatMoney, allItemsAssigned } = useApp();

  const shares = calculatePersonShares(state.items, state.tax, state.tip);

  const personTotals = state.people.map((person) => ({
    ...person,
    total: shares.get(person.id) || 0,
  }));

  const handleToggleAssignment = (itemId: string, personId: string) => {
    const item = state.items.find((i) => i.id === itemId);
    if (!item) return;

    if (item.assignedTo.includes(personId)) {
      dispatch({ type: 'UNASSIGN_ITEM', payload: { itemId, personId } });
    } else {
      dispatch({ type: 'ASSIGN_ITEM', payload: { itemId, personId } });
    }

    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleAssignAll = (itemId: string) => {
    dispatch({ type: 'ASSIGN_ALL_TO_ITEM', payload: { itemId } });
  };

  const handleContinue = () => {
    if (allItemsAssigned()) {
      dispatch({ type: 'SET_SCREEN', payload: 6 });
    }
  };

  const unassignedCount = state.items.filter((i) => i.assignedTo.length === 0).length;

  return (
    <div className="screen container flex flex-col" style={{ paddingBottom: '280px' }}>
      <div className="header">
        <button
          className="header-back"
          onClick={() => dispatch({ type: 'SET_SCREEN', payload: 4 })}
        >
          ←
        </button>
        <h2 className="header-title">Assign Items</h2>
        {!allItemsAssigned() && (
          <span className="badge badge-warning">{unassignedCount}</span>
        )}
      </div>

      <div className="flex-1 gap-md flex flex-col">
        {state.items.map((item) => {
          const personCount = item.assignedTo.length;
          const perPerson = personCount > 0 ? roundToCents(item.price / personCount) : item.price;

          return (
            <div key={item.id} className="card">
              <div className="flex items-center gap-md mb-md">
                <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                <span className="flex-1 font-bold">{item.name}</span>
                <span className="font-bold">
                  {formatMoney(item.price)}
                  {personCount > 1 && (
                    <span className="text-muted text-sm">
                      {' '}
                      (÷{personCount} = {formatMoney(perPerson)})
                    </span>
                  )}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', width: '100%' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, min-content)',
                  gap: '8px',
                  flex: 1
                }}>
                  {state.people.map((person) => (
                    <PersonChip
                      key={person.id}
                      person={person}
                      active={item.assignedTo.includes(person.id)}
                      onClick={() => handleToggleAssignment(item.id, person.id)}
                      size="small"
                    />
                  ))}
                </div>

                <button
                  className="btn btn-ghost text-sm"
                  onClick={() => handleAssignAll(item.id)}
                  style={{ flexShrink: 0 }}
                >
                  Everyone
                </button>
              </div>

              {item.assignedTo.length === 0 && (
                <div
                  className="text-sm text-center mt-md"
                  style={{ color: 'var(--warning)' }}
                >
                  ⚠️ Not assigned
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="floating-bar" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '16px',
            width: '100%'
          }}>
            {personTotals.map((person) => (
              <div
                key={person.id}
                className="chip"
                style={{
                  background: person.color,
                  fontSize: '0.75rem',
                  padding: '6px 8px',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                }}
              >
                <span>{person.name}:</span>
                <span className="font-bold">{formatMoney(person.total)}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={handleContinue}
            disabled={!allItemsAssigned()}
          >
            Who paid? →
          </button>
        </div>
      </div>
    </div>
  );
}
