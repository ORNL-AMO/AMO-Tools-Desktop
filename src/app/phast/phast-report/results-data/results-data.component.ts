import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';

@Component({
  selector: 'app-results-data',
  templateUrl: './results-data.component.html',
  styleUrls: ['./results-data.component.css']
})
export class ResultsDataComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;

  baseLineResults: PhastResults;
  modificationResults: Array<PhastResults>;
  phastMods: Array<any>;
  showResultsCats: ShowResultsCategories;
  lossUnit: string;
  selectedModificationIndex: number;
  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.modificationResults = new Array<PhastResults>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);
      if (this.phast.modifications) {
        this.phastMods = this.phast.modifications;
        if (this.phast.modifications.length != 0) {
          this.phast.modifications.forEach(mod => {
            let tmpResults = this.phastResultsService.getResults(mod.phast, this.settings);
            this.modificationResults.push(tmpResults);
          })
        }
      }
    } else {
      this.baseLineResults = this.phastResultsService.initResults();
    }
    if(this.settings.energyResultUnit != 'kWh'){
      this.lossUnit = this.settings.energyResultUnit + '/hr';
    }else{
      this.lossUnit = 'kW';
    }
    
    if (!this.inPhast) {
      this.reportRollupService.selectedPhasts.subscribe(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      });
    }
  }
  useModification() {
    this.reportRollupService.updateSelectedPhasts(this.assessment, this.selectedModificationIndex);
  }
}
