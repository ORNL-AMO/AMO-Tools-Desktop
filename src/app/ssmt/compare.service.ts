import { Injectable } from '@angular/core';
import { SSMT, PressureTurbine } from '../shared/models/steam/ssmt';
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
  checkOperationsDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      return (
        this.isSitePowerImportDifferent(baseline, modification) ||
        this.isMakeUpWaterTemperatureDifferent(baseline, modification) ||
        this.isHoursPerYearDifferent(baseline, modification) ||
        this.isFuelCostDifferent(baseline, modification) ||
        this.isElectricityCostDifferent(baseline, modification) ||
        this.isMakeUpWaterCostsDifferent(baseline, modification)
      )
    } else {
      return false;
    }
  }

  // sitePowerImport
  isSitePowerImportDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isMakeUpWaterTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isHoursPerYearDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isFuelCostDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isElectricityCostDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isMakeUpWaterCostsDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
        this.isPreheatMakeupWaterDifferent(baseline, modification) ||
        this.isSteamTemperatureDifferent(baseline, modification) ||
        this.isDeaeratorVentRateDifferent(baseline, modification) ||
        this.isDeaeratorPressureDifferent(baseline, modification) ||
        this.isApproachTemperatureDifferent(baseline, modification)
      )
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
  isFuelDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isCombustionEfficiencyDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isBlowdownRateDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isBlowdownFlashedDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isPreheatMakeupWaterDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isSteamTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isDeaeratorVentRateDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isDeaeratorPressureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  isApproachTemperatureDifferent(baseline?: SSMT, modification?: SSMT): boolean {
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
  checkHeaderDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }

    if (baseline && modification) {
      if (baseline.headerInput.numberOfHeaders == 1) {
        return (
          this.isHighPressureHeaderDifferent()
        )
      } else if (baseline.headerInput.numberOfHeaders == 2) {
        return (
          this.isHighPressureHeaderDifferent() ||
          this.isLowPressureHeaderDifferent()
        )
      } else if (baseline.headerInput.numberOfHeaders == 3) {
        return (
          this.isHighPressureHeaderDifferent() ||
          this.isMediumPressureHeaderDifferent() ||
          this.isLowPressureHeaderDifferent()
        )
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
        this.isPressureDifferent('highPressure', baseline, modification) ||
        this.isProcessSteamUsageDifferent('highPressure', baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('highPressure', baseline, modification) ||
        this.isHeatLossDifferent('highPressure', baseline, modification) ||
        this.isCondensateReturnTemperatureDifferent(baseline, modification) ||
        this.isFlashCondensateReturnDifferent(baseline, modification)
      )
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
        this.isPressureDifferent('mediumPressure', baseline, modification) ||
        this.isProcessSteamUsageDifferent('mediumPressure', baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('mediumPressure', baseline, modification) ||
        this.isHeatLossDifferent('mediumPressure', baseline, modification) ||
        this.isFlashCondensateIntoHeaderDifferent('mediumPressure', baseline, modification) ||
        this.isDesuperheatSteamIntoNextHighestDifferent('mediumPressure', baseline, modification) ||
        this.isDesuperheatSteamTemperatureDifferent('mediumPressure', baseline, modification)
      )
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
        this.isPressureDifferent('lowPressure', baseline, modification) ||
        this.isProcessSteamUsageDifferent('lowPressure', baseline, modification) ||
        this.isCondensationRecoveryRateDifferent('lowPressure', baseline, modification) ||
        this.isHeatLossDifferent('lowPressure', baseline, modification) ||
        this.isFlashCondensateIntoHeaderDifferent('lowPressure', baseline, modification) ||
        this.isDesuperheatSteamIntoNextHighestDifferent('lowPressure', baseline, modification) ||
        this.isDesuperheatSteamTemperatureDifferent('lowPressure', baseline, modification)
      )
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
      if (baseline.headerInput[headerTypeString].pressure != modification.headerInput[headerTypeString].pressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isProcessSteamUsageDifferent(headerTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.headerInput[headerTypeString].processSteamUsage != modification.headerInput[headerTypeString].processSteamUsage) {
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
      if (baseline.headerInput[headerTypeString].condensationRecoveryRate != modification.headerInput[headerTypeString].condensationRecoveryRate) {
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
      if (baseline.headerInput[headerTypeString].heatLoss != modification.headerInput[headerTypeString].heatLoss) {
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
      if (baseline.headerInput.highPressure.condensateReturnTemperature != modification.headerInput.highPressure.condensateReturnTemperature) {
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
      if (baseline.headerInput.highPressure.flashCondensateReturn != modification.headerInput.highPressure.flashCondensateReturn) {
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
      if (baseline.headerInput[headerTypeString].flashCondensateIntoHeader != modification.headerInput[headerTypeString].flashCondensateIntoHeader) {
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
      if (baseline.headerInput[headerTypeString].desuperheatSteamIntoNextHighest != modification.headerInput[headerTypeString].desuperheatSteamIntoNextHighest) {
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
      if (baseline.headerInput[headerTypeString].desuperheatSteamTemperature != modification.headerInput[headerTypeString].desuperheatSteamTemperature) {
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
        this.isCondensingTurbineDifferent() ||
        this.isHighToMediumTurbineDifferent() ||
        this.isHighToLowTurbineDifferent() ||
        this.isMediumToLowTurbineDifferent()
      )
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
  }

  isHighToMediumTurbineDifferent(baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (this.isPressureTurbineDifferent('highToMediumTurbine', baseline, modification)) {
        return true;
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
      if (this.isPressureTurbineDifferent('highToLowTurbine', baseline, modification)) {
        return true;
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
      if (this.isPressureTurbineDifferent('mediumToLowTurbine', baseline, modification)) {
        return true;
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
        if (baseline.turbineInput[turbineTypeString].isentropicEfficiency != modification.turbineInput[turbineTypeString].isentropicEfficiency) {
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
        if (baseline.turbineInput[turbineTypeString].generationEfficiency != modification.turbineInput[turbineTypeString].generationEfficiency) {
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
        if (baseline.turbineInput[turbineTypeString].condenserPressure != modification.turbineInput[turbineTypeString].condenserPressure) {
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
        if (baseline.turbineInput[turbineTypeString].operationType != modification.turbineInput[turbineTypeString].operationType) {
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
        if (baseline.turbineInput.condensingTurbine.operationValue != modification.turbineInput.condensingTurbine.operationValue) {
          return true;
        } else {
          return false;
        }
      } else if (baseline.turbineInput.condensingTurbine && !modification.turbineInput.condensingTurbine || !baseline.turbineInput.condensingTurbine && modification.turbineInput.condensingTurbine) {
        return true;
      } else {
        return false;
      }
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
        if (baseline.turbineInput[turbineTypeString].useTurbine != modification.turbineInput[turbineTypeString].useTurbine) {
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
        if (baseline.turbineInput[turbineTypeString].operationValue1 != modification.turbineInput[turbineTypeString].operationValue1) {
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

  isOperationValue2Different(turbineTypeString: string, baseline?: SSMT, modification?: SSMT): boolean {
    if (!baseline) {
      baseline = this.baselineSSMT;
    }
    if (!modification) {
      modification = this.modifiedSSMT;
    }
    if (baseline && modification) {
      if (baseline.turbineInput[turbineTypeString] && modification.turbineInput[turbineTypeString]) {
        if (baseline.turbineInput[turbineTypeString].operationValue2 != modification.turbineInput[turbineTypeString].operationValue2) {
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


  getBadges(baseline: SSMT, modification: SSMT): Array<{ badge: string, componentStr: string }> {
    let badges: Array<{ badge: string, componentStr: string }> = [];
    if (baseline && modification) {
      if (this.checkOperationsDifferent(baseline, modification)) {
        badges.push({ badge: 'Operations', componentStr: 'operations' })
      }
      if (this.checkBoilerDifferent(baseline, modification)) {
        badges.push({ badge: 'Boiler', componentStr: 'boiler' })
      }
      if (this.checkHeaderDifferent(baseline, modification)) {
        badges.push({ badge: 'Header', componentStr: 'header' })
      }
      if (this.checkTurbinesDifferent(baseline, modification)) {
        badges.push({ badge: 'Turbine', componentStr: 'turbine' })
      }
    }
    return badges;
  }
}
