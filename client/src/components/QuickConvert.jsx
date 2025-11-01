import './QuickConvert.css';

const QUICK_AMOUNTS = [
  { value: '1', label: '1' },
  { value: '10', label: '10' },
  { value: '100', label: '100' },
  { value: '1000', label: '1K' },
  { value: '5000', label: '5K' },
  { value: '10000', label: '10K' }
];

const QuickConvert = ({ onAmountSelect, selectedAmount }) => {
  return (
    <div className="quick-convert">
      <h3 className="quick-convert-title">Quick Amounts</h3>
      <div className="quick-buttons">
        {QUICK_AMOUNTS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onAmountSelect(value)}
            className={`quick-button ${selectedAmount === value ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickConvert;
