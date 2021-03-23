import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { Settings } from '../models/settings';
import { SettingsService } from '../../settings/settings.service';
import { SSMT } from '../models/steam/ssmt';
import { LightingReplacementTreasureHunt } from '../models/treasure-hunt';
import { LightingReplacementData } from '../models/lighting';
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
        return assessment;
    }

    updateFsat(assessment: Assessment): Assessment {
        //logic for updating fsat data
        assessment.appVersion = packageJson.version;
        if (!assessment.fsat.fieldData.inletVelocityPressure) {
            assessment.fsat.fieldData.inletVelocityPressure = 0;
            assessment.fsat.fieldData.usingStaticPressure = true;
        }

        if(assessment.fsat.fieldData['specificHeatRatio']) {
            assessment.fsat.baseGasDensity.specificHeatRatio = assessment.fsat.fieldData['specificHeatRatio']; 
        }
        return assessment;
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
                })
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
}
