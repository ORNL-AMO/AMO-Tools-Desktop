
import { inject, Injectable } from '@angular/core';
import { map, combineLatest } from 'rxjs';
import { TowerResults, ProcessCoolingResults } from '../../shared/models/process-cooling-assessment';
import { ModificationNameCell, ReportTableRow } from '../report/report-ui-models';
import { ProcessCoolingResultsService } from './process-cooling-results.service';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { PROCESS_COOLING_UNITS } from '../constants/process-cooling-units';
import { ConvertValue } from '../../shared/convert-units/ConvertValue';

@Injectable({ providedIn: 'root' })
export class TowerSummaryService {
    private readonly resultsService = inject(ProcessCoolingResultsService);
    private readonly processCoolingAssessmentService = inject(ProcessCoolingAssessmentService);
    settingsSignal = this.processCoolingAssessmentService.settingsSignal;

    private readonly defaultpipeFormat = '1.0-0';
    private readonly defaultclassName: 'default' | 'emphasis' = 'default';
    private readonly defaultEnergyUnit = this.settingsSignal().unitsOfMeasure ? PROCESS_COOLING_UNITS.energy.labelHTML.imperial : PROCESS_COOLING_UNITS.energy.labelHTML.metric;
    private readonly temperatureUnit = this.settingsSignal().unitsOfMeasure ? PROCESS_COOLING_UNITS.temperature.labelHTML.imperial : PROCESS_COOLING_UNITS.temperature.labelHTML.metric;
        
    readonly towerSummaryUI$ = combineLatest([
        this.resultsService.baselineResults$,
        this.resultsService.modificationResults$
    ]).pipe(
        map(([baselineResults, modificationResults]) => {
            return this.buildTowerSummaryUI(baselineResults, modificationResults);
        })
    );

    buildTowerSummaryUI(baselineResults: ProcessCoolingResults, modificationResults: ProcessCoolingResults[]): TowerSummaryUI {
        const towerSummaryUI: TowerSummaryUI = {
            modificationNames: [],
            totalRows: [],
            baselineEnergyBins: [],
            modificationEnergyBins: [],
            binLabels: []
        };
        const baselineTower: TowerResults = baselineResults && baselineResults.tower ? this.getTowerResults(baselineResults) : null;
        let modificationTowers: TowerResults[] = [];
        if (modificationResults) {
            modificationTowers = modificationResults.map(result => this.getTowerResults(result, baselineTower));
            towerSummaryUI.modificationNames = this.resultsService.getResultModificationNames(modificationResults);
        }
        
        let binTemps: number[][] = this.getBinTemps();
        let binLabels: string[] = this.getBinLabels(binTemps);
        
        towerSummaryUI.baselineEnergyBins = this.addTowerBinRows(baselineTower, binLabels);
        modificationTowers.forEach(modification => {
            towerSummaryUI.modificationEnergyBins.push(this.addTowerBinRows(modification, binLabels));
        });
        
        towerSummaryUI.totalRows = this.mapToTowerSummaryRows(baselineTower, modificationTowers);
        return towerSummaryUI;
    }

    private getTowerResults(result: ProcessCoolingResults, baseline?: TowerResults): TowerResults {



        const totalTowerEnergy = result.tower?.energy?.reduce((sum, e) => sum + e, 0) ?? null;
        const totalTowerCost = totalTowerEnergy && result.electricityCost ? totalTowerEnergy * result.electricityCost : null;

        // let energySavings, percentEnergySavings, costSavings, percentCostSavings;
        // if (baseline && baseline.totalTowerEnergy != null && totalTowerEnergy != null) {
        //   energySavings = baseline.totalTowerEnergy - totalTowerEnergy;
        //   percentEnergySavings = baseline.totalTowerEnergy ? (energySavings / baseline.totalTowerEnergy) * 100 : null;
        //   costSavings = baseline.totalTowerCost - totalTowerCost;
        //   percentCostSavings = baseline.totalTowerCost ? (costSavings / baseline.totalTowerCost) * 100 : null;
        // }
        return {
            id: result.id,
            name: result.name,
            hours: result.tower?.hours ?? [],
            energy: result.tower?.energy ?? [],
            totalTowerEnergy,
            electricityCost: result.electricityCost,
            totalTowerCost,
            //   energySavings,
            //   percentEnergySavings,
            //   costSavings,
            //   percentCostSavings
        };
    }

