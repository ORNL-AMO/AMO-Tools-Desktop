import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { PhastCo2SavingsDifferent } from './co2-savings-phast/co2-savings-phast.service';

@Injectable()
export class OperationsCompareService {

  baseline: PHAST;
  modification: PHAST;

  co2SavingsDifferent: BehaviorSubject<PhastCo2SavingsDifferent>;
  constructor() {
    this.co2SavingsDifferent = new BehaviorSubject<PhastCo2SavingsDifferent>({
      totalEmissionOutputRate: false,
      totalFuelEmissionOutputRate: false,
      energySource: false,
      fuelType: false,
      totalNaturalGasEmissionOutputRate: false,
      totalCoalEmissionOutputRate: false,
      totalOtherEmissionOutputRate: false,
      coalFuelType: false,
      eafOtherFuelSource: false,
      otherFuelType: false,
    });
  }

  compareOperations(settings: Settings): boolean {
    return (
      this.compareWeeksPerYear() ||
      this.compareDaysPerWeek() ||
      // this.compareShiftsPerDay() ||
      // this.compareHoursPerShift() ||
      this.compareHoursPerYear() ||
      this.compareFuelCost() ||
      this.compareSteamCost() ||
      this.compareElectricityCost() ||
      this.compareCoalCarbonCost() ||
      this.compareElectrodeCost() ||
      this.compareOtherFuelCost() ||
      this.hasDifferentCo2Field(settings)
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
      this.compare(baseline.operatingCosts.electricityCost, modification.operatingCosts.electricityCost)) ||
      this.compare(baseline.operatingCosts.coalCarbonCost, modification.operatingCosts.coalCarbonCost) ||
      this.compare(baseline.operatingCosts.electrodeCost, modification.operatingCosts.electrodeCost) ||
      this.compare(baseline.operatingCosts.otherFuelCost, modification.operatingCosts.otherFuelCost);
  }

  isCo2SavingsDifferent(settings: Settings): void {
    let co2SavingsDifferent: PhastCo2SavingsDifferent = {
      totalEmissionOutputRate: false,
      totalFuelEmissionOutputRate: false,
      totalNaturalGasEmissionOutputRate: false,
      totalCoalEmissionOutputRate: false,
      totalOtherEmissionOutputRate: false,
      coalFuelType: false,
      eafOtherFuelSource: false,
      otherFuelType: false,
      energySource: false,
      fuelType: false,
    };
    if (this.baseline.co2SavingsData && this.modification.co2SavingsData) {
      if (settings.energySourceType === 'Electricity') {
        if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
          co2SavingsDifferent = {
            totalEmissionOutputRate: this.compareTotalEmissionOutputRate(),
            totalFuelEmissionOutputRate: this.compareTotalFuelEmissionOutputRate(),
            totalNaturalGasEmissionOutputRate: this.compareTotalNaturalGasEmissionOutputRate(),
            totalCoalEmissionOutputRate: this.compareTotalCoalEmissionOutputRate(),
            totalOtherEmissionOutputRate: this.compareTotalOtherEmissionOutputRate(),
            coalFuelType: this.compareCoalFuelType(),
            eafOtherFuelSource: this.compareEAFOtherFuelSource(),
            otherFuelType: this.compareOtherFuelType(),
            energySource: this.compareEnergySource(),
            fuelType: this.compareFuelType(),
          }
        } else {
          co2SavingsDifferent = {
            totalEmissionOutputRate: this.compareTotalEmissionOutputRate(),
            totalFuelEmissionOutputRate: this.compareTotalFuelEmissionOutputRate(),
            energySource: this.compareEnergySource(),
            fuelType: this.compareFuelType()
          }
        }
      } else {
        co2SavingsDifferent = {
          totalFuelEmissionOutputRate: this.compareTotalFuelEmissionOutputRate(),
          energySource: this.compareEnergySource(),
          fuelType: this.compareFuelType(),
        }
      }
    }
    
    this.co2SavingsDifferent.next(co2SavingsDifferent);
  }

  hasDifferentCo2Field(settings: Settings): boolean {
    let isDifferent: boolean = false
    if (this.baseline.co2SavingsData && this.modification.co2SavingsData) {
      if (settings.energySourceType === 'Electricity') {
        if (settings.furnaceType === 'Electric Arc Furnace (EAF)') {
          isDifferent = this.compareTotalEmissionOutputRate()
            || this.compareTotalFuelEmissionOutputRate()
            || this.compareTotalNaturalGasEmissionOutputRate()
            || this.compareTotalCoalEmissionOutputRate()
            || this.compareTotalOtherEmissionOutputRate()
            || this.compareCoalFuelType()
            || this.compareEAFOtherFuelSource()
            || this.compareOtherFuelType()
            || this.compareEnergySource()
            || this.compareFuelType();
        } else {
          isDifferent = this.compareTotalEmissionOutputRate()
            || this.compareTotalFuelEmissionOutputRate()
            || this.compareEnergySource()
            || this.compareFuelType();
        }
      } else {
         isDifferent = this.compareTotalFuelEmissionOutputRate()
            || this.compareEnergySource()
            || this.compareFuelType();
      }
    }
    return isDifferent;
  }


  compareTotalEmissionOutputRate(): boolean {
    return this.baseline.co2SavingsData.totalEmissionOutputRate != this.modification.co2SavingsData.totalEmissionOutputRate;
  }

  compareTotalFuelEmissionOutputRate(): boolean {
    return this.baseline.co2SavingsData.totalFuelEmissionOutputRate != this.modification.co2SavingsData.totalFuelEmissionOutputRate
  }


  compareTotalNaturalGasEmissionOutputRate(): boolean {
    return this.baseline.co2SavingsData.totalNaturalGasEmissionOutputRate != this.modification.co2SavingsData.totalNaturalGasEmissionOutputRate;
  }

  compareTotalCoalEmissionOutputRate(): boolean {
    return this.baseline.co2SavingsData.totalCoalEmissionOutputRate != this.modification.co2SavingsData.totalCoalEmissionOutputRate;
  }

  compareTotalOtherEmissionOutputRate(): boolean {
    return this.baseline.co2SavingsData.totalOtherEmissionOutputRate != this.modification.co2SavingsData.totalOtherEmissionOutputRate;
  }

  compareCoalFuelType(): boolean {
    return this.baseline.co2SavingsData.coalFuelType != this.modification.co2SavingsData.coalFuelType;
  }

  compareEAFOtherFuelSource(): boolean {
    return this.baseline.co2SavingsData.eafOtherFuelSource != this.modification.co2SavingsData.eafOtherFuelSource;
  }

  compareOtherFuelType(): boolean {
    return this.baseline.co2SavingsData.otherFuelType != this.modification.co2SavingsData.otherFuelType;
  }

  compareEnergySource(): boolean {
    return this.baseline.co2SavingsData.energySource != this.modification.co2SavingsData.energySource;
  }

  compareFuelType(): boolean {
    return this.baseline.co2SavingsData.fuelType != this.modification.co2SavingsData.fuelType;
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
