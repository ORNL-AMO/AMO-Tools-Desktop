import { Injectable } from '@angular/core';
import { SSMT, PressureTurbine } from '../shared/models/steam/ssmt';
import { BehaviorSubject } from 'rxjs';
import { Co2SavingsDifferent } from '../shared/assessment-co2-savings/assessment-co2-savings.service';

@Injectable()
export class CompareService {
  baselineSSMT: SSMT;
  modifiedSSMT: SSMT;
  selectedModification: BehaviorSubject<SSMT>;
  co2SavingsDifferent: BehaviorSubject<Co2SavingsDifferent>;

  constructor() {
    this.selectedModification = new BehaviorSubject<SSMT>(undefined);
    this.co2SavingsDifferent = new BehaviorSubject<Co2SavingsDifferent>({
      totalEmissionOutputRate: false,
      totalFuelEmissionOutputRate: false,
      energySource: false,
      fuelType: false,
    });
  }


  setCompareVals(ssmt: SSMT, selectedModIndex?: number) {
    this.baselineSSMT = ssmt;
    if (ssmt.modifications) {
      if (ssmt.modifications.length !== 0) {
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
  checkOperationsDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      let co2Different: Co2SavingsDifferent = this.isCo2SavingsDifferent(false, baseline, modification);
      return (
        // this.isSitePowerImportDifferent(baseline, modification) ||
        this.isMakeUpWaterTemperatureDifferent(baseline, modification) ||
        this.isHoursPerYearDifferent(baseline, modification) ||
        this.isFuelCostDifferent(baseline, modification) ||
        this.isElectricityCostDifferent(baseline, modification) ||
        this.isMakeUpWaterCostsDifferent(baseline, modification) ||
        co2Different.totalEmissionOutputRate ||
        co2Different.totalFuelEmissionOutputRate ||
        co2Different.energySource ||
        co2Different.fuelType
      );
    } else {
      return false;
    }
  }

  // sitePowerImport
  //unused modification is calculated
  // isSitePowerImportDifferent(baseline?: SSMT, modification?: SSMT): boolean {
  //   if (!baseline) {
  //     baseline = this.baselineSSMT;
  //   }
  //   if (!modification) {
  //     modification = this.modifiedSSMT;
  //   }
  //   if (baseline && modification) {
  //     if (baseline.generalSteamOperations.sitePowerImport !== modification.generalSteamOperations.sitePowerImport) {
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } else {
  //     return false;
  //   }
  // }
  // makeUpWaterTemperature
  isMakeUpWaterTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.generalSteamOperations.makeUpWaterTemperature !== modification.generalSteamOperations.makeUpWaterTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // hoursPerYear
  isHoursPerYearDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingHours.hoursPerYear !== modification.operatingHours.hoursPerYear) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // fuelCost
  isFuelCostDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.fuelCost !== modification.operatingCosts.fuelCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // electricityCost
  isElectricityCostDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.electricityCost !== modification.operatingCosts.electricityCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // makeUpWaterCost
  isMakeUpWaterCostsDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.operatingCosts.makeUpWaterCost !== modification.operatingCosts.makeUpWaterCost) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isCo2SavingsDifferent(shouldUpdateModification: boolean = true, baseline?: SSMT, modification?: SSMT): Co2SavingsDifferent {
    let co2SavingsDifferent: Co2SavingsDifferent = {
      totalEmissionOutputRate: false,
      totalFuelEmissionOutputRate: false,
      energySource: false,
      fuelType: false,
    }
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.co2SavingsData && modification.co2SavingsData) {
        co2SavingsDifferent = {
          totalEmissionOutputRate: baseline.co2SavingsData.totalEmissionOutputRate != modification.co2SavingsData.totalEmissionOutputRate,
          totalFuelEmissionOutputRate: baseline.co2SavingsData.totalFuelEmissionOutputRate != modification.co2SavingsData.totalFuelEmissionOutputRate,
          energySource: baseline.co2SavingsData.energySource != modification.co2SavingsData.energySource,
          fuelType: baseline.co2SavingsData.fuelType != modification.co2SavingsData.fuelType,
        }
      }
    } 
    if (shouldUpdateModification) {
      this.co2SavingsDifferent.next(co2SavingsDifferent);
    }
    return co2SavingsDifferent;
  }
 

  //boiler
  checkBoilerDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      return (
        this.isFuelTypeDifferent(baseline, modification) ||
        this.isFuelDifferent(baseline, modification) ||
        this.isCombustionEfficiencyDifferent(baseline, modification) ||
        this.isBlowdownRateDifferent(baseline, modification) ||
        this.isBlowdownFlashedDifferent(baseline, modification) ||
        this.isPreheatMakeupWaterDifferent(baseline, modification) ||
        this.isSteamTemperatureDifferent(baseline, modification) ||
        this.isDeaeratorVentRateDifferent(baseline, modification) ||
        this.isDeaeratorPressureDifferent(baseline, modification) ||
        this.isApproachTemperatureDifferent(baseline, modification)
      );
    } else {
      return false;
    }
  }



  // fuelType
  isFuelTypeDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.fuelType !== modification.boilerInput.fuelType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // fuel
  isFuelDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.fuel !== modification.boilerInput.fuel || baseline.boilerInput.fuelType !== modification.boilerInput.fuelType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // combustionEfficiency
  isCombustionEfficiencyDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.combustionEfficiency !== modification.boilerInput.combustionEfficiency) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // blowdownRate
  isBlowdownRateDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.blowdownRate !== modification.boilerInput.blowdownRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // blowdownFlashed
  isBlowdownFlashedDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.blowdownFlashed !== modification.boilerInput.blowdownFlashed) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // preheatMakeupWater
  isPreheatMakeupWaterDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.preheatMakeupWater !== modification.boilerInput.preheatMakeupWater) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // steamTemperature
  isSteamTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.steamTemperature !== modification.boilerInput.steamTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // deaeratorVentRate
  isDeaeratorVentRateDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.deaeratorVentRate !== modification.boilerInput.deaeratorVentRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // deaeratorPressure
  isDeaeratorPressureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.deaeratorPressure !== modification.boilerInput.deaeratorPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  // approachTemperature
  isApproachTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.boilerInput.preheatMakeupWater && modification.boilerInput.preheatMakeupWater) {
        if (baseline.boilerInput.approachTemperature !== modification.boilerInput.approachTemperature) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }


  //HEADER
  checkHeaderDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      if (baseline.headerInput.numberOfHeaders === 1) {
        return (
          this.isHighPressureHeaderDifferent(baseline, modification)
        );
      } else if (baseline.headerInput.numberOfHeaders === 2) {
        return (
          this.isHighPressureHeaderDifferent(baseline, modification) ||
          this.isLowPressureHeaderDifferent(baseline, modification)
        );
      } else if (baseline.headerInput.numberOfHeaders === 3) {
        return (
          this.isHighPressureHeaderDifferent(baseline, modification) ||
          this.isMediumPressureHeaderDifferent(baseline, modification) ||
          this.isLowPressureHeaderDifferent(baseline, modification)
        );
      }
    } else {
      return false;
    }
  }

  isHighPressureHeaderDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      return (
        this.isPressureDifferent('highPressureHeader', baseline, modification) ||
        this.isHighPressureProcessSteamUsageDifferent(baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('highPressureHeader', baseline, modification) ||
        this.isHeatLossDifferent('highPressureHeader', baseline, modification) ||
        this.isCondensateReturnTemperatureDifferent(baseline, modification) ||
        this.isFlashCondensateReturnDifferent(baseline, modification)
      );
    } else {
      return false;
    }

  }
  isMediumPressureHeaderDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      return (
        this.isPressureDifferent('mediumPressureHeader', baseline, modification) ||
        this.isNotHighPressureProcessSteamUsageDifferent('mediumPressureHeader', baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('mediumPressureHeader', baseline, modification) ||
        this.isHeatLossDifferent('mediumPressureHeader', baseline, modification) ||
        this.isFlashCondensateIntoHeaderDifferent('mediumPressureHeader', baseline, modification) ||
        this.isDesuperheatSteamIntoNextHighestDifferent('mediumPressureHeader', baseline, modification) ||
        this.isDesuperheatSteamTemperatureDifferent('mediumPressureHeader', baseline, modification)
      );
    } else {
      return false;
    }
  }
  isLowPressureHeaderDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      return (
        this.isPressureDifferent('lowPressureHeader', baseline, modification) ||
        this.isNotHighPressureProcessSteamUsageDifferent('lowPressureHeader', baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('lowPressureHeader', baseline, modification) ||
        this.isHeatLossDifferent('lowPressureHeader', baseline, modification) ||
        this.isFlashCondensateIntoHeaderDifferent('lowPressureHeader', baseline, modification) ||
        this.isDesuperheatSteamIntoNextHighestDifferent('lowPressureHeader', baseline, modification) ||
        this.isDesuperheatSteamTemperatureDifferent('lowPressureHeader', baseline, modification)
      );
    } else {
      return false;
    }
  }

  //all headers
  isPressureDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].pressure !== modification.headerInput[headerTypeString].pressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isHighPressureProcessSteamUsageDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput.highPressureHeader.processSteamUsage !== modification.headerInput.highPressureHeader.processSteamUsage) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isNotHighPressureProcessSteamUsageDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (modification.headerInput[headerTypeString].useBaselineProcessSteamUsage == false) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isCondensationRecoveryRateDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].condensationRecoveryRate !== modification.headerInput[headerTypeString].condensationRecoveryRate) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isHeatLossDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].heatLoss !== modification.headerInput[headerTypeString].heatLoss) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //high pressure header
  isCondensateReturnTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput.highPressureHeader.condensateReturnTemperature !== modification.headerInput.highPressureHeader.condensateReturnTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isFlashCondensateReturnDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput.highPressureHeader.flashCondensateReturn !== modification.headerInput.highPressureHeader.flashCondensateReturn) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  //medium/low pressure headers
  isFlashCondensateIntoHeaderDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].flashCondensateIntoHeader !== modification.headerInput[headerTypeString].flashCondensateIntoHeader) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDesuperheatSteamIntoNextHighestDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].desuperheatSteamIntoNextHighest !== modification.headerInput[headerTypeString].desuperheatSteamIntoNextHighest) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDesuperheatSteamTemperatureDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].desuperheatSteamTemperature !== modification.headerInput[headerTypeString].desuperheatSteamTemperature) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }



  //TURBINES
  checkTurbinesDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      return (
        this.isCondensingTurbineDifferent(baseline, modification) ||
        this.isHighToMediumTurbineDifferent(baseline, modification) ||
        this.isHighToLowTurbineDifferent(baseline, modification) ||
        this.isMediumToLowTurbineDifferent(baseline, modification)
      );
    } else {
      return false;
    }
  }

  isCondensingTurbineDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput.condensingTurbine.useTurbine || modification.turbineInput.condensingTurbine.useTurbine) {
        if (
          this.isIsentropicEfficiencyDifferent('condensingTurbine', baseline, modification) ||
          this.isGenerationEfficiencyDifferent('condensingTurbine', baseline, modification) ||
          this.isCondenserPressureDifferent('condensingTurbine', baseline, modification) ||
          this.isOperationTypeDifferent('condensingTurbine', baseline, modification) ||
          this.isOperationValueDifferent(baseline, modification) ||
          this.isUseTurbineDifferent('condensingTurbine', baseline, modification)
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isHighToMediumTurbineDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput.highToMediumTurbine.useTurbine || modification.turbineInput.highToMediumTurbine.useTurbine) {
        if (this.isPressureTurbineDifferent('highToMediumTurbine', baseline, modification)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isHighToLowTurbineDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput.highToLowTurbine.useTurbine || modification.turbineInput.highToLowTurbine.useTurbine) {
        if (this.isPressureTurbineDifferent('highToLowTurbine', baseline, modification)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isMediumToLowTurbineDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput.mediumToLowTurbine.useTurbine || modification.turbineInput.mediumToLowTurbine.useTurbine) {
        if (this.isPressureTurbineDifferent('mediumToLowTurbine', baseline, modification)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  isPressureTurbineDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT) {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (
        this.isIsentropicEfficiencyDifferent(turbineTypeString, baseline, modification) ||
        this.isGenerationEfficiencyDifferent(turbineTypeString, baseline, modification) ||
        this.isOperationTypeDifferent(turbineTypeString, baseline, modification) ||
        this.isOperationValue1Different(turbineTypeString, baseline, modification) ||
        this.isOperationValue2Different(turbineTypeString, baseline, modification) ||
        this.isUseTurbineDifferent(turbineTypeString, baseline, modification)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isIsentropicEfficiencyDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].isentropicEfficiency !== modification.turbineInput[turbineTypeString].isentropicEfficiency) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }

    } else {
      return false;
    }
  }

  isGenerationEfficiencyDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].generationEfficiency !== modification.turbineInput[turbineTypeString].generationEfficiency) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isCondenserPressureDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].condenserPressure !== modification.turbineInput[turbineTypeString].condenserPressure) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isOperationTypeDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].operationType !== modification.turbineInput[turbineTypeString].operationType) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isOperationValueDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput.condensingTurbine && modification.turbineInput.condensingTurbine) {
        if (baseline.turbineInput.condensingTurbine.operationValue !== modification.turbineInput.condensingTurbine.operationValue) {
          return true;
        } else {
          return false;
        }
      }
    } else if (baseline.turbineInput.condensingTurbine && !modification.turbineInput.condensingTurbine || !baseline.turbineInput.condensingTurbine && modification.turbineInput.condensingTurbine) {
      return true;
    } else {
      return false;
    }
  }

  isUseTurbineDifferent(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].useTurbine !== modification.turbineInput[turbineTypeString].useTurbine) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isOperationValue1Different(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].operationType != 2 && modification.turbineInput[turbineTypeString].operationType != 2) {
          if (baseline.turbineInput[turbineTypeString].operationValue1 !== modification.turbineInput[turbineTypeString].operationValue1) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isOperationValue2Different(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].operationType == 3 || modification.turbineInput[turbineTypeString].operationType == 3
          || baseline.turbineInput[turbineTypeString].operationType == 4 || modification.turbineInput[turbineTypeString].operationType == 4) {
          if (baseline.turbineInput[turbineTypeString].operationValue2 !== modification.turbineInput[turbineTypeString].operationValue2) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (baseline.turbineInput[turbineTypeString] && !modification.turbineInput[turbineTypeString] || !baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }


  getBadges(baseline: SSMT, modification: SSMT): Array<{ badge: string, componentStr: string }> {
    let badges: Array<{ badge: string, componentStr: string }> = [];
    if (baseline && modification) {
      if (this.checkOperationsDifferent(baseline, modification)) {
        badges.push({ badge: 'Operations', componentStr: 'operations' });
      }
      if (this.checkBoilerDifferent(baseline, modification)) {
        badges.push({ badge: 'Boiler', componentStr: 'boiler' });
      }
      if (this.checkHeaderDifferent(baseline, modification)) {
        badges.push({ badge: 'Header', componentStr: 'header' });
      }
      if (this.checkTurbinesDifferent(baseline, modification)) {
        badges.push({ badge: 'Turbine', componentStr: 'turbine' });
      }
    }
    return badges;
  }
}
