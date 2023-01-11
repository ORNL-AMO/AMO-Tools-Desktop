import { Injectable } from '@angular/core';
import { Assessment } from '../models/assessment';
import { SSMT } from '../models/steam/ssmt';
import { CompressedAirPressureReductionTreasureHunt, ElectricityReductionTreasureHunt, HeatCascadingTreasureHunt, LightingReplacementTreasureHunt, Treasure } from '../models/treasure-hunt';
import { LightingReplacementData } from '../models/lighting';
import { FSAT } from '../models/fans';
import { CompressedAirPressureReductionData, ElectricityReductionData } from '../models/standalone';
import { PSAT } from '../models/psat';
import { PHAST } from '../models/phast/phast';
import { ConvertUnitsService } from '../convert-units/convert-units.service';
import { FlueGasByMass, FlueGasByVolume } from '../models/phast/losses/flueGas';
declare const packageJson;

@Injectable()
export class UpdateDataService {

    constructor(private convertUnitsService: ConvertUnitsService) { }

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
            } else if (assessment.type === 'WasteWater') {
                return this.updateWasteWater(assessment);
            } else if (assessment.type === 'CompressedAir') {
                return this.updateCompressedAir(assessment);
            } else {
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

    updateWasteWater(assessment: Assessment): Assessment {
        //logic for updating wastewater data
        assessment.appVersion = packageJson.version;
        if (assessment.wasteWater.baselineData && !assessment.wasteWater.baselineData.operations) {
            assessment.wasteWater.baselineData.operations = {
                MaxDays: 100,
                TimeIncrement: .5,
                operatingMonths: 12,
                EnergyCostUnit: 0.09
            };
        };

        if (assessment.wasteWater.modifications) {
            assessment.wasteWater.modifications.forEach(mod => {
                if (!mod.operations) {
                    mod.operations = {
                        MaxDays: 100,
                        TimeIncrement: .5,
                        operatingMonths: 12,
                        EnergyCostUnit: 0.09
                    };
                }
                if (!mod.activatedSludgeData.isUserDefinedSo) {
                    mod.activatedSludgeData.isUserDefinedSo = true;
                }
            })
        }

        if (!assessment.wasteWater.baselineData.activatedSludgeData.isUserDefinedSo) {
            assessment.wasteWater.baselineData.activatedSludgeData.isUserDefinedSo = true;
        }

        return assessment;
    }

    updateCompressedAir(assessment: Assessment): Assessment {
        assessment.appVersion = packageJson.version;
        if (assessment.compressedAirAssessment && assessment.compressedAirAssessment.compressorInventoryItems
            && assessment.compressedAirAssessment.compressorInventoryItems.length > 0) {
            assessment.compressedAirAssessment.compressorInventoryItems.forEach(item => {
                if (!item.performancePoints.midTurndown) {
                    item.performancePoints.midTurndown = {
                        dischargePressure: undefined,
                        isDefaultPower: true,
                        airflow: undefined,
                        isDefaultAirFlow: true,
                        power: undefined,
                        isDefaultPressure: true
                    };
                }
                if (!item.performancePoints.turndown) {
                    item.performancePoints.turndown = {
                        dischargePressure: undefined,
                        isDefaultPower: true,
                        airflow: undefined,
                        isDefaultAirFlow: true,
                        power: undefined,
                        isDefaultPressure: true
                    }
                }
            });
        };

        if (assessment.compressedAirAssessment && !assessment.compressedAirAssessment.endUseData) {
            assessment.compressedAirAssessment.endUseData = {
                endUseDayTypeSetup: {
                    selectedDayTypeId: undefined,
                    dayTypeLeakRates: [
                        {
                            dayTypeId: undefined,
                            dayTypeLeakRate: 0
                        }
                    ],
                },
                dayTypeAirFlowTotals: undefined,
                endUses: new Array(),
            };
            if (assessment.compressedAirAssessment.compressedAirDayTypes && assessment.compressedAirAssessment.compressedAirDayTypes.length > 0) {
                assessment.compressedAirAssessment.endUseData.endUseDayTypeSetup.dayTypeLeakRates = []
                if (assessment.compressedAirAssessment && assessment.compressedAirAssessment.systemInformation) {
                    if (!assessment.compressedAirAssessment.systemInformation.trimSelections) {
                        assessment.compressedAirAssessment.systemInformation.trimSelections = [];
                    }
                }
                assessment.compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
                    assessment.compressedAirAssessment.endUseData.endUseDayTypeSetup.dayTypeLeakRates.push(
                        {
                            dayTypeId: dayType.dayTypeId,
                            dayTypeLeakRate: 0
                        }
                    )
                    assessment.compressedAirAssessment.systemInformation.trimSelections.push({
                        dayTypeId: dayType.dayTypeId,
                        compressorId: undefined
                    });
                });
            }
        };

        if (assessment.compressedAirAssessment && assessment.compressedAirAssessment.systemInformation) {
            if (!assessment.compressedAirAssessment.systemInformation.multiCompressorSystemControls) {
                if (assessment.compressedAirAssessment.systemInformation.isSequencerUsed) {
                    assessment.compressedAirAssessment.systemInformation.multiCompressorSystemControls = 'targetPressureSequencer';
                } else {
                    assessment.compressedAirAssessment.systemInformation.multiCompressorSystemControls = 'cascading';
                }
            }
        }


        return assessment;
    }


    updatePsat(assessment: Assessment): Assessment {
        //logic for updating psat data
        assessment.appVersion = packageJson.version;
        if (assessment.psat.inputs.line_frequency === 0) {
            assessment.psat.inputs.line_frequency = 50;
        }
        if (assessment.psat.inputs.line_frequency === 1) {
            assessment.psat.inputs.line_frequency = 60;
        }
        if (assessment.psat.modifications) {
            assessment.psat.modifications.forEach(mod => {
                mod.psat = this.addWhatIfScenarioPsat(mod.psat);
                if (mod.psat.inputs.line_frequency === 0) {
                    mod.psat.inputs.line_frequency = 50;
                }
                if (mod.psat.inputs.line_frequency === 1) {
                    mod.psat.inputs.line_frequency = 60;
                }
            })
        }

        return assessment;
    }

    addWhatIfScenarioPsat(psat: PSAT): PSAT {
        if (!psat.inputs.whatIfScenario) {
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
        if (!assessment.fsat.fsatOperations) {
            assessment.fsat = this.addFsatOperations(assessment.fsat);
        }
        if (assessment.fsat.modifications) {
            assessment.fsat.modifications.forEach(mod => {
                mod.fsat = this.updateSpecificHeatRatio(mod.fsat);
                mod.fsat = this.addWhatIfScenarioFsat(mod.fsat);
                mod.fsat = this.addFsatOperations(mod.fsat);
            });
        }
        return assessment;
    }

    addWhatIfScenarioFsat(fsat: FSAT): FSAT {
        if (!fsat.whatIfScenario) {
            fsat.whatIfScenario = true;
        }
        return fsat;
    }

    addFsatOperations(fsat: FSAT): FSAT {
        if (!fsat.fsatOperations) {
            let operatingHours: number = 8760;
            let cost: number = .06;
            if (fsat.fieldData['operatingHours']) {
                operatingHours = fsat.fieldData['operatingHours'];
            }
            if (fsat.fieldData['cost']) {
                cost = fsat.fieldData['cost'];
            }
            fsat.fsatOperations = {
                operatingHours: operatingHours,
                cost: cost,
            }
        }
        return fsat;
    }

    updateSpecificHeatRatio(fsat: FSAT): FSAT {
        if (fsat.fieldData['specificHeatRatio'] && !fsat.baseGasDensity.specificHeatRatio) {
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

        assessment.phast = this.updateMoistureInAirCombustion(assessment.phast);
        if (assessment.phast.modifications && assessment.phast.modifications.length > 0) {
            assessment.phast.modifications.forEach(mod => {
                mod.phast = this.updateMoistureInAirCombustion(mod.phast);
            });
        }

        assessment.phast = this.updateFlueGas(assessment.phast);
        if (assessment.phast.modifications && assessment.phast.modifications.length > 0) {
            assessment.phast.modifications.forEach(mod => {
                mod.phast = this.updateFlueGas(mod.phast);
            });
        }

        assessment.phast = this.updateEnergyInputExhaustGasLoss(assessment.phast);
        if (assessment.phast.modifications && assessment.phast.modifications.length > 0) {
            assessment.phast.modifications.forEach(mod => {
                mod.phast = this.updateEnergyInputExhaustGasLoss(mod.phast);
            });
        }

        assessment.appVersion = packageJson.version;
        return assessment;
    }

    updateMoistureInAirCombustion(phast: PHAST): PHAST {
        if (phast.losses && phast.losses.flueGasLosses && phast.losses.flueGasLosses.length > 0) {
            phast.losses.flueGasLosses.forEach(fg => {
                if (fg.flueGasByMass && fg.flueGasByMass['moistureInAirComposition']) {
                    fg.flueGasByMass.moistureInAirCombustion = fg.flueGasByMass['moistureInAirComposition'];
                } else if (fg.flueGasByMass && !fg.flueGasByMass.moistureInAirCombustion) {
                    fg.flueGasByMass.moistureInAirCombustion = 0;
                } else if (fg.flueGasByVolume && !fg.flueGasByVolume.moistureInAirCombustion) {
                    fg.flueGasByVolume.moistureInAirCombustion = 0;
                }
            });
        }
        return phast;
    }

    updateFlueGas(phast: PHAST): PHAST {
        if (phast.losses && phast.losses.flueGasLosses && phast.losses.flueGasLosses.length > 0) {
            phast.losses.flueGasLosses.forEach(fg => {
                if (fg.flueGasByMass && fg.flueGasByMass['ambientAirTemp'] === undefined) {
                    fg.flueGasByMass = this.setAmbientAirTemp(phast, fg.flueGasByMass);
                }
                if (fg.flueGasByVolume && fg.flueGasByVolume['ambientAirTemp'] === undefined) {
                    fg.flueGasByVolume = this.setAmbientAirTemp(phast, fg.flueGasByVolume);
                }
            });
        }
        return phast;
    }

    setAmbientAirTemp(phast: PHAST, fg: FlueGasByMass | FlueGasByVolume) {
        let unitsOfMeasure: string = phast.lossDataUnits;
        let ambientAirTemp: number = 60;
        if (unitsOfMeasure == 'Metric') {
            ambientAirTemp = this.convertUnitsService.value(ambientAirTemp).from('F').to('C');
            ambientAirTemp = Number(ambientAirTemp.toFixed(2));
        }
        fg.ambientAirTemp = ambientAirTemp;
        return fg;
    }

    updateEnergyInputExhaustGasLoss(phast: PHAST): PHAST {
        if (phast.losses && phast.losses.energyInputExhaustGasLoss && phast.losses.energyInputExhaustGasLoss.length > 0) {
            phast.losses.energyInputExhaustGasLoss.forEach(input => {
                if (!input.availableHeat) {
                    input.availableHeat = 100;
                }
            });
        }
        return phast;
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
                    opportunity = this.updateElectricityReductionTreasureHunt(opportunity, assessment.treasureHunt.existingDataUnits);
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
            if (assessment.treasureHunt.heatCascadingOpportunities) {
                assessment.treasureHunt.heatCascadingOpportunities.forEach(opportunity => {
                    opportunity = this.updateHeatCascadingTreasureHunt(opportunity);
                    opportunity.opportunityType = Treasure.heatCascading;
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

    updateHeatCascadingTreasureHunt(heatCascadingTH: HeatCascadingTreasureHunt): HeatCascadingTreasureHunt {
        if (heatCascadingTH) {
            if (heatCascadingTH.inputData && heatCascadingTH.inputData['priFuelHV']) {
                heatCascadingTH.inputData.fuelHV = heatCascadingTH.inputData['priFuelHV'];
            }
            if (heatCascadingTH.inputData && heatCascadingTH.inputData['secFuelCost']) {
                heatCascadingTH.inputData.fuelCost = heatCascadingTH.inputData['secFuelCost'];
            }
        }
        return heatCascadingTH;
    }

    updateElectricityReductionTreasureHunt(electricityReductionTreasureHunt: ElectricityReductionTreasureHunt, settingTH: string): ElectricityReductionTreasureHunt {
        if (electricityReductionTreasureHunt.baseline) {
            electricityReductionTreasureHunt.baseline.forEach(reduction => {
                reduction = this.updateElectricityReduction(reduction, settingTH);
            });
        }
        if (electricityReductionTreasureHunt.modification) {
            electricityReductionTreasureHunt.modification.forEach(reduction => {
                reduction = this.updateElectricityReduction(reduction, settingTH);
            });
        }
        return electricityReductionTreasureHunt;
    }

    updateElectricityReduction(electricityReduction: ElectricityReductionData, settingTH: string): ElectricityReductionData {
        if (electricityReduction.userSelectedHP === undefined) {
            if (settingTH === 'Metric') {
                electricityReduction.userSelectedHP = false;
            } else if (settingTH === 'Imperial') {
                electricityReduction.userSelectedHP = true;
            }
        }
        return electricityReduction;
    }
}
