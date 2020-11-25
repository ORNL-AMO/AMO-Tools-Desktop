import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ChargeMaterial, GasChargeMaterial, LiquidChargeMaterial, SolidChargeMaterial } from '../../../shared/models/phast/losses/chargeMaterial';
import { GreaterThanValidator } from '../../../shared/validators/greater-than';

@Injectable()
export class ChargeMaterialFormService {
  constructor(private formBuilder: FormBuilder) {
  }

  checkWarningsExist(warnings: GasMaterialWarnings | LiquidMaterialWarnings | SolidMaterialWarnings): boolean {
    let hasWarning: boolean = false;
    for (var key in warnings) {
      if (warnings[key] !== null) {
        hasWarning = true;
      }
    }
    return hasWarning;
  }

  checkFeedRate(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.feedRate < 0) {
      return 'Feed Rate must be greater than 0';
    } else {
      return null;
    }
  }

  checkHeatOfReaction(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.reactionHeat < 0) {
      return 'Heat of Reaction cannot be less than zero. For exothermic reactions, change "Endothermic/Exothermic"';
    } else {
      return null;
    }
  }

  checkInitialTemp(material: GasChargeMaterial | LiquidChargeMaterial | SolidChargeMaterial): string {
    if (material.initialTemperature > material.dischargeTemperature) {
      return "Initial Temperature  (" + material.initialTemperature + ") cannot be greater than Outlet Temperature (" + material.dischargeTemperature + ")";
    }
    else {
      return null;
    }
  }
  
  //gas & liquid
  checkSpecificHeatOfVapor(material: GasChargeMaterial | LiquidChargeMaterial): string {
    if (material.specificHeatVapor < 0) {
      return 'Specific Heat of Vapor must positive';
    } else {
      return null;
    }
  }

  checkPercentReacted(material: GasChargeMaterial | LiquidChargeMaterial): string {
    if (material.percentReacted < 0) {
      return 'Feed Gas Reacted must be positive';
    } else if (material.percentReacted > 100) {
      return 'Feed Gas Reacted must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkGasWarnings(material: GasChargeMaterial): GasMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      specificHeatGasWarning: this.checkSpecificHeatGas(material),
      feedGasRateWarning: this.checkFeedRate(material),
      gasMixVaporWarning: this.checkVaporInGas(material),
      specificHeatGasVaporWarning: this.checkSpecificHeatOfVapor(material),
      feedGasReactedWarning: this.checkPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material)
    };
  }

  checkSpecificHeatGas(material: GasChargeMaterial): string {
    if (material.specificHeatGas < 0) {
      return 'Specific Heat of Gas must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkVaporInGas(material: GasChargeMaterial): string {
    if (material.percentVapor < 0) {
      return 'Vapor in Gas Mixture must be positive';
    } else if (material.percentVapor > 100) {
      return 'Vapor in Gas Mixture must be equal to or less than 100%';
    }
    else {
      return null;
    }
  }

  checkLiquidWarnings(material: LiquidChargeMaterial): LiquidMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      dischargeTempWarning: this.checkDischargeTemp(material),
      specificHeatLiquidWarning: this.checkSpecificHeatLiquid(material),
      specificHeatVaporWarning: this.checkSpecificHeatOfVapor(material),
      feedLiquidRateWarning: this.checkFeedRate(material),
      chargeVaporWarning: this.checkLiquidVaporized(material),
      chargeReactedWarning: this.checkPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material),
      inletOverVaporizingWarning: this.checkInletOverVaporizing(material),
      outletOverVaporizingWarning: this.checkOutletOverVaporizing(material),
      materialLatentHeatWarning: this.checkLiquidLatentHeat(material)
    };
  }

  checkLiquidLatentHeat(material: LiquidChargeMaterial): string {
    if (material.latentHeat < 0) {
      return 'Latent Heat of Vaporization must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkLiquidVaporized(material: LiquidChargeMaterial): string {
    if (material.percentVaporized < 0) {
      return 'Charge Liquid Vaporized must be positive';
    } else if (material.percentVaporized > 100) {
      return 'Charge Liquid Vaporized must be less than or equal to 100%';
    } else {
      return null;
    }
  }

  checkDischargeTemp(material: LiquidChargeMaterial): string {
    if ((material.dischargeTemperature > material.vaporizingTemperature) && material.percentVaporized === 0) {
      return 'The discharge temperature is higher than the Vaporizing Temperature, please enter proper percentage for charge vaporized.';
    } else if ((material.dischargeTemperature < material.vaporizingTemperature) && material.percentVaporized > 0) {
      return 'The discharge temperature is lower than the vaporizing temperature, the percentage for charge liquid vaporized should be 0%.';
    } else {
      return null;
    }
  }

  checkInletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.initialTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The initial temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    } else {
      return null;
    }
  }
  checkOutletOverVaporizing(material: LiquidChargeMaterial): string {
    if (material.dischargeTemperature > material.vaporizingTemperature && material.percentVaporized <= 0) {
      return "The discharge temperature is higher than the vaporization point, please enter proper percentage for charge vaporized.";
    }
    else {
      return null;
    }
  }

  checkSpecificHeatLiquid(material: LiquidChargeMaterial): string {
    if (material.specificHeatLiquid < 0) {
      return 'Specific Heat of Liquid must be equal or greater than 0';
    } else {
      return null;
    }
  }

  checkSolidWarnings(material: SolidChargeMaterial): SolidMaterialWarnings {
    return {
      initialTempWarning: this.checkInitialTemp(material),
      // specificHeatWarning: this.checkSpecificHeatOfSolid(material),
      // latentHeatWarning: this.checkLatentHeatOfFusion(material),
      // heatOfLiquidWarning: this.checkHeatOfLiquid(material),
      feedRateWarning: this.checkFeedRate(material),
      // waterChargedWarning: this.checkWaterContentCharged(material),
      // waterDischargedWarning: this.checkWaterContentDischarged(material),
      // chargeMeltedWarning: this.checkPercentMelted(material),
      // chargeSolidReactedWarning: this.checkSolidPercentReacted(material),
      heatOfReactionWarning: this.checkHeatOfReaction(material),
      dischargeTempWarning: this.checkDischargeTemperature(material),
      initialOverMeltWarning: this.checkInitialOverMelting(material)
    };
  }

  // checkSpecificHeatOfSolid(material: SolidChargeMaterial): string {
  //   if (material.specificHeatSolid < 0) {
  //     return 'Average Specific Heat must be equal or greater than 0';
  //   } else {
  //     return null;
  //   }
  // }

  // checkLatentHeatOfFusion(material: SolidChargeMaterial): string {
  //   if (material.latentHeat < 0) {
  //     return 'Latent Heat of Fusion must be equal or greater than 0';
  //   } else {
  //     return null;
  //   }
  // }

  // checkHeatOfLiquid(material: SolidChargeMaterial): string {
  //   if (material.specificHeatLiquid < 0) {
  //     return 'Specific heat of liquid from molten material must be equal or greater than 0';
  //   } else {
  //     return null;
  //   }
  // }


  // checkWaterContentCharged(material: SolidChargeMaterial): string {
  //   if (material.waterContentCharged < 0) {
  //     return 'Water Content as Charged must be equal or greater than 0%';
  //   } else if (material.waterContentCharged > 100) {
  //     return 'Water Content as Charged must be less than or equal to 100%';
  //   } else {
  //     return null;
  //   }
  // }

  // checkWaterContentDischarged(material: SolidChargeMaterial): string {
  //   if (material.waterContentDischarged < 0) {
  //     return 'Water Content as Discharged must be equal or greater than 0%';
  //   } else if (material.waterContentDischarged > 100) {
  //     return 'Water Content as Discharged must be less than or equal to 100%';
  //   } else {
  //     return null;
  //   }
  // }

  // checkPercentMelted(material: SolidChargeMaterial): string {
  //   if (material.chargeMelted < 0) {
  //     return 'Charge Melted must be equal or greater than 0%';
  //   } else if (material.chargeMelted > 100) {
  //     return 'Charge Melted must be less than or equal to 100%';
  //   } else {
  //     return null;
  //   }
  // }

  // checkSolidPercentReacted(material: SolidChargeMaterial): string {
  //   if (material.chargeReacted < 0) {
  //     return 'Charge Reacted must be equal or greater than 0%';
  //   } else if (material.chargeReacted > 100) {
  //     return 'Charge Reacted must be less than or equal to 100%';
  //   } else {
  //     return null;
  //   }
  // }

  checkDischargeTemperature(material: SolidChargeMaterial): string {
    if ((material.dischargeTemperature > material.meltingPoint) && material.chargeMelted === 0) {
      return 'The discharge temperature is higher than the melting point, please enter proper percentage for charge melted.';
    } else if ((material.dischargeTemperature < material.meltingPoint) && material.chargeMelted > 0) {
      return 'The discharge temperature is lower than the melting point, the percentage for charge melted should be 0%.';
    } else {
      return null;
    }
  }

  checkInitialOverMelting(material: SolidChargeMaterial): string {
    if (material.initialTemperature > material.meltingPoint && material.chargeMelted <= 0) {
      return "The initial temperature is higher than the melting point, please enter proper percentage for charge melted.";
    }
    // Added by koa 11/24
    else if ((material.initialTemperature < material.meltingPoint) && material.chargeMelted > 0){
      return '**The initial temperature is lower than the melting point, the percentage for **charge melted should be 0%.';
    } else {
      return null;
    }
  }
}


export interface GasMaterialWarnings {
  initialTempWarning: string;
  specificHeatGasWarning: string;
  feedGasRateWarning: string;
  gasMixVaporWarning: string;
  specificHeatGasVaporWarning: string;
  feedGasReactedWarning: string;
  heatOfReactionWarning: string;
}

export interface LiquidMaterialWarnings {
  initialTempWarning: string;
  dischargeTempWarning: string;
  specificHeatLiquidWarning: string;
  specificHeatVaporWarning: string;
  feedLiquidRateWarning: string;
  chargeVaporWarning: string;
  chargeReactedWarning: string;
  heatOfReactionWarning: string;
  inletOverVaporizingWarning: string;
  outletOverVaporizingWarning: string;
  materialLatentHeatWarning: string;
}

export interface SolidMaterialWarnings {
  initialTempWarning: string;
  // specificHeatWarning: string;
  // latentHeatWarning: string;
  // heatOfLiquidWarning: string;
  feedRateWarning: string;
  // waterChargedWarning: string;
  // waterDischargedWarning: string;
  // chargeMeltedWarning: string;
  // chargeSolidReactedWarning: string;
  heatOfReactionWarning: string;
  dischargeTempWarning: string;
  initialOverMeltWarning: string;
}
