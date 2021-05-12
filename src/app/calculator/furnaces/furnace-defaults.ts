export const treasureHuntUtilityOptions: Array<TreasureHuntUtilityOption> = [
    {utilityName: 'Natural Gas', display: 'Natural Gas'},
    {utilityName: 'Other Fuel', display: 'Other Fuel'},
    {utilityName: 'Electricity', display: 'Electrotechnology'},
    {utilityName: 'Steam', display: 'Steam-based'},
  ];

export interface TreasureHuntUtilityOption {
    utilityName: string,
    display: string
}