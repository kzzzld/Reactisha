export const colorSchemes = [
  { name: 'Warm light', description: 'Warm paper and forest green', dark: false, background: '#F8F7F2', ink: '#213C32', muted: '#647168', line: '#DEDFD5', green: '#234F3C', pale: '#E7EDDF', input: '#ECEEE5', onAccent: '#FFFFFF' },
  { name: 'Catppuccin', description: 'Mocha · soft pastels after dark', dark: true, background: '#1E1E2E', ink: '#CDD6F4', muted: '#BAC2DE', line: '#45475A', green: '#CBA6F7', pale: '#313244', input: '#313244', onAccent: '#1E1E2E' },
  { name: 'Nord', description: 'Cool slate and arctic blue', dark: true, background: '#2E3440', ink: '#ECEFF4', muted: '#D8DEE9', line: '#4C566A', green: '#88C0D0', pale: '#3B4252', input: '#3B4252', onAccent: '#2E3440' },
  { name: 'Ethereal', description: 'Airy lavender and soft violet', dark: false, background: '#F5F1FA', ink: '#392C4E', muted: '#726381', line: '#DFD5E9', green: '#70518B', pale: '#E8DFF1', input: '#EAE3F1', onAccent: '#FFFFFF' },
  { name: 'Pitch Black', description: 'Near-black with quiet silver', dark: true, background: '#0D0D0F', ink: '#F1F1F3', muted: '#A7A7B0', line: '#303036', green: '#D0D0D8', pale: '#232327', input: '#1C1C20', onAccent: '#0D0D0F' },
  { name: 'AMOLED', description: 'Pure black with a mint accent', dark: true, background: '#000000', ink: '#F0F8F3', muted: '#A0B5A8', line: '#26382E', green: '#A0E8BB', pale: '#10251A', input: '#0B1B12', onAccent: '#000000' },
] as const;
export type ColorScheme = (typeof colorSchemes)[number];
