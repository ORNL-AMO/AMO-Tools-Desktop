import { FormControl, InputLabel, ListSubheader, MenuItem, Select, SelectChangeEvent } from '@mui/material';

interface ColorPaletteDropdownProps {
  selected: number;
  onChange: (idx: number) => void;
}

export const mainPalettes = [
  ['#75a1ff', '#00bbff', '#7f7fff', '#009386', '#93e200'],
  ['#88EFBF', '#FE5000', '#121212', '#008A8F', '#B50094'],
  ['#00B8B5', '#42008E', '#373A36', '#006BA6', '#005776'],
  ['#00662C', '#88EFBF', '#F9BF1B', '#008A8F', '#006BA6'],
  ['#00454D', '#7DA800', '#FE5000', '#e60b0b', '#848383'],
];
// 3 colorblind-friendly palettes (user provided)
export const colorblindPalettes = [
  ['#FFD600', '#2962FF', '#00C853', '#FF6D00', '#30352e'],
  ['#D5810B', '#DF69F7', '#1C24F2', '#00B30C', '#EEFF00'],
  ['#D50000', '#FFD600', '#00C853', '#2962FF', '#AA00FF'],
];
export const allPalettes = [...mainPalettes, ...colorblindPalettes];

const ColorRow = ({ colors, swatchHeight = 36, style }: { colors: string[]; swatchHeight?: number; style?: React.CSSProperties }) => (
  <div style={{ display: 'flex', gap: 8, width: '100%', ...style }}>
    {colors.map((color, idx) => (
      <div
        key={color + idx}
        style={{
          flex: 1,
          minWidth: 0,
          height: swatchHeight,
          borderRadius: 6,
          background: color,
          border: '1px solid #ccc',
        }}
      />
    ))}
  </div>
);

const ColorPaletteDropdown = ({ selected, onChange }: ColorPaletteDropdownProps) => {
  const selectedIdx = selected >= 0 && selected < allPalettes.length ? selected : 0;

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="componentColors-label">Component Colors</InputLabel>
      <Select
        labelId="componentColors-label"
        id="componentColors"
        name="componentColors"
        size="small"
        label="Component Colors"
        value={selectedIdx}
        onChange={(event: SelectChangeEvent<number>) => onChange(Number(event.target.value))}
        renderValue={(value) => <ColorRow colors={allPalettes[value] ?? allPalettes[0]} swatchHeight={18} style={{ margin: 0 }} />}
        MenuProps={{
          disablePortal: true,
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          slotProps: {
            paper: {
              style: { minWidth: 260 },
            },
          },
        }}
      >
        {mainPalettes.map((palette, i) => (
          <MenuItem key={`palette_${i}`} value={i} title={`Select color palette ${i + 1}`}>
            <ColorRow colors={palette} style={{ margin: '4px 0' }} />
          </MenuItem>
        ))}
        <ListSubheader sx={{ pointerEvents: 'none', lineHeight: 2, fontSize: '.75rem', fontWeight: 600 }}>
          Colorblind Accessible Palettes
        </ListSubheader>
        {colorblindPalettes.map((palette, i) => {
          const idx = i + mainPalettes.length;
          return (
            <MenuItem key={`palette_${idx}`} value={idx} title={`Select colorblind palette ${i + 1}`}>
              <ColorRow colors={palette} style={{ margin: '4px 0' }} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default ColorPaletteDropdown;
