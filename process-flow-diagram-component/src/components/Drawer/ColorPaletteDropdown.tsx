import React, { useState, useRef } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';

interface ColorPaletteDropdownProps {
  selected: number;
  onChange: (idx: number) => void;
}

export const mainPalettes = [
  ['#75a1ff', '#00bbff', '#7f7fff', '#009386', '#93e200', '#ffffff'],
  ['#88EFBF', '#FE5000', '#008A8F', '#B50094', '#FFFFFF', '#BDBDBD'],
  ['#00B8B5', '#42008E', '#373A36', '#006BA6', '#005776', '#BDBDBD'],
  ['#00662C', '#88EFBF', '#F9BF1B', '#008A8F', '#006BA6', '#BDBDBD'],
  ['#00454D', '#7DA800', '#FE5000', '#e60b0b', '#BDBDBD', '#DBDCDB'],
];
// 3 colorblind-friendly palettes (user provided, with gray as 6th color)
export const colorblindPalettes = [
  ['#FFD600', '#2962FF', '#00C853', '#FF6D00', '#2962FF', '#BDBDBD'],
  ['#D5810B', '#DF69F7', '#1C24F2', '#00B30C', '#EEFF00', '#BDBDBD'],
  ['#D50000', '#FFD600', '#00C853', '#2962FF', '#AA00FF', '#BDBDBD'],
];
export const allPalettes = [...mainPalettes, ...colorblindPalettes];


const ColorRow: React.FC<{ colors: string[]; style?: React.CSSProperties }> = ({ colors, style }) => (
  <div style={{ display: 'flex', gap: 8, margin: '8px 0', ...style }}>
    {colors.map((color, idx) => {
      const textColor = getContrastTextColor(color);
      return (
        <div
          key={color + idx}
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: color,
            border: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
            fontWeight: 600,
            fontSize: 14
          }}
        >
        </div>
      );
    })}
  </div>
);

// Returns black or white for best contrast with a given hex color
export function getContrastTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  let r = 0, g = 0, b = 0;

  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // If luminance is high, use black text; otherwise, use white text
  return luminance > 0.6 ? '#000' : '#fff';
}


const setPaletteCSSVars = (palette: string[]) => {
  const root = document.documentElement;
  root.style.setProperty('--water-intake', palette[0]);
  root.style.setProperty('--water-using-system', palette[1]);
  root.style.setProperty('--water-discharge', palette[2]);
  root.style.setProperty('--water-treatment', palette[3]);
  root.style.setProperty('--waste-water-treatment', palette[4]);
  root.style.setProperty('--known-loss-bg', palette[5]);
};

const ColorPaletteDropdown: React.FC<ColorPaletteDropdownProps> = ({ selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPaletteCSSVars(allPalettes[selected]);
  }, [selected]);

  return (
    <div style={{ margin: '24px 0', position: 'relative' }}>
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>Color Options</h3>
      <div
        ref={anchorRef}
        style={{
          display: 'inline-block',
          cursor: 'pointer',
          border: '2px solid #1976d2',
          borderRadius: 8,
          padding: 2,
          background: '#f5faff',
          minWidth: 210,
          boxShadow: open ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
        }}
        onClick={() => setOpen((prev) => !prev)}
        title="Select color palette"
      >
        <ColorRow colors={allPalettes[selected]} style={{ margin: 0 }} />
      </div>
      {open && (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <div
            style={{
              position: 'absolute',
              zIndex: 10,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              marginTop: 8,
              left: 0,
              minWidth: 210,
              padding: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {allPalettes.map((palette, i) => {
              if (i === mainPalettes.length) {
                return [
                  <div key="cb-header" style={{ fontSize: 13, color: '#75a1ff', fontWeight: 600, padding: '4px 0 2px 0', borderBottom: '1px solid #eee', margin: '4px 0 2px 0' }}>
                    Colorblind Palettes
                  </div>,
                  <div
                    key={i}
                    onClick={() => {
                      onChange(i);
                      setOpen(false);
                    }}
                    style={{
                      cursor: 'pointer',
                      border: selected === i ? '2px solid #1976d2' : '2px solid transparent',
                      borderRadius: 8,
                      padding: 2,
                      background: selected === i ? '#f5faff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                    title={`Select colorblind palette ${i - mainPalettes.length + 1}`}
                  >
                    <ColorRow colors={palette} style={{ margin: 0 }} />
                  </div>
                ];
              }
              return (
                <div
                  key={i}
                  onClick={() => {
                    onChange(i);
                    setOpen(false);
                  }}
                  style={{
                    cursor: 'pointer',
                    border: selected === i ? '2px solid #1976d2' : '2px solid transparent',
                    borderRadius: 8,
                    padding: 2,
                    background: selected === i ? '#f5faff' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'border 0.2s, box-shadow 0.2s',
                  }}
                  title={`Select color palette ${i + 1}`}
                >
                  <ColorRow colors={palette} style={{ margin: 0 }} />
                </div>
              );
            })}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default ColorPaletteDropdown;
