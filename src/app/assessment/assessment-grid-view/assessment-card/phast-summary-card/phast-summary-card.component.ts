import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Assessment } from '../../../../shared/models/assessment';
import { PhastResultsService } from '../../../../phast/phast-results.service';
import { PhastResults, ExecutiveSummary } from '../../../../shared/models/phast/phast';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { ExecutiveSummaryService } from '../../../../phast/phast-report/executive-summary.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-phast-summary-card',
    templateUrl: './phast-summary-card.component.html',
    styleUrls: ['./phast-summary-card.component.css']
})
export class PhastSummaryCardComponent implements OnInit {
    @Input()
    assessment: Assessment;

    phastResults: ExecutiveSummary;
    modResults: ExecutiveSummary;
    settings: Settings;
    numMods: number = 0;
    setupDone: boolean;
    constructor(private executiveSummaryService: ExecutiveSummaryService, private indexedDbService: IndexedDbService) { }

    ngOnInit() {
        this.setupDone = this.assessment.phast.setupDone;
        if (this.setupDone) {
            this.indexedDbService.getAssessmentSettings(this.assessment.id).then(settings => {
                this.settings = settings[0];
                this.phastResults = this.executiveSummaryService.getSummary(this.assessment.phast, false, this.settings, this.assessment.phast);
                let tmpSavings = 0;
                if (this.assessment.phast.modifications) {
                    this.numMods = this.assessment.phast.modifications.length;
                    this.assessment.phast.modifications.forEach(mod => {
                        let tempVal = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.assessment.phast, this.phastResults);
                        if (tempVal.annualCostSavings > tmpSavings) {
                            tmpSavings = tempVal.annualCostSavings;
                            this.modResults = tempVal;
                        }
                    })
                }
            })
        }
    }


}