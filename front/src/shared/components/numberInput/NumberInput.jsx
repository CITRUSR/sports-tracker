import { useEffect, useState } from 'react';

function NumberInput({
  value,
  onChange,
  className,
  min,
  max,
  step,
  disabled,
  id,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!focused) {
      setDraft(value === 0 ? '' : String(value));
    }
  }, [value, focused]);

  const handleFocus = () => {
    setFocused(true);
    setDraft(value === 0 ? '' : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = draft === '' || draft === '-' ? 0 : Number(draft);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  };

  const handleChange = (event) => {
    const next = event.target.value;
    setDraft(next);

    if (next === '' || next === '-') {
      onChange(0);
      return;
    }

    if (next.endsWith('.')) {
      return;
    }

    const parsed = Number(next);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const displayValue = (() => {
    if (focused) {
      return draft;
    }
    if (value === 0) {
      return '';
    }
    return value;
  })();

  return (
    <input
      type="number"
      id={id}
      className={className}
      value={displayValue}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      {...rest}
    />
  );
}

export default NumberInput;
