import { Injectable } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class OperationsCompareService {

  baseline: PHAST;
  modification: PHAST;

  constructor() {
  }

  compareAllLosses(): boolean {
    return this.compareLoss();
  }

  compareLoss(): boolean {
    return (
      this.compareWeeksPerYear() ||
      this.compareDaysPerWeek() ||
      // this.compareShiftsPerDay() ||
      // this.compareHoursPerShift() ||
      this.compareHoursPerYear() ||
      this.compareFuelCost() ||
      this.compareSteamCost() ||
      this.compareElectricityCost()
    );
  }

  compareWeeksPerYear(): boolean {
    return this.compare(this.baseline.operatingHours.weeksPerYear, this.modification.operatingHours.weeksPerYear);
  }
  compareDaysPerWeek(): boolean {
    return this.compare(this.baseline.operatingHours.daysPerWeek, this.modification.operatingHours.daysPerWeek);
  }
  // compareShiftsPerDay(): boolean {
  //   return this.compare(this.baseline.operatingHours.shiftsPerDay, this.modification.operatingHours.shiftsPerDay);
  // }
  // compareHoursPerShift(): boolean {
  //   return this.compare(this.baseline.operatingHours.hoursPerShift, this.modification.operatingHours.hoursPerShift);
  // }
  compareHoursPerYear(): boolean {
    return this.compare(this.baseline.operatingHours.hoursPerYear, this.modification.operatingHours.hoursPerYear);
  }
  compareFuelCost(): boolean {
    return this.compare(this.baseline.operatingCosts.fuelCost, this.modification.operatingCosts.fuelCost);
  }
  compareCoalCarbonCost(): boolean {
    return this.compare(this.baseline.operatingCosts.coalCarbonCost, this.modification.operatingCosts.coalCarbonCost);
  }
  compareElectrodeCost(): boolean {
    return this.compare(this.baseline.operatingCosts.electrodeCost, this.modification.operatingCosts.electrodeCost);
  }
  compareOtherFuelCost(): boolean {
    return this.compare(this.baseline.operatingCosts.otherFuelCost, this.modification.operatingCosts.otherFuelCost);
  }
  compareSteamCost(): boolean {
    return this.compare(this.baseline.operatingCosts.steamCost, this.modification.operatingCosts.steamCost);
  }

  compareElectricityCost(): boolean {
    return this.compare(this.baseline.operatingCosts.electricityCost, this.modification.operatingCosts.electricityCost);
  }

  compareBaseModLoss(baseline: PHAST, modification: PHAST): boolean {
    return (
      this.compare(baseline.operatingHours.weeksPerYear, modification.operatingHours.weeksPerYear) ||
      this.compare(baseline.operatingHours.daysPerWeek, modification.operatingHours.daysPerWeek) ||
      // this.compare(baseline.operatingHours.shiftsPerDay, modification.operatingHours.shiftsPerDay) ||
      // this.compare(baseline.operatingHours.hoursPerShift, modification.operatingHours.hoursPerShift) ||
      this.compare(baseline.operatingHours.hoursPerYear, modification.operatingHours.hoursPerYear) ||
      this.compare(baseline.operatingCosts.fuelCost, modification.operatingCosts.fuelCost) ||
      this.compare(baseline.operatingCosts.steamCost, modification.operatingCosts.steamCost) ||
      this.compare(baseline.operatingCosts.electricityCost, modification.operatingCosts.electricityCost));
  }

  compare(a: any, b: any) {
    //if both exist
    if (a && b) {
      //compare
      if (a !== b) {
        //not equal
        return true;
      } else {
        //equal
        return false;
      }
    }
    //check one exists
    else if ((a && !b) || (!a && b)) {
      //not equal
      return true;
    } else {
      //equal
      return false;
    }
  }
}
