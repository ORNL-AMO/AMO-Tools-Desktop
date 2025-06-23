import { OpportunityUtilityType } from "../../shared/models/treasure-hunt";

export const treasureHuntUtilityOptions: Array<OpportunityUtilityType> = [
  'Natural Gas',
  'Other Fuel',
  'Electricity',
  'Steam',
];


export interface TreasureHuntUtilityOption {
    utilityName: string,
    display: string
}