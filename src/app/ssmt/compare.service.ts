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
      if (baseline.turbineInput[turbineTypeString].isentropicEfficiency != modification.turbineInput[turbineTypeString].isentropicEfficiency) {
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
      if (baseline.turbineInput[turbineTypeString].generationEfficiency != modification.turbineInput[turbineTypeString].generationEfficiency) {
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
      if (baseline.turbineInput[turbineTypeString].condenserPressure != modification.turbineInput[turbineTypeString].condenserPressure) {
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
      if (baseline.turbineInput[turbineTypeString].operationType != modification.turbineInput[turbineTypeString].operationType) {
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
      if (baseline.turbineInput.condensingTurbine.operationValue != modification.turbineInput.condensingTurbine.operationValue) {
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
      if (baseline.turbineInput[turbineTypeString].useTurbine != modification.turbineInput[turbineTypeString].useTurbine) {
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
      if (baseline.turbineInput[turbineTypeString].operationValue1 != modification.turbineInput[turbineTypeString].operationValue1) {
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
      if (baseline.turbineInput[turbineTypeString].operationValue2 != modification.turbineInput[turbineTypeString].operationValue2) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

}
