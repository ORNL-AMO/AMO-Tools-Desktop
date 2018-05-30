import { Injectable } from '@angular/core';
import { FSAT } from '../shared/models/fans';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class CompareService {
  baselineFSAT: FSAT;
  modifiedFSAT: FSAT;
  selectedModification: BehaviorSubject<FSAT>;
  constructor() {
    this.selectedModification = new BehaviorSubject<FSAT>(undefined);
  }


  setCompareVals(fsat: FSAT, selectedModIndex: number) {
    this.baselineFSAT = fsat;
    if (fsat.modifications) {
      if (fsat.modifications.length != 0) {
        this.selectedModification.next(fsat.modifications[selectedModIndex].fsat);
        this.modifiedFSAT = this.selectedModification.value;
      } else {
        this.selectedModification.next(undefined);
        this.modifiedFSAT = undefined;
      }
    } else {
      this.selectedModification.next(undefined);
      this.modifiedFSAT = undefined;
    }
  }

  checkFluidDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      return (
        this.isDryBulbTempDifferent(baseline, modification) ||
        this.isStaticPressureDifferent(baseline, modification) ||
        this.isBarometricPressureDifferent(baseline, modification) ||
        this.isGasDensityDifferent(baseline, modification) ||
        this.isGasTypeDifferent(baseline, modification) ||
        this.isConditionLocationDifferent(baseline, modification) ||
        this.isSpecificGravityDifferent(baseline, modification) ||
        this.isInputTypeDifferent(baseline, modification) ||
        this.isDewPointDifferent(baseline, modification) ||
        this.isRelativeHumidityDifferent(baseline, modification) ||
        this.isWetBulbTempDifferent(baseline, modification) ||
        this.isSpecificHeatGasDifferent(baseline, modification)
      )
    } else {
      return false;
    }
  }


  isDryBulbTempDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.dryBulbTemp != modification.baseGasDensity.dryBulbTemp) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isStaticPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.staticPressure != modification.baseGasDensity.staticPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isBarometricPressureDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.barometricPressure != modification.baseGasDensity.barometricPressure) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isGasDensityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.gasDensity != modification.baseGasDensity.gasDensity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isGasTypeDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.gasType != modification.baseGasDensity.gasType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isConditionLocationDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.conditionLocation != modification.baseGasDensity.conditionLocation) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isSpecificGravityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.specificGravity != modification.baseGasDensity.specificGravity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  isInputTypeDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.inputType != modification.baseGasDensity.inputType) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isDewPointDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.dewPoint != modification.baseGasDensity.dewPoint) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isRelativeHumidityDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.relativeHumidity != modification.baseGasDensity.relativeHumidity) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isWetBulbTempDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.wetBulbTemp != modification.baseGasDensity.wetBulbTemp) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  isSpecificHeatGasDifferent(baseline?: FSAT, modification?: FSAT) {
    if (!baseline) {
      baseline = this.baselineFSAT;
    }
    if (!modification) {
      modification = this.modifiedFSAT;
    }
    if (baseline && modification) {
      if (baseline.baseGasDensity.specificHeatGas != modification.baseGasDensity.specificHeatGas) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
