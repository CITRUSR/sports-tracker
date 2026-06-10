import { useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from './SearchableInput.module.css';

function SearchableInput({
  id,
  options,
  value,
  onChange,
  placeholder = 'Выберите значение',
  searchPlaceholder = 'Поиск...',
  emptyOption = null,
  disabled = false,
  error = false,
  noResultsText = 'Ничего не найдено',
  inputClassName = '',
  className = '',
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const allOptions = useMemo(() => {
    if (!emptyOption) {
      return options;
    }

    return [emptyOption, ...options];
  }, [emptyOption, options]);

  const selectedOption = useMemo(
    () => allOptions.find((option) => String(option.value) === String(value)) ?? null,
    [allOptions, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allOptions;
    }

    return allOptions.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [allOptions, query]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
    setHighlightedIndex(0);
  };

  const open = () => {
    if (disabled) {
      return;
    }

    setIsOpen(true);
    setQuery('');
    setHighlightedIndex(0);
  };

  const selectOption = (option) => {
    onChange(String(option.value));
    close();
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !listRef.current) {
      return;
    }

    const highlightedItem = listRef.current.children[highlightedIndex];

    if (highlightedItem) {
      highlightedItem.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  const handleInputChange = (event) => {
    setQuery(event.target.value);

    if (!isOpen) {
      setIsOpen(true);
    }

    setHighlightedIndex(0);
  };

  const handleKeyDown = (event) => {
    if (disabled) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (!isOpen) {
        open();
        return;
      }

      setHighlightedIndex((index) =>
        filteredOptions.length ? Math.min(index + 1, filteredOptions.length - 1) : 0,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (!isOpen) {
        open();
        return;
      }

      setHighlightedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter' && isOpen) {
      event.preventDefault();

      const option = filteredOptions[highlightedIndex];

      if (option) {
        selectOption(option);
      }

      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  };

  const displayValue = isOpen ? query : selectedOption?.label ?? '';

  return (
    <div className={`${styles.root} ${className}`} ref={rootRef}>
      <div className={styles.control}>
        <input
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ''} ${inputClassName}`}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${inputId}-listbox`}
          aria-autocomplete="list"
          value={displayValue}
          placeholder={isOpen ? searchPlaceholder : placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onFocus={open}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label={isOpen ? 'Закрыть список' : 'Открыть список'}
          disabled={disabled}
          onClick={() => {
            if (isOpen) {
              close();
              return;
            }

            open();
          }}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {filteredOptions.length === 0 ? (
            <div className={styles.empty}>{noResultsText}</div>
          ) : (
            <ul id={`${inputId}-listbox`} className={styles.list} ref={listRef} role="listbox">
              {filteredOptions.map((option, index) => {
                const isSelected = String(option.value) === String(value);
                const isHighlighted = index === highlightedIndex;

                return (
                  <li key={`${option.value}-${option.label}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`${styles.option} ${isSelected ? styles.optionSelected : ''} ${isHighlighted ? styles.optionHighlighted : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      {option.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchableInput;
