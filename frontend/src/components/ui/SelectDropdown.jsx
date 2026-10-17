import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const focusStyle = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-main/15';

export default function SelectDropdown({ value = '', options, onChange, label, placeholder = '', disabled = false, ariaLabel, id, name, className = '', triggerClassName = '', labelClassName = '', prefix }) {
  const generatedId = useId();
  const triggerId = id || generatedId;
  const menuId = `${triggerId}-options`;
  const trigger = useRef(null);
  const menu = useRef(null);
  const optionRefs = useRef([]);
  const initialFocus = useRef(0);
  const [position, setPosition] = useState(null);
  const open = position !== null && !disabled;
  const selectedIndex = options.findIndex(option => String(option.value) === String(value));
  const selected = options[selectedIndex];

  function measure() {
    const rect = trigger.current.getBoundingClientRect();
    const margin = 8;
    const gap = 6;
    const below = window.innerHeight - rect.bottom - gap - margin;
    const above = rect.top - gap - margin;
    const upward = below < 180 && above > below;
    const width = Math.min(rect.width, window.innerWidth - margin * 2);
    return {
      left: Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin)),
      width,
      maxHeight: Math.max(0, Math.min(288, upward ? above : below)),
      ...(upward ? { bottom: window.innerHeight - rect.top + gap } : { top: rect.bottom + gap }),
    };
  }

  function show(index = selectedIndex) {
    if (disabled) return;
    const candidate = index < 0 ? 0 : index;
    initialFocus.current = options[candidate]?.disabled ? options.findIndex(option => !option.disabled) : candidate;
    setPosition(measure());
  }

  function close(restoreFocus = false) {
    setPosition(null);
    if (restoreFocus) trigger.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    optionRefs.current[initialFocus.current]?.focus({ preventScroll: true });
    const outside = event => {
      if (!trigger.current?.contains(event.target) && !menu.current?.contains(event.target)) setPosition(null);
    };
    const reposition = () => setPosition(measure());
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  function handleKeys(event) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === 'Tab' && open) {
      // Restore the trigger before normal Tab traversal leaves this control.
      close(true);
    } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const enabled = options.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
      if (!enabled.length) return;
      const current = enabled.indexOf(optionRefs.current.indexOf(document.activeElement));
      const next = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled.at(-1)
        : enabled[(current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length];
      if (open) {
        optionRefs.current[next]?.focus({ preventScroll: true });
        optionRefs.current[next]?.scrollIntoView({ block: 'nearest' });
      } else show(event.key === 'ArrowUp' || event.key === 'End' ? enabled.at(-1) : enabled[0]);
    }
  }

  return <div className={`min-w-0 ${className}`} onKeyDown={handleKeys}>
    {label && <label id={`${triggerId}-label`} htmlFor={triggerId} className={`block font-label-sm text-label-sm uppercase tracking-wider text-text-subtle mb-2 ${labelClassName}`}>{label}</label>}
    {name && <input type="hidden" name={name} value={value} disabled={disabled} />}
    <button id={triggerId} ref={trigger} type="button" disabled={disabled} aria-label={ariaLabel}
      aria-labelledby={!ariaLabel && label ? `${triggerId}-label ${triggerId}-value` : undefined}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? menuId : undefined}
      onClick={() => open ? close() : show()}
      className={`flex w-full min-w-0 items-center gap-2 rounded-DEFAULT border px-3 py-2 bg-surface text-left font-body-sm text-body-sm text-text-main transition-colors hover:bg-surface-subtle hover:border-outline-variant disabled:cursor-not-allowed disabled:opacity-50 ${open ? 'border-outline-variant' : 'border-border'} ${focusStyle} ${triggerClassName}`}>
      {prefix}<span id={`${triggerId}-value`} className="min-w-0 flex-1 whitespace-normal break-words">{selected?.label ?? placeholder}</span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
        <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && createPortal(<div ref={menu} id={menuId} role="listbox" aria-label={ariaLabel || label}
      style={position} className="fixed z-[60] overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-1 shadow-md">
      {options.map((option, index) => <button key={option.value} ref={element => { optionRefs.current[index] = element; }}
        type="button" role="option" aria-selected={index === selectedIndex} disabled={option.disabled} tabIndex={-1}
        onClick={() => { onChange(option.value); close(true); }}
        className={`flex w-full items-center justify-between gap-2 rounded-DEFAULT px-3 py-2 text-left font-body-sm text-body-sm text-text-main hover:bg-surface-subtle focus:bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed ${index === selectedIndex ? 'bg-surface-subtle font-semibold' : ''} ${focusStyle}`}>
        <span className="min-w-0 break-words">{option.label}</span><span aria-hidden="true" className="w-3 shrink-0 text-center">{index === selectedIndex ? '✓' : ''}</span>
      </button>)}
    </div>, document.body)}
  </div>;
}
