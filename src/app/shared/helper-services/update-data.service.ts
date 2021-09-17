import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { Settings } from '../models/settings';
import { SettingsService } from '../../settings/settings.service';
import { SSMT } from '../models/steam/ssmt';
import { CompressedAirPressureReductionTreasureHunt, LightingReplacementTreasureHunt, Treasure, TreasureHuntOpportunity } from '../models/treasure-hunt';
import { LightingReplacementData } from '../models/lighting';
import { FSAT } from '../models/fans';
import { CompressedAirPressureReductionData } from '../models/standalone';
import { PSAT } from '../models/psat';
declare const packageJson;

@Injectable()
export class UpdateDataService {

    constructor(private settingsService: SettingsService) { }

    checkAssessment(assessment: Assessment): Assessment {
        if (this.checkAssessmentVersionDifferent(assessment) === false) {
            return assessment;
        } else {
            if (assessment.type === 'PSAT') {
                return this.updatePsat(assessment);
            }
            if (assessment.type === 'FSAT') {
                return this.updateFsat(assessment);
            } else if (assessment.type === 'PHAST') {
                return this.updatePhast(assessment);
            } else if (assessment.type == 'SSMT') {
                return this.updateSSMT(assessment);
            } else if (assessment.type === 'TreasureHunt') {
                return this.updateTreasureHunt(assessment);
            }
            else {
                return assessment;
            }
        }
    }

    checkAssessmentVersionDifferent(assessment: Assessment): boolean {
        if (assessment.appVersion !== packageJson.version) {
            return true;
        } else {
            return false;
        }
    }


    updatePsat(assessment: Assessment): Assessment {
        //logic for updating psat data
        assessment.appVersion = packageJson.version;

        if(assessment.psat.modifications){
            assessment.psat.modifications.forEach(mod => {
                mod.psat = this.addWhatIfScenarioPsat(mod.psat);
            })
        }

        return assessment;
    }

    addWhatIfScenarioPsat(psat: PSAT): PSAT {
        if(!psat.inputs.whatIfScenario) {
            psat.inputs.whatIfScenario = true;
        }
        return psat;
    }

    updateFsat(assessment: Assessment): Assessment {
        //logic for updating fsat data
        assessment.appVersion = packageJson.version;
        if (assessment.fsat.fieldData && !assessment.fsat.fieldData.inletVelocityPressure) {
            assessment.fsat.fieldData.inletVelocityPressure = 0;
            assessment.fsat.fieldData.usingStaticPressure = true;
        }

        assessment.fsat = this.updateSpecificHeatRatio(assessment.fsat);
        if(!assessment.fsat.fsatOperations){
            assessment.fsat = this.addFsatOperations(assessment.fsat);
        }
        if(assessment.fsat.modifications){
            assessment.fsat.modifications.forEach(mod => {
                mod.fsat = this.updateSpecificHeatRatio(mod.fsat);
                mod.fsat = this.addWhatIfScenarioFsat(mod.fsat);
                mod.fsat = this.addFsatOperations(mod.fsat);
            });
        }
        return assessment;
    }

    addWhatIfScenarioFsat(fsat: FSAT): FSAT {
        if(!fsat.whatIfScenario) {
            fsat.whatIfScenario = true;
        }
        return fsat;
    }

    addFsatOperations(fsat: FSAT): FSAT {
        if(!fsat.fsatOperations) {
            if (fsat.fieldData['operatingHours']){
                fsat.fsatOperations.operatingHours = fsat.fieldData['operatingHours'];
            } else {
                fsat.fsatOperations.operatingHours = 8760;
            }
            if (fsat.fieldData['cost']){
                fsat.fsatOperations.cost = fsat.fieldData['cost'];
            } else {
                fsat.fsatOperations.cost = 0.06;
            }
        }
        return fsat;
    }

    updateSpecificHeatRatio(fsat: FSAT): FSAT {
        if(fsat.fieldData['specificHeatRatio'] && !fsat.baseGasDensity.specificHeatRatio) {
            fsat.baseGasDensity.specificHeatRatio = fsat.fieldData['specificHeatRatio']; 
        }
        return fsat;
    }

    updatePhast(assessment: Assessment): Assessment {
        //logic for updating phast data
        if (!assessment.phast.operatingHours) {
            assessment.phast.operatingHours = {
                weeksPerYear: 52.14,
                daysPerWeek: 7,
                hoursPerDay: 24,
                minutesPerHour: 60,
                secondsPerMinute: 60,
                hoursPerYear: 8760
            };
        }
        if (!assessment.phast.operatingCosts) {
            assessment.phast.operatingCosts = {
                fuelCost: 3.99,
                steamCost: 4.69,
                electricityCost: .066
            };
        }
        assessment.appVersion = packageJson.version;
        return assessment;
    }

    checkSettingsVersionDifferent(settings: Settings): boolean {
        if (settings.appVersion !== packageJson.version) {
            return true;
        } else {
            return false;
        }
    }

    checkSettings(settings: Settings): Settings {
        if (this.checkSettingsVersionDifferent(settings) === false) {
            return settings;
        } else {
            return this.updateSettings(settings);
        }
    }

    updateSettings(settings: Settings): Settings {
        settings = this.settingsService.setEnergyResultUnitSetting(settings);
        settings = this.settingsService.setTemperatureUnit(settings);
        if (!settings.fuelCost) {
            settings.fuelCost = 3.99;
        }
        if (!settings.steamCost) {
            settings.steamCost = 4.69;
        }
        if (!settings.electricityCost) {
            settings.electricityCost = .066;
        }
        settings.appVersion = packageJson.version;
        return settings;
    }