    private mapToTowerSummaryRows(
        baseline: TowerResults | null,
        modifications: TowerResults[] | null
    ): ReportTableRow[] {
        const defaultRow: ReportTableRow = {
            label: 'Result',
            units: `(${this.defaultEnergyUnit})`,
            className: this.defaultclassName,
            baseline: { value: undefined, decimalPipe: this.defaultpipeFormat },
            modifications: []
        };

        const totalRows: ReportTableRow[] = [
            {
                ...defaultRow,
                label: 'Total Tower Energy',
                baseline: { value: baseline?.totalTowerEnergy ?? null, decimalPipe: this.defaultpipeFormat },
                modifications: modifications?.map(mod => ({ value: mod.totalTowerEnergy ?? null, decimalPipe: this.defaultpipeFormat })) ?? [],
            },
            {
                ...defaultRow,
                label: 'Total Tower Cost',
                units: '($)',
                baseline: { value: baseline?.totalTowerCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } },
                modifications: modifications?.map(mod => ({ value: mod.totalTowerCost ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } })) ?? [],
            },
            // todo keep - group may want these results
            //   {
            //     ...defaultRow,
            //     className: 'emphasis',
            //     label: 'Energy Savings',
            //     baseline: { value: null },
            //     modifications: modifications?.map(mod => ({ value: mod.energySavings ?? null, decimalPipe: defaultpipeFormat })) ?? [],
            //   },
            //   {
            //     ...defaultRow,
            //     className: 'emphasis',
            //     label: 'Percent Energy Savings',
            //     units: '(%)',
            //     baseline: { value: null },
            //     modifications: modifications?.map(mod => ({ value: mod.percentEnergySavings ?? null, decimalPipe: '1.1-1' })) ?? [],
            //   },
            //   {
            //     ...defaultRow,
            //     className: 'emphasis',
            //     label: 'Cost Savings',
            //     units: '($)',
            //     baseline: { value: null },
            //     modifications: modifications?.map(mod => ({ value: mod.costSavings ?? null, currencyPipe: { code: 'USD', display: 'symbol', digitsInfo: '1.0-0' } })) ?? [],
            //   },
            //   {
            //     ...defaultRow,
            //     className: 'emphasis',
            //     label: 'Percent Cost Savings',
            //     units: '(%)',
            //     baseline: { value: null },
            //     modifications: modifications?.map(mod => ({ value: mod.percentCostSavings ?? null, decimalPipe: '1.1-1' })) ?? [],
            //   },
        ];

        return totalRows;
    }


    addTowerBinRows(results: TowerResults | null, binTemps: string[]): TowerBinRows[] {
        if (binTemps.length > 0) {
            let towerEnergyRows: TowerBinRows[] = [];
            const binHeaderRow: TowerBinRows = {
                label: `Bins`,
                units: `(Wet Bulb ${this.temperatureUnit})`,
                className: this.defaultclassName,
                binValues: binTemps.map((temp, index) => results.hours[index] ?? null),
            }

            towerEnergyRows.push(binHeaderRow);
            towerEnergyRows.push({
                label: `Hours`,
                className: this.defaultclassName,
                binValues: binTemps.map((temp, index) => results.hours[index] ?? null),
            });
            towerEnergyRows.push({
                label: `Energy`,
                units: `(${this.defaultEnergyUnit})`,
                className: this.defaultclassName,
                binValues: binTemps.map((temp, index) => results.energy[index] ?? null),
            });
            return towerEnergyRows;
        }
    }

    getBinTemps(): number[][] {
        let binTemps: number[][] = [
            [35],
            [35, 45],
            [45, 55],
            [55, 65],
            [65, 75],
            [75]  
        ]

        if (this.settingsSignal().unitsOfMeasure === 'Metric') {     
            binTemps = binTemps.map(bin => {
                return bin.map(temp => new ConvertValue(temp, 
                    PROCESS_COOLING_UNITS.temperature.imperial, 
                    PROCESS_COOLING_UNITS.temperature.metric
                ).convertedValue);
            });
        }
        return binTemps;
    }

    getBinLabels(binTemps: number[][]): string[] {
        let binLabels: string[] = [];
        if (binTemps.length === 6) {
            binLabels.push(`< ${binTemps[0][0]}`);
            for (let i = 1; i < binTemps.length - 1; i++) {
                binLabels.push(`${binTemps[i][0]} - ${binTemps[i][1]}`);
            }
            binLabels.push(`> ${binTemps[5][0]}`);
        }
        return binLabels;
    }
}




export interface TowerSummaryUI {
    modificationNames: ModificationNameCell[];
    totalRows: ReportTableRow[];
    baselineEnergyBins?: TowerBinRows[];
    modificationEnergyBins?: TowerBinRows[][];
    binLabels: string[];
}

export interface TowerBinRows {
    label: string;
    units?: string;
    className: 'default' | 'emphasis';
    binValues: number[],
}