import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CompressedAirReportRollupService } from '../../../report-rollup/compressed-air-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults, DayTypeModificationResult } from '../../calculations/caCalculationModels';

@Component({
    selector: 'app-executive-summary',
    templateUrl: './executive-summary.component.html',
    styleUrls: ['./executive-summary.component.css'],
    standalone: false
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  baselineResults: BaselineResults;
  @Input()
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult }>;
  @Input()
  modifications: Array<Modification>;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;


  notes: Array<{
    modificationName: string,
    note: string
  }>;
  displayFlowReallocation: boolean;
  displayAddReceiverVolume: boolean;
  displayAdjustCascadingSetPoints: boolean;
  displayImproveEndUseEfficiency: boolean;
  displayReduceAirLeaks: boolean;
  displayReduceRuntime: boolean;
  displayReduceSystemPressure: boolean;
  displayUseAutomaticSequencer: boolean;
  displayAuxiliaryPower: boolean;
  selectedModificationIndex: number;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(private compressedAirReportRollupService: CompressedAirReportRollupService) { }

  ngOnInit(): void {
    this.combinedDayTypeResults.forEach(modResult => {
      if (!this.displayAddReceiverVolume) {
        this.displayAddReceiverVolume = modResult.modification.addPrimaryReceiverVolume.order != 100;
      }
      if (!this.displayAdjustCascadingSetPoints) {
        this.displayAdjustCascadingSetPoints = modResult.modification.adjustCascadingSetPoints.order != 100;
      }
      if (!this.displayImproveEndUseEfficiency) {
        this.displayImproveEndUseEfficiency = modResult.modification.improveEndUseEfficiency.order != 100;
        if (!this.displayAuxiliaryPower) {
          modResult.modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
            if (item.substituteAuxiliaryEquipment) {
              this.displayAuxiliaryPower = true;
            }
          })
        }
      }
      if (!this.displayReduceAirLeaks) {
        this.displayReduceAirLeaks = modResult.modification.reduceAirLeaks.order != 100;
      }
      if (!this.displayReduceRuntime) {
        this.displayReduceRuntime = modResult.modification.reduceRuntime.order != 100;
      }
      if (!this.displayReduceSystemPressure) {
        this.displayReduceSystemPressure = modResult.modification.reduceSystemAirPressure.order != 100;
      }
      if (!this.displayUseAutomaticSequencer) {
        this.displayUseAutomaticSequencer = modResult.modification.useAutomaticSequencer.order != 100;
      }
      if(!this.displayFlowReallocation){
        this.displayFlowReallocation = modResult.combinedResults.flowReallocationSavings.savings.power != 0;
      }
    });
    this.setNotes();

    if (this.inRollup) {
      this.compressedAirReportRollupService.selectedAssessments.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      })
    }
  }

  getDemandEnergyProjects(modification: Modification): string {
    let demandProjects: string = '';
    let hasProjects: boolean = false;
    if (modification.reduceAirLeaks.order != 100) {
      demandProjects = demandProjects + "Reduce Air Leaks<br>";
      hasProjects = true;
    }
    if (modification.improveEndUseEfficiency.order != 100) {
      demandProjects = demandProjects + "Improve End Use Efficiency<br>";
      hasProjects = true;
    }
    if (!hasProjects) {
      return '&mdash; &mdash;';
    }
    return demandProjects;
  }

  getSupplyEnergyProjects(modification: Modification): string {
    let supplyProjects: string = '';
    let hasProjects: boolean = false;

    if (modification.adjustCascadingSetPoints.order != 100) {
      supplyProjects = supplyProjects + "Adjust Cascading Set Points<br>";
      hasProjects = true;
    }
    if (modification.useAutomaticSequencer.order != 100) {
      supplyProjects = supplyProjects + "Use Automatic Sequencer<br>";
      hasProjects = true;
    }
    if (modification.reduceRuntime.order != 100) {
      supplyProjects = supplyProjects + "Reduce Runtime<br>";
      hasProjects = true;
    }
    if (modification.addPrimaryReceiverVolume.order != 100) {
      supplyProjects = supplyProjects + "Add Primary Receiver Volume<br>";
      hasProjects = true;
    }
    if (modification.reduceSystemAirPressure.order != 100) {
      supplyProjects = supplyProjects + "Reduce System Air Pressure<br>";
      hasProjects = true;
    }
    if (!hasProjects) {
      return '&mdash; &mdash;';
    }
    return supplyProjects;
  }


  setNotes() {
    this.notes = new Array();
    this.modifications.forEach(modification => {
      if (modification.notes) {
        this.notes.push({
          modificationName: modification.name,
          note: modification.notes
        })
      }
    })
  }

  useModification() {
    this.compressedAirReportRollupService.updateSelectedCompressorAssessments({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }
}
