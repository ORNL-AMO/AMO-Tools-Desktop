import { Component, OnInit, Input } from '@angular/core';
import { SSMTLosses } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { SsmtValid } from '../../../shared/models/steam/ssmt';


@Component({
  selector: 'app-losses-summary',
  templateUrl: './losses-summary.component.html',
  styleUrls: ['./losses-summary.component.css']
})
export class LossesSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  baselineLosses: SSMTLosses;
  @Input()
  modificationLosses: Array<{ outputData: SSMTLosses, name: string, valid: SsmtValid }>;
  @Input()
  numberOfHeaders: number;
  @Input()
  tableCellWidth: number;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;

  selectedModificationIndex: number;
  showCondensingTurbine: boolean;
  showHighToLowTurbine: boolean;
  showHighToMediumTurbine: boolean;
  showMediumToLowTurbine: boolean;
  showCondensingLoss: boolean;
  showLowPressureVentedSteam: boolean;
  showCondensateFlashTank: boolean;
  constructor(private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    if (this.inRollup) {
      this.reportRollupService.selectedSsmt.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }

    this.checkCondensingTurbine(this.baselineLosses);
    this.checkHighToLowTurbine(this.baselineLosses);
    this.checkHighToMediumTurbine(this.baselineLosses);
    this.checkMediumtoLowTurbine(this.baselineLosses);
    this.checkCondensateFlashTank(this.baselineLosses);
    this.checkCondensingLoss(this.baselineLosses);
    this.checkLowPressureVentedSteam(this.baselineLosses);
    if(this.modificationLosses){
      this.modificationLosses.forEach(loss => {
        if (loss.valid.isValid) {
          this.checkCondensingTurbine(loss.outputData);
          this.checkHighToLowTurbine(loss.outputData);
          this.checkHighToMediumTurbine(loss.outputData);
          this.checkMediumtoLowTurbine(loss.outputData);
          this.checkCondensateFlashTank(loss.outputData);
          this.checkCondensingLoss(loss.outputData);
          this.checkLowPressureVentedSteam(loss.outputData);
        }
      })
    }

  }

  useModification() {
    this.reportRollupService.updateSelectedSsmt({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  checkCondensingTurbine(loss: SSMTLosses) {
    if (loss.condensingTurbineEfficiencyLoss || loss.condensingTurbineUsefulEnergy) {
      this.showCondensingTurbine = true;
    }
  }

  checkHighToLowTurbine(loss: SSMTLosses) {
    if (loss.highToLowTurbineEfficiencyLoss || loss.highToLowTurbineUsefulEnergy) {
      this.showHighToLowTurbine = true;
    }
  }

  checkHighToMediumTurbine(loss: SSMTLosses) {
    if (loss.highToMediumTurbineEfficiencyLoss || loss.highToMediumTurbineUsefulEnergy) {
      this.showHighToMediumTurbine = true;
    }
  }

  checkMediumtoLowTurbine(loss: SSMTLosses) {
    if (loss.mediumToLowTurbineEfficiencyLoss || loss.mediumToLowTurbineUsefulEnergy) {
      this.showMediumToLowTurbine = true;
    }
  }

  checkCondensingLoss(loss: SSMTLosses) {
    if (loss.condensingLosses) {
      this.showCondensingLoss = true;
    }
  }

  checkCondensateFlashTank(loss: SSMTLosses) {
    if (loss.condensateFlashTankLoss) {
      this.showCondensateFlashTank = true;
    }
  }

  checkLowPressureVentedSteam(loss: SSMTLosses) {
    if (loss.lowPressureVentLoss) {
      this.showLowPressureVentedSteam = true;
    }
  }
}
