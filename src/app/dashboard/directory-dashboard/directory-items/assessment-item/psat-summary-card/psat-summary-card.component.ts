import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../../../shared/models/assessment';
import { PsatOutputs, PSAT } from '../../../../../shared/models/psat';
import { Settings } from '../../../../../shared/models/settings';
import { PsatService } from '../../../../../psat/psat.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SettingsDbService } from '../../../../../indexedDb/settings-db.service';
import { AssessmentService } from '../../../../assessment.service';

@Component({
    selector: 'app-psat-summary-card',
    templateUrl: './psat-summary-card.component.html',
    styleUrls: ['./psat-summary-card.component.css']
})
export class PsatSummaryCardComponent implements OnInit {
    @Input()
    assessment: Assessment;
    psatResults: PsatOutputs;
    modResults: PsatOutputs;
    settings: Settings;
    numMods: number = 0;
    setupDone: boolean;
    maxCostSavings: number = 0;
    maxEnergySavings: number = 0;

    showReport: boolean = false;

    @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;

    constructor(private psatService: PsatService, private settingsDbService: SettingsDbService, private assessmentService: AssessmentService) { }

    ngOnInit() {
        this.setupDone = this.assessment.psat.setupDone;
        if (this.setupDone) {
            this.settings = this.settingsDbService.getByAssessmentId(this.assessment);
            this.psatResults = this.getResults(this.assessment.psat, this.settings, true);
            if (this.assessment.psat.modifications) {
                this.numMods = this.assessment.psat.modifications.length;
                this.assessment.psat.modifications.forEach(mod => {
                    mod.psat.outputs = this.getResults(mod.psat, this.settings, false);
                    if (mod.psat.valid.isValid) {
                        let tmpSavingCalc = this.psatResults.annual_cost - mod.psat.outputs.annual_cost;
                        let tmpSavingEnergy = this.psatResults.annual_energy - mod.psat.outputs.annual_energy;
                        if (tmpSavingCalc > this.maxCostSavings) {
                            this.maxCostSavings = tmpSavingCalc;
                            this.maxEnergySavings = tmpSavingEnergy;
                        }
                    }
                });
            }
        }
    }



    getResults(psat: PSAT, settings: Settings, isBaseline: boolean): PsatOutputs {
        psat.valid = this.psatService.isPsatValid(psat.inputs, isBaseline);
        if (psat.valid.isValid) {
            if (isBaseline) {
                return this.psatService.resultsExisting(JSON.parse(JSON.stringify(psat.inputs)), settings);
            } else {
                if (this.psatResults.pump_efficiency) {
                    return this.psatService.resultsModified(JSON.parse(JSON.stringify(psat.inputs)), settings);
                } else {
                    return this.psatService.emptyResults();
                }
            }
        } else {
            return this.psatService.emptyResults();
        }
    }

    goToAssessment(assessment: Assessment, str?: string, str2?: string) {
        this.assessmentService.goToAssessment(assessment, str, str2);
    }


    showReportModal() {
        this.showReport = true;
        this.reportModal.show();
    }

    hideReportModal() {
        this.reportModal.hide();
        this.showReport = false;
    }
}