    updateSSMT(assessment: Assessment): Assessment {
        assessment.ssmt = this.updateHeaders(assessment.ssmt);
        if (assessment.ssmt.modifications) {
            assessment.ssmt.modifications.forEach(mod => {
                mod.ssmt = this.updateHeaders(mod.ssmt);
            })
        };
        return assessment;
    }

    updateHeaders(ssmt: SSMT) {
        if (ssmt.headerInput.highPressureHeader == undefined && ssmt.headerInput.highPressure != undefined) {
            ssmt.headerInput.highPressureHeader = ssmt.headerInput.highPressure;
        }
        if (ssmt.headerInput.mediumPressureHeader == undefined && ssmt.headerInput.mediumPressure != undefined) {
            ssmt.headerInput.mediumPressureHeader = ssmt.headerInput.mediumPressure;
        }
        if (ssmt.headerInput.lowPressureHeader == undefined && ssmt.headerInput.lowPressure != undefined) {
            ssmt.headerInput.lowPressureHeader = ssmt.headerInput.lowPressure;
        }
        return ssmt;
    }
    updateTreasureHunt(assessment: Assessment): Assessment {
        if (assessment.treasureHunt) {
            if (assessment.treasureHunt.lightingReplacements) {
                assessment.treasureHunt.lightingReplacements.forEach(replacement => {
                    replacement = this.updateLightingReplacementTreasureHunt(replacement);
                    replacement.opportunityType = Treasure.lightingReplacement;
                });
            }
            if (assessment.treasureHunt.opportunitySheets) {
                assessment.treasureHunt.opportunitySheets.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.opportunitySheet;
                });
            }
            if (assessment.treasureHunt.replaceExistingMotors) {
                assessment.treasureHunt.replaceExistingMotors.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.replaceExisting;
                });
            }
            if (assessment.treasureHunt.motorDrives) {
                assessment.treasureHunt.motorDrives.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.motorDrive;
                });
            }
            if (assessment.treasureHunt.naturalGasReductions) {
                assessment.treasureHunt.naturalGasReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.naturalGasReduction;
                });
            }
            if (assessment.treasureHunt.electricityReductions) {
                assessment.treasureHunt.electricityReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.electricityReduction;
                });
            }
            if (assessment.treasureHunt.compressedAirReductions) {
                assessment.treasureHunt.compressedAirReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.compressedAir;
                });
            }
            if (assessment.treasureHunt.compressedAirPressureReductions) {
                assessment.treasureHunt.compressedAirPressureReductions.forEach(opportunity => {
                    opportunity = this.updateCompressedAirPressureReductionTreasureHunt(opportunity);
                    opportunity.opportunityType = Treasure.compressedAirPressure;
                });
            }
            if (assessment.treasureHunt.waterReductions) {
                assessment.treasureHunt.waterReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.waterReduction;
                });
            }
            if (assessment.treasureHunt.steamReductions) {
                assessment.treasureHunt.steamReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.steamReduction;
                });
            }
            if (assessment.treasureHunt.pipeInsulationReductions) {
                assessment.treasureHunt.pipeInsulationReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.pipeInsulation;
                });
            }
            if (assessment.treasureHunt.tankInsulationReductions) {
                assessment.treasureHunt.tankInsulationReductions.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.tankInsulation;
                });
            }
            if (assessment.treasureHunt.airLeakSurveys) {
                assessment.treasureHunt.airLeakSurveys.forEach(opportunity => {
                    opportunity.opportunityType = Treasure.airLeak;
                });
            }
            
        }
        return assessment;
    }

    updateLightingReplacementTreasureHunt(lightingReplacementTreasureHunt: LightingReplacementTreasureHunt): LightingReplacementTreasureHunt {
        if (lightingReplacementTreasureHunt.baseline) {
            lightingReplacementTreasureHunt.baseline.forEach(replacement => {
                replacement = this.updateLightingReplacement(replacement);
            });
        }
        if (lightingReplacementTreasureHunt.modifications) {
            lightingReplacementTreasureHunt.modifications.forEach(replacement => {
                replacement = this.updateLightingReplacement(replacement);
            });
        }
        return lightingReplacementTreasureHunt;
    }


    updateLightingReplacement(lightingReplacement: LightingReplacementData): LightingReplacementData {
        if (lightingReplacement.ballastFactor == undefined) {
            lightingReplacement.ballastFactor = 1;
        }
        if (lightingReplacement.lumenDegradationFactor == undefined) {
            lightingReplacement.lumenDegradationFactor = 1;
        }
        if (lightingReplacement.coefficientOfUtilization == undefined) {
            lightingReplacement.coefficientOfUtilization = 1;
        }
        if (lightingReplacement.category == undefined) {
            lightingReplacement.category = 0;
        }
        return lightingReplacement;
    }

    updateCompressedAirPressureReductionTreasureHunt(compressedAirPressureReductionTreasureHunt: CompressedAirPressureReductionTreasureHunt): CompressedAirPressureReductionTreasureHunt {
        if (compressedAirPressureReductionTreasureHunt.baseline) {
            compressedAirPressureReductionTreasureHunt.baseline.forEach(reduction => {
                reduction = this.updateCompressedAirPressureReduction(reduction);
            });
        }
        if (compressedAirPressureReductionTreasureHunt.modification) {
            compressedAirPressureReductionTreasureHunt.modification.forEach(reduction => {
                reduction = this.updateCompressedAirPressureReduction(reduction);
            });
        }
        return compressedAirPressureReductionTreasureHunt;
    }


    updateCompressedAirPressureReduction(compressedAirPressureReduction: CompressedAirPressureReductionData): CompressedAirPressureReductionData {
        if (compressedAirPressureReduction.powerType === undefined) {
            compressedAirPressureReduction.powerType = 'Measured';
        }
        return compressedAirPressureReduction;
    }
}
