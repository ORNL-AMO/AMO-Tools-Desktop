import { Injectable } from '@angular/core';
import { SSMT } from '../shared/models/steam/ssmt';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CompareService {
  baselineSSMT: SSMT;
  modifiedSSMT: SSMT;
  selectedModification: BehaviorSubject<SSMT>;
  constructor() {
    this.selectedModification = new BehaviorSubject<SSMT>(undefined);
  }


  setCompareVals(ssmt: SSMT, selectedModIndex?: number) {
    this.baselineSSMT = ssmt;
    if (ssmt.modifications) {
      if (ssmt.modifications.length != 0) {
        this.selectedModification.next(ssmt.modifications[selectedModIndex].ssmt);
        this.modifiedSSMT = this.selectedModification.value;
      } else {
        this.selectedModification.next(undefined);
        this.modifiedSSMT = undefined;
      }
    } else {
      this.selectedModification.next(undefined);
      this.modifiedSSMT = undefined;
    }
  }

  //operations
  checkOperationsDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if(!baseline){
      baseline = this.baselineSSMT;
    }
    if(!modification){
      modification = this.modifiedSSMT;
    }

    if(baseline && modification){
      return (
        this.isSitePowerImportDifferent(baseline, modification) ||
        this.isMakeUpWaterTemperatureDifferent(baseline, modification) || 
        this.isHoursPerYearDifferent(baseline, modification) || 
        this.isFuelCostDifferent(baseline, modification) || 
        this.isElectricityCostDifferent(baseline, modification) || 
        this.isMakeUpWaterCostsDifferent(baseline, modification)
      )
    }else{
      return false;
    }
  }

  // sitePowerImport
  isSitePowerImportDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.generalSteamOperations.sitePowerImport != modification.generalSteamOperations.sitePowerImport) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // makeUpWaterTemperature
  isMakeUpWaterTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.generalSteamOperations.makeUpWaterTemperature != modification.generalSteamOperations.makeUpWaterTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // hoursPerYear
  isHoursPerYearDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingHours.hoursPerYear != modification.operatingHours.hoursPerYear) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // fuelCost
  isFuelCostDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.fuelCost != modification.operatingCosts.fuelCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // electricityCost
  isElectricityCostDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.electricityCost != modification.operatingCosts.electricityCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // makeUpWaterCost
  isMakeUpWaterCostsDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.makeUpWaterCost != modification.operatingCosts.makeUpWaterCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //boiler
  // fuelType
  isFuelTypeDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.fuelType != modification.boilerInput.fuelType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // fuel
  isFuelDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.fuel != modification.boilerInput.fuel || baseline.boilerInput.fuelType != modification.boilerInput.fuelType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // combustionEfficiency
  isCombustionEfficiencyDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.combustionEfficiency != modification.boilerInput.combustionEfficiency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // blowdownRate
  isBlowdownRateDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.blowdownRate != modification.boilerInput.blowdownRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // blowdownFlashed
  isBlowdownFlashedDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.blowdownFlashed != modification.boilerInput.blowdownFlashed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // preheatMakeupWater
  isPreheatMakeupWaterDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.preheatMakeupWater != modification.boilerInput.preheatMakeupWater) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // steamTemperature
  isSteamTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.steamTemperature != modification.boilerInput.steamTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // deaeratorVentRate
  isDeaeratorVentRateDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.deaeratorVentRate != modification.boilerInput.deaeratorVentRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // deaeratorPressure
  isDeaeratorPressureDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.deaeratorPressure != modification.boilerInput.deaeratorPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // approachTemperature
  isApproachTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean{
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.approachTemperature != modification.boilerInput.approachTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  //HEADER
}
