import { useState, useEffect, useRef } from 'react';

export default function SearchableSelect({ options, value, onChange, placeholder, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options || []);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      (options || []).filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ''}`}>
      <input
        type="text"
        value={isOpen ? search : (value || '')}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder || 'Selecionar...'}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">Nenhum setor encontrado</div>
          ) : (
            filteredOptions.map((option, idx) => (
              <div
                key={idx}
                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}