'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  locale?: 'th' | 'en'; 
  isMulti?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'พิมพ์เพื่อค้นหา...',
  className = '',
  locale = 'th',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  
  const [typedSearch, setTypedSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🌟 เขียน dictionary ลอกตามแพทเทิร์นเป๊ะ ๆ แบบที่พี่ต้องการ ไม่เดาเพิ่มแล้วครับ!
  const t = {
    th: {
      empty: 'ไม่มีในรายการ (ระบบจะใช้ค่าที่คุณพิมพ์)'
    },
    en: {
      empty: 'Not found in list (system will use your typed value)'
    }
  }[locale || 'th'];

  const currentOption = options.find(
    (o) => o.value === value || (Boolean(value) && o.label.toLowerCase() === value.toLowerCase())
  );

  const displayInputValue = isTyping ? typedSearch : (currentOption?.label || value);

  const filtered = isTyping && typedSearch
    ? options.filter((o) => o.label.toLowerCase().includes(typedSearch.toLowerCase()))
    : options;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) {
      setIsTyping(false);
      setTypedSearch('');
    }
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setIsTyping(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTypedSearch(inputValue);
    setIsTyping(true);
    
    const matchedOption = options.find((o) => o.label.toLowerCase() === inputValue.toLowerCase());
    onChange(matchedOption ? matchedOption.value : inputValue);
    
    if (!open) setOpen(true);
  };

  const handleFocus = () => {
    setOpen(true);
    setIsTyping(false); 
    
    setTimeout(() => {
      inputRef.current?.select();
    }, 50);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={displayInputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={handleFocus}
        className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 cursor-text pr-8"
      />
      <ChevronDown
        className={`absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400 italic">
              {/* 🚀 เรียกใช้งานผ่าน t.empty แบบเดียวกับคอมโพเนนต์อื่น ๆ เลยครับพี่ชาย */}
              {t.empty}
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${opt.value === value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}