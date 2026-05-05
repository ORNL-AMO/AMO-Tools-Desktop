import { inject, Injectable } from '@angular/core';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { ProcessCoolingResults, ProcessCoolingAssessment, CondenserCoolingMethod } from '../../shared/models/process-cooling-assessment';
import { map, combineLatest } from 'rxjs';
import { ModificationNameCell, ReportTableRow, InputSummarySection } from '../report/report-ui-models';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { InputSummaryResults } from '../../shared/models/process-cooling-assessment';
import { ModificationService } from './modification.service';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { TowerTypes, TowerSizeMetricLabels, FanTypeLabels, CondenserCoolingMethodLabels, CompressorChillerTypes, Refrigerants } from '../constants/process-cooling-constants';

@Injectable({ providedIn: 'root' })
export class InputSummaryService {
    private readonly resultsService = inject(ProcessCoolingResultsService);
    private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    private readonly modificationService = inject(ModificationService);
    settingsSignal = this.processCoolingAssessmentService.settingsSignal;

    readonly inputSummaryUI$ = combineLatest([
        this.resultsService.baselineResults$,
        this.resultsService.modificationResults$,
        this.processCoolingAssessmentService.processCooling$
    ]).pipe(
        map(([baselineResults, modificationResults, processCooling]) => {
            return this.buildInputSummaryUI(baselineResults, modificationResults, processCooling);
        })
    )


    buildInputSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[], processCooling: ProcessCoolingAssessment): InputSummaryUI { 
        const inputSummaryUI: InputSummaryUI = {
            modificationNames: [],
            operationSummaryRows: {
                baseOperations: [],
                chillerSetup: [],
                carbonEmissions: [],
            },
            summaryRows: [],
            pumpSections: [],
            condenserSections: [],
            towerSections: [],
            inventorySections: [],
        };

        const baselineSummary: InputSummaryResults = baselineResults ? this.getInputSummaryResults(processCooling, baselineResults) : null;
        let modificationSummaries: InputSummaryResults[] = [];
        if (modificationResults) {
            const modifications = this.modificationService.modifications();
            modificationSummaries = modificationResults.map(result => {
                const modification = modifications.find(m => m.id === result.id);
                const modifiedAssessment = modification
                    ? this.modificationService.getModifiedProcessCoolingAssessment(modification)
                    : processCooling;
                return this.getInputSummaryResults(modifiedAssessment, result);
            });
            inputSummaryUI.modificationNames = this.resultsService.getResultModificationNames(modificationResults);
        }

        // Use the new mapping function
        const operationSummaryRows = this.mapToInputSummaryRows(baselineSummary, modificationSummaries);
        inputSummaryUI.operationSummaryRows = operationSummaryRows;
        inputSummaryUI.pumpSections = this.mapToPumpSections(baselineSummary, modificationSummaries);
        inputSummaryUI.condenserSections = this.mapToCondenserSections(baselineSummary, modificationSummaries);
        inputSummaryUI.towerSections = this.mapToTowerSections(baselineSummary, modificationSummaries);
        inputSummaryUI.inventorySections = this.mapToInventorySections(baselineSummary, modificationSummaries);
        return inputSummaryUI;
    }

    private getInputSummaryResults(assessment: ProcessCoolingAssessment, results: ProcessCoolingResults): InputSummaryResults {
        const sysInfo = assessment?.systemInformation;
        const ops = sysInfo?.operations;
        const towerInput = sysInfo?.towerInput;
        const chilledWaterPumpInput = sysInfo?.chilledWaterPumpInput;
        const condenserWaterPumpInput = sysInfo?.condenserWaterPumpInput;
        const waterCooledSystemInput = sysInfo?.waterCooledSystemInput;
        const airCooledSystemInput = sysInfo?.airCooledSystemInput;
        const inventory = assessment?.inventory ?? [];
        return {
            id: results.id,
            name: results.name,
            electricityCost: results.electricityCost,
            fuelCost: results.fuelCost,
            // Operations / chiller setup
            chilledWaterSupplyTemp: ops?.chilledWaterSupplyTemp ?? null,
            condenserCoolingMethod: ops?.condenserCoolingMethod ?? null,
            // Pump fields
            chilledWaterPumpInput,
            condenserWaterPumpInput,
            // Condenser fields
            waterCooledSystemInput,
            airCooledSystemInput,
            // Tower fields
            towerType: towerInput?.towerType ?? null,
            towerTypeLabel: TowerTypes[towerInput?.towerType] ?? '',
            towerSizeMetric: towerInput?.towerSizeMetric ?? null,
            towerSizeMetricLabel: TowerSizeMetricLabels[towerInput?.towerSizeMetric] ?? '',
            towerSize: towerInput?.towerSize ?? null,
            fanType: towerInput?.fanType ?? null,
            fanTypeLabel: FanTypeLabels[towerInput?.fanType] ?? '',
            numberOfTowers: towerInput?.numberOfTowers ?? null,
            numberOfFans: towerInput?.numberOfFans ?? null,
            usesFreeCooling: towerInput?.usesFreeCooling ?? null,
            isHEXRequired: towerInput?.isHEXRequired ?? null,
            HEXApproachTemp: towerInput?.HEXApproachTemp ?? null,
            // Inventory
            inventory,
        };
    }

    private mapToInputSummaryRows(
        baseline: InputSummaryResults | null,
        modifications: InputSummaryResults[] | null
    ): OperationSummaryRows {
        const defaultpipeFormat = '1.0-0';
        const defaultclassName: 'default' | 'emphasis' = 'default';
        const isImperial = this.settingsSignal().unitsOfMeasure === 'Imperial';
        const tempUnit = isImperial ? '°F' : '°C';
        const fuelCostUnit = isImperial
            ? PROCESS_COOLING_UNITS.fuelCost.labelHTML.imperial
            : PROCESS_COOLING_UNITS.fuelCost.labelHTML.metric;

        // Base Operations
        const baseOperations: ReportTableRow[] = [
            {
                label: 'Electricity Cost',
                units: '$/kWh',
                className: defaultclassName,
                baseline: { value: baseline?.electricityCost ?? null, decimalPipe: '1.2-4' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.electricityCost ?? null, decimalPipe: '1.2-4' })) : []
            },
            {
                label: 'Fuel Cost',
                units: fuelCostUnit,
                className: defaultclassName,
                baseline: { value: baseline?.fuelCost ?? null, decimalPipe: '1.2-4' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.fuelCost ?? null, decimalPipe: '1.2-4' })) : []
            }
        ];

        // Chiller Setup
        const chillerSetup: ReportTableRow[] = [
            {
                label: 'Chilled Water Supply Temperature',
                units: tempUnit,
                className: defaultclassName,
                baseline: { value: baseline?.chilledWaterSupplyTemp ?? null, decimalPipe: defaultpipeFormat },
                modifications: modifications ? modifications.map(mod => ({ value: mod.chilledWaterSupplyTemp ?? null, decimalPipe: defaultpipeFormat })) : []
            },
            {
                label: 'Condenser Cooling Method',
                units: '',
                className: defaultclassName,
                baseline: { value: CondenserCoolingMethodLabels[baseline?.condenserCoolingMethod] ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: CondenserCoolingMethodLabels[mod.condenserCoolingMethod] ?? '' })) : []
            }
        ];

        // Tower Setup
        const towerSetup: ReportTableRow[] = [
            {
                label: 'Tower Type',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.towerTypeLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.towerTypeLabel ?? '' })) : []
            },
            {
                label: 'Tower Size Metric',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.towerSizeMetricLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.towerSizeMetricLabel ?? '' })) : []
            },
            {
                label: 'Fan Type',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.fanTypeLabel ?? '' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.fanTypeLabel ?? '' })) : []
            },
            {
                label: 'Number of Towers',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.numberOfTowers ?? null },
                modifications: modifications ? modifications.map(mod => ({ value: mod.numberOfTowers ?? null })) : []
            },
            {
                label: 'Number of Fans',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.numberOfFans ?? null },
                modifications: modifications ? modifications.map(mod => ({ value: mod.numberOfFans ?? null })) : []
            },
            {
                label: 'Uses Free Cooling',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.usesFreeCooling ? 'Yes' : 'No' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.usesFreeCooling ? 'Yes' : 'No' })) : []
            },
            {
                label: 'Is HEX Required',
                units: '',
                className: defaultclassName,
                baseline: { value: baseline?.isHEXRequired ? 'Yes' : 'No' },
                modifications: modifications ? modifications.map(mod => ({ value: mod.isHEXRequired ? 'Yes' : 'No' })) : []
            },
            {
                label: 'HEX Approach Temp',
                units: tempUnit,
                className: defaultclassName,
                baseline: { value: baseline?.HEXApproachTemp ?? null, decimalPipe: defaultpipeFormat },
                modifications: modifications ? modifications.map(mod => ({ value: mod.HEXApproachTemp ?? null, decimalPipe: defaultpipeFormat })) : []
            }
        ];

        return {
            baseOperations,
            chillerSetup,
            carbonEmissions: [],
            towerSetup
        };
    }

    private mapToPumpSections(baseline: InputSummaryResults | null, mods: InputSummaryResults[]): InputSummarySection[] {
        const pumpRows = (pump: any, modPumps: any[], fieldName: string): ReportTableRow[] => [
            {
                label: 'Variable Flow', units: '', className: 'default',
                baseline: { value: pump ? (pump.variableFlow ? 'Yes' : 'No') : null },
                modifications: modPumps.map(m => ({ value: m?.[fieldName] ? (m[fieldName].variableFlow ? 'Yes' : 'No') : null }))
            },
            {
                label: 'Flow Rate', units: 'gpm/ton', className: 'default',
                baseline: { value: pump?.flowRate ?? null, decimalPipe: '1.2-2' },
                modifications: modPumps.map(m => ({ value: m?.[fieldName]?.flowRate ?? null, decimalPipe: '1.2-2' }))
            },
            {
                label: 'Efficiency', units: '%', className: 'default',
                baseline: { value: pump?.efficiency ?? null, decimalPipe: '1.0-0' },
                modifications: modPumps.map(m => ({ value: m?.[fieldName]?.efficiency ?? null, decimalPipe: '1.0-0' }))
            },
            {
                label: 'Motor Size', units: 'hp', className: 'default',
                baseline: { value: pump?.motorSize ?? null, decimalPipe: '1.0-0' },
                modifications: modPumps.map(m => ({ value: m?.[fieldName]?.motorSize ?? null, decimalPipe: '1.0-0' }))
            },
            {
                label: 'Motor Efficiency', units: '%', className: 'default',
                baseline: { value: pump?.motorEfficiency ?? null, decimalPipe: '1.0-0' },
                modifications: modPumps.map(m => ({ value: m?.[fieldName]?.motorEfficiency ?? null, decimalPipe: '1.0-0' }))
            },
        ];
        return [
            { label: 'Chilled Water Pump',   rows: pumpRows(baseline?.chilledWaterPumpInput, mods, 'chilledWaterPumpInput') },
            { label: 'Condenser Water Pump', rows: pumpRows(baseline?.condenserWaterPumpInput, mods, 'condenserWaterPumpInput') },
        ];
    }

    private mapToCondenserSections(baseline: InputSummaryResults | null, mods: InputSummaryResults[]): InputSummarySection[] {
        const tempUnit = this.settingsSignal().unitsOfMeasure === 'Imperial' ? '°F' : '°C';
        const isWaterCooled = baseline?.condenserCoolingMethod === CondenserCoolingMethod.Water;
        if (isWaterCooled) {
            return [{
                label: 'Condenser Cooling',
                rows: [
                    {
                        label: 'Cooling Method', units: '', className: 'default',
                        baseline: { value: 'Water' },
                        modifications: mods.map(m => ({ value: CondenserCoolingMethodLabels[m?.condenserCoolingMethod] ?? '' }))
                    },
                    {
                        label: 'Constant Condenser Water Temperature', units: '', className: 'default',
                        baseline: { value: baseline?.waterCooledSystemInput ? (baseline.waterCooledSystemInput.isConstantCondenserWaterTemp ? 'Yes' : 'No') : null },
                        modifications: mods.map(m => ({ value: m?.waterCooledSystemInput ? (m.waterCooledSystemInput.isConstantCondenserWaterTemp ? 'Yes' : 'No') : null }))
                    },
                    {
                        label: 'Condenser Water Temperature', units: tempUnit, className: 'default',
                        baseline: { value: baseline?.waterCooledSystemInput?.condenserWaterTemp ?? null, decimalPipe: '1.0-0' },
                        modifications: mods.map(m => ({ value: m?.waterCooledSystemInput?.condenserWaterTemp ?? null, decimalPipe: '1.0-0' }))
                    },
                    {
                        label: 'Following Temperature Differential', units: tempUnit, className: 'default',
                        baseline: { value: baseline?.waterCooledSystemInput?.followingTempDifferential ?? null, decimalPipe: '1.0-0' },
                        modifications: mods.map(m => ({ value: m?.waterCooledSystemInput?.followingTempDifferential ?? null, decimalPipe: '1.0-0' }))
                    },
                ]
            }];
        } else {
            const airSource = (aci: any) => aci?.airCoolingSource === 0 ? 'Indoor' : 'Outdoor';
            return [{
                label: 'Condenser Cooling',
                rows: [
                    {
                        label: 'Cooling Method', units: '', className: 'default',
                        baseline: { value: CondenserCoolingMethodLabels[baseline?.condenserCoolingMethod] ?? '' },
                        modifications: mods.map(m => ({ value: CondenserCoolingMethodLabels[m?.condenserCoolingMethod] ?? '' }))
                    },
                    {
                        label: 'Outdoor Air Design Temperature', units: tempUnit, className: 'default',
                        baseline: { value: baseline?.airCooledSystemInput?.outdoorAirTemp ?? null, decimalPipe: '1.0-0' },
                        modifications: mods.map(m => ({ value: m?.airCooledSystemInput?.outdoorAirTemp ?? null, decimalPipe: '1.0-0' }))
                    },
                    {
                        label: 'Air Cooling Source', units: '', className: 'default',
                        baseline: { value: baseline?.airCooledSystemInput ? airSource(baseline.airCooledSystemInput) : null },
                        modifications: mods.map(m => ({ value: m?.airCooledSystemInput ? airSource(m.airCooledSystemInput) : null }))
                    },
                    {
                        label: 'Indoor Temperature', units: tempUnit, className: 'default',
                        baseline: { value: baseline?.airCooledSystemInput?.indoorTemp ?? null, decimalPipe: '1.0-0' },
                        modifications: mods.map(m => ({ value: m?.airCooledSystemInput?.indoorTemp ?? null, decimalPipe: '1.0-0' }))
                    },
                    {
                        label: 'Following Temperature Differential', units: tempUnit, className: 'default',
                        baseline: { value: baseline?.airCooledSystemInput?.followingTempDifferential ?? null, decimalPipe: '1.0-0' },
                        modifications: mods.map(m => ({ value: m?.airCooledSystemInput?.followingTempDifferential ?? null, decimalPipe: '1.0-0' }))
                    },
                ]
            }];
        }
    }

    private mapToTowerSections(baseline: InputSummaryResults | null, mods: InputSummaryResults[]): InputSummarySection[] {
        const tempUnit = this.settingsSignal().unitsOfMeasure === 'Imperial' ? '°F' : '°C';
        return [{
            label: 'Tower Setup',
            rows: [
                {
                    label: 'Tower Type', units: '', className: 'default',
                    baseline: { value: TowerTypes[baseline?.towerType] ?? '' },
                    modifications: mods.map(m => ({ value: TowerTypes[m?.towerType] ?? '' }))
                },
                {
                    label: 'Number of Towers', units: '', className: 'default',
                    baseline: { value: baseline?.numberOfTowers ?? null },
                    modifications: mods.map(m => ({ value: m?.numberOfTowers ?? null }))
                },
                {
                    label: 'Number of Fans', units: '', className: 'default',
                    baseline: { value: baseline?.numberOfFans ?? null },
                    modifications: mods.map(m => ({ value: m?.numberOfFans ?? null }))
                },
                {
                    label: 'Tower Size Metric', units: '', className: 'default',
                    baseline: { value: TowerSizeMetricLabels[baseline?.towerSizeMetric] ?? '' },
                    modifications: mods.map(m => ({ value: TowerSizeMetricLabels[m?.towerSizeMetric] ?? '' }))
                },
                {
                    label: 'Tower Size', units: '', className: 'default',
                    baseline: { value: baseline?.towerSize ?? null, decimalPipe: '1.0-0' },
                    modifications: mods.map(m => ({ value: m?.towerSize ?? null, decimalPipe: '1.0-0' }))
                },
                {
                    label: 'Fan Type', units: '', className: 'default',
                    baseline: { value: FanTypeLabels[baseline?.fanType] ?? '' },
                    modifications: mods.map(m => ({ value: FanTypeLabels[m?.fanType] ?? '' }))
                },
                {
                    label: 'Uses Free Cooling', units: '', className: 'default',
                    baseline: { value: baseline?.usesFreeCooling != null ? (baseline.usesFreeCooling ? 'Yes' : 'No') : null },
                    modifications: mods.map(m => ({ value: m?.usesFreeCooling != null ? (m.usesFreeCooling ? 'Yes' : 'No') : null }))
                },
                {
                    label: 'HEX Required', units: '', className: 'default',
                    baseline: { value: baseline?.isHEXRequired != null ? (baseline.isHEXRequired ? 'Yes' : 'No') : null },
                    modifications: mods.map(m => ({ value: m?.isHEXRequired != null ? (m.isHEXRequired ? 'Yes' : 'No') : null }))
                },
                {
                    label: 'HEX Approach Temperature', units: tempUnit, className: 'default',
                    baseline: { value: baseline?.HEXApproachTemp ?? null, decimalPipe: '1.0-0' },
                    modifications: mods.map(m => ({ value: m?.HEXApproachTemp ?? null, decimalPipe: '1.0-0' }))
                },
            ]
        }];
    }

    private mapToInventorySections(baseline: InputSummaryResults | null, mods: InputSummaryResults[]): InputSummarySection[] {
        const baselineInventory: any[] = baseline?.inventory ?? [];
        return baselineInventory.map((chiller, idx) => ({
            label: chiller.name || 'Chiller',
            rows: [
                {
                    label: 'Chiller Type', units: '', className: 'default',
                    baseline: { value: CompressorChillerTypes[chiller.chillerType] ?? '' },
                    modifications: mods.map(m => ({ value: CompressorChillerTypes[m?.inventory?.[idx]?.chillerType] ?? '' }))
                },
                {
                    label: 'Capacity', units: 'ton', className: 'default',
                    baseline: { value: chiller.capacity ?? null, decimalPipe: '1.0-0' },
                    modifications: mods.map(m => ({ value: m?.inventory?.[idx]?.capacity ?? null, decimalPipe: '1.0-0' }))
                },
                {
                    label: 'Full Load Efficiency Known', units: '', className: 'default',
                    baseline: { value: chiller.isFullLoadEfficiencyKnown ? 'Yes' : 'No' },
                    modifications: mods.map(m => ({ value: m?.inventory?.[idx]?.isFullLoadEfficiencyKnown ? 'Yes' : 'No' }))
                },
                {
                    label: 'Full Load Efficiency', units: 'kW/ton', className: 'default',
                    baseline: { value: chiller.fullLoadEfficiency ?? null, decimalPipe: '1.2-2' },
                    modifications: mods.map(m => ({ value: m?.inventory?.[idx]?.fullLoadEfficiency ?? null, decimalPipe: '1.2-2' }))
                },
                {
                    label: 'Age', units: 'yrs', className: 'default',
                    baseline: { value: chiller.age ?? null, decimalPipe: '1.1-1' },
                    modifications: mods.map(m => ({ value: m?.inventory?.[idx]?.age ?? null, decimalPipe: '1.1-1' }))
                },
                {
                    label: 'Refrigerant Type', units: '', className: 'default',
                    baseline: { value: Refrigerants[chiller.refrigerantType] ?? '' },
                    modifications: mods.map(m => ({ value: Refrigerants[m?.inventory?.[idx]?.refrigerantType] ?? '' }))
                },
            ]
        }));
    }

}

export interface InputSummaryUI {
    modificationNames: ModificationNameCell[];
    operationSummaryRows: OperationSummaryRows;
    summaryRows: ReportTableRow[];
    pumpSections: InputSummarySection[];
    condenserSections: InputSummarySection[];
    towerSections: InputSummarySection[];
    inventorySections: InputSummarySection[];
}

export interface OperationSummaryRows {
    baseOperations: ReportTableRow[];
    chillerSetup: ReportTableRow[];
    carbonEmissions: ReportTableRow[];
    towerSetup?: ReportTableRow[];
    // add more sections as needed
}