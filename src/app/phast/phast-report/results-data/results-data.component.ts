import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories, Modification } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { Subscription } from 'rxjs';

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
  @Input()
  toggleCalculate: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modification: Modification;
  @Input()
  inReport: boolean;
  @Input()
  modificationIndex: number;
  
  baseLineResults: PhastResults;
  modificationResults: Array<PhastResults>;
  phastMods: Array<Modification>;
  showResultsCats: ShowResultsCategories;
  lossUnit: string;
  selectedModificationIndex: number;
  decimalCount: string;

  numMods: number = 0;
  selectedPhastsSub: Subscription;
  constructor(private phastResultsService: PhastResultsService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.getResults();
    if (this.settings.energyResultUnit != 'kWh') {
      this.lossUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.lossUnit = 'kW';
    }

    if (this.inReport) {
      this.selectedPhastsSub = this.reportRollupService.selectedPhasts.subscribe(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      });
    }

    if (this.phast.modifications) {
      this.numMods = this.phast.modifications.length;
    }

    this.setSigFigsCount();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleCalculate) {
      this.getResults();
    }
    if (changes.modificationIndex) {
      this.getResults();
    }
  }

  ngOnDestroy(){
    if(this.selectedPhastsSub){this.selectedPhastsSub.unsubscribe;}
  }

  useModification() {
    this.reportRollupService.updateSelectedPhasts({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getResults() {
    this.modificationResults = new Array<PhastResults>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);
      if (this.phast.modifications && this.inReport) {
        this.phastMods = this.phast.modifications;
        if (this.phast.modifications.length != 0) {
          this.phast.modifications.forEach(mod => {
            let tmpResults = this.phastResultsService.getResults(mod.phast, this.settings);
            this.modificationResults.push(tmpResults);
          })
        }
      } else if (this.modification && !this.inSetup && !this.inReport) {
        let tmpResults = this.phastResultsService.getResults(this.modification.phast, this.settings);
        this.modificationResults.push(tmpResults);
      }
    } else {
      this.baseLineResults = this.phastResultsService.initResults();
    }
  }

  setSigFigsCount() {
    if (this.settings.energyResultUnit !== undefined) {
      if (this.settings.energyResultUnit.trim() == 'MMBtu' || this.settings.energyResultUnit.trim() == 'GJ' || this.settings.energyResultUnit.trim() == 'kWh') {
        this.decimalCount = '1.2-2';
      }
      else {
        this.decimalCount = '1.0-0';
      }
    }
  }
}
