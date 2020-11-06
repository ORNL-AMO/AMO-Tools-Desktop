import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SSMTOutput } from '../../../shared/models/steam/steam-outputs';
import { Assessment } from '../../../shared/models/assessment';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { CompareService } from '../../compare.service';
import { SsmtReportRollupService } from '../../../report-rollup/ssmt-report-rollup.service';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineOutput: SSMTOutput;
  @Input()
  modificationOutputs: Array<SSMTOutput>;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  printView: boolean;
  @Input()
  ssmt: SSMT;

  selectedModificationIndex: number;
  constructor(private ssmtReportRollupService: SsmtReportRollupService,
    private compareService: CompareService) { }

  ngOnInit() {
    if (this.inRollup) {
      this.ssmtReportRollupService.selectedSsmt.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }
  }

  getSavingsPercentage(baselineCost: number, modificationCost: number): number {
    let tmpSavingsPercent = Number(Math.round(((((baselineCost - modificationCost) * 100) / baselineCost) * 100) / 100).toFixed(0));
    return tmpSavingsPercent;
  }

  useModification() {
    this.ssmtReportRollupService.updateSelectedSsmt({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getModificationsMadeList(modifiedSsmt: SSMT): Array<string> {
    let modificationsMadeList: Array<string> = new Array();
    let isOperationsDifferent: boolean = this.compareService.checkOperationsDifferent(this.ssmt, modifiedSsmt);
    if(isOperationsDifferent == true){
      modificationsMadeList.push('Operations');
    }
    let isBoilerDifferent: boolean = this.compareService.checkBoilerDifferent(this.ssmt, modifiedSsmt);
    if(isBoilerDifferent == true){
      modificationsMadeList.push('Boiler');
    }
    let isHeaderDifferent: boolean = this.compareService.checkHeaderDifferent(this.ssmt, modifiedSsmt);
    if(isHeaderDifferent == true){
      modificationsMadeList.push('Header');
    }
    let isTurbineDifferent: boolean = this.compareService.checkTurbinesDifferent(this.ssmt, modifiedSsmt);
    if(isTurbineDifferent == true){
      modificationsMadeList.push('Turbine');
    }
    return modificationsMadeList;
  }

  getPayback(modCost: number, baselineCost: number, implementationCost: number) {
    if (implementationCost) {
      let paybackMonths = (implementationCost / (baselineCost - modCost)) * 12 * 1000;
      if (isNaN(paybackMonths) === false) {
        return paybackMonths;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

}
