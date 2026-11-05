export type SankeyLabelStyle = 'percent' | 'power' | 'both';

export const SANKEY_LABEL_STYLE_OPTIONS: Array<{ style: SankeyLabelStyle; label: string }> = [
  { style: 'percent', label: 'Loss Percent' },
  { style: 'power', label: 'Loss Power' },
  { style: 'both', label: 'Both' },
];
