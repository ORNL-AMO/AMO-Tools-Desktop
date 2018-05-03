import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../../phast.service';
import { PHAST, Losses, PhastResults, ShowResultsCategories, Modification } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { Assessment } from '../../../../shared/models/assessment';
import { PhastResultsService } from '../../../phast-results.service';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';

@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {
    @Input()
    resultsArray: Array<{ name: string, data: PhastResults }>;
    @Input()
    showResultsCats: ShowResultsCategories;
    @Input()
    graphColors: Array<string>;
    @Input()
    pieChartWidth: number;
    @Input()
    pieChartHeight: number;
    @Input()
    printView: boolean;
    @Input()
    phast: PHAST;
    @Input()
    assessment: Assessment;
    @Input()
    settings: Settings;
    @Input()
    modExists: boolean;
    @Input()
    allPieLabels: Array<Array<string>>;
    @Input()
    allPieValues: Array<Array<number>>;
    @Input()
    baselinePhast: any;
    @Input()
    printSankey: boolean;
    @Input()
    printGraphs: boolean;

    sankeyBaseline: PHAST;
    modification: PHAST;
    sankeyPhastOptions: Array<any>;
    assessmentName: string;
    energyUnit: string;
    _modifications: Array<Modification>;
    allNotes: Array<Array<string>>;
    equipmentNotes: string;

    constructor() { }

    ngOnInit() {
        this._modifications = new Array<Modification>();
        this.assessmentName = this.assessment.name.replace(/\s/g, '');
        this.sankeyPhastOptions = new Array<any>();
        this.sankeyPhastOptions.push({ name: 'Baseline', phast: this.phast });
        this.sankeyBaseline = this.sankeyPhastOptions[0];
        if (this.phast.modifications) {
            this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));
            if (this.phast.modifications.length > 0) {
                this.modExists = true;
            }
            this.phast.modifications.forEach(mod => {
                this.sankeyPhastOptions.push({ name: mod.phast.name, phast: mod.phast });
            });
        }
        this.energyUnit = this.settings.energyResultUnit;
        if (this.modExists) {
            this.getAllNotes();
        }

        if (this.phast.equipmentNotes) {
            this.equipmentNotes = "Equipment Notes - " + this.phast.equipmentNotes;
        }
    }


    getAllNotes() {
        this.allNotes = new Array<Array<string>>();

        for (let i = 0; i < this._modifications.length; i++) {
            let notes = new Array<string>();

            if (this._modifications[i].notes) {
                if (this._modifications[i].notes.chargeNotes) {
                    notes.push("Charge Material - " + this._modifications[i].notes.chargeNotes);
                }
                if (this._modifications[i].notes.wallNotes) {
                    notes.push("Wall Loss - " + this._modifications[i].notes.wallNotes);
                }
                if (this._modifications[i].notes.atmosphereNotes) {
                    notes.push("Atmosphere Loss - " + this._modifications[i].notes.atmosphereNotes);
                }
                if (this._modifications[i].notes.fixtureNotes) {
                    notes.push("Fixture Loss - " + this._modifications[i].notes.fixtureNotes);
                }
                if (this._modifications[i].notes.openingNotes) {
                    notes.push("Opening Loss - " + this._modifications[i].notes.openingNotes);
                }
                if (this._modifications[i].notes.coolingNotes) {
                    notes.push("Cooling Loss - " + this._modifications[i].notes.coolingNotes);
                }
                if (this._modifications[i].notes.flueGasNotes) {
                    notes.push("Flue Gas Loss - " + this._modifications[i].notes.flueGasNotes);
                }
                if (this._modifications[i].notes.otherNotes) {
                    notes.push("Other Loss - " + this._modifications[i].notes.otherNotes);
                }
                if (this._modifications[i].notes.leakageNotes) {
                    notes.push("Leakage Loss - " + this._modifications[i].notes.leakageNotes);
                }
                if (this._modifications[i].notes.extendedNotes) {
                    notes.push("Extended Surface Loss - " + this._modifications[i].notes.extendedNotes);
                }
                if (this._modifications[i].notes.slagNotes) {
                    notes.push("Slag Loss - " + this._modifications[i].notes.slagNotes);
                }
                if (this._modifications[i].notes.auxiliaryPowerNotes) {
                    notes.push("Auxiliary Power - " + this._modifications[i].notes.auxiliaryPowerNotes);
                }
                if (this._modifications[i].notes.exhaustGasNotes) {
                    notes.push("Exhaust Loss - " + this._modifications[i].notes.exhaustGasNotes);
                }
                if (this._modifications[i].notes.energyInputExhaustGasNotes) {
                    notes.push("EAF Loss - " + this._modifications[i].notes.energyInputExhaustGasNotes);
                }
                if (this._modifications[i].notes.heatSystemEfficiencyNotes) {
                    notes.push("System Heat Efficiency - " + this._modifications[i].notes.heatSystemEfficiencyNotes);
                }
                if (this._modifications[i].notes.operationsNotes) {
                    notes.push("Operations - " + this._modifications[i].notes.operationsNotes);
                }
            }
            this.allNotes.push(notes);
        }
    }
}