import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../../phast.service';
import { PHAST, Losses, PhastResults, ShowResultsCategories, Modification } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { Assessment } from '../../../../shared/models/assessment';
import { PhastResultsService } from '../../../phast-results.service';
import { graphColors } from '../graphColors';
import { PhastReportService } from '../../phast-report.service';

//debug
import { LossTab } from '../../../tabs';
import { LossesService } from '../../../losses/losses.service';



@Component({
    selector: 'app-report-graphs-print',
    templateUrl: './report-graphs-print.component.html',
    styleUrls: ['./report-graphs-print.component.css']
})
export class ReportGraphsPrintComponent implements OnInit {
    @Input()
    modExists: boolean;
    @Input()
    resultCats: ShowResultsCategories;
    @Input()
    baselinePhast: any;
    @Input()
    modPhast: any;
    @Input()
    resultsArray: Array<any>;
    @Input()
    settings: Settings;
    @Input()
    printView: boolean;
    @Input()
    chartContainerWidth: number;
    @Input()
    phast: PHAST;
    @Input()
    assessment: Assessment;

    sankeyBaseline: PHAST;
    modification: PHAST;
    sankeyPhastOptions: Array<any>;
    assessmentName: string;
    energyUnit: string;


    //debug
    lossesTabs: Array<LossTab>;
    _modifications: Array<Modification>;


    constructor(private lossesService: LossesService) { }

    ngOnInit() {
        //debug
        this.lossesTabs = this.lossesService.lossesTabs;
        this._modifications = new Array<Modification>();
        

        //real version
        this.assessmentName = this.assessment.name.replace(/\s/g, '');
        this.sankeyPhastOptions = new Array<any>();
        this.sankeyPhastOptions.push({ name: 'Baseline', phast: this.phast });
        this.sankeyBaseline = this.sankeyPhastOptions[0];
        if (this.phast.modifications) {

            //debug
            this._modifications = (JSON.parse(JSON.stringify(this.phast.modifications)));

            //real version
            if (this.phast.modifications.length > 0) {
                this.modExists = true;
            }
            this.phast.modifications.forEach(mod => {
                this.sankeyPhastOptions.push({ name: mod.phast.name, phast: mod.phast });
            });
        }
        this.energyUnit = this.settings.energyResultUnit;

        //debug
        this.printAllNotes();
    }


    printAllNotes() {

        
        for (let i = 0; i < this.lossesTabs.length; i++) {
            let loss = this.lossesTabs[i].tabName;
            let note = this._modifications[i].notes.chargeNotes;
            console.log("loss " + loss + " = " + note);

            
        }
    }
}