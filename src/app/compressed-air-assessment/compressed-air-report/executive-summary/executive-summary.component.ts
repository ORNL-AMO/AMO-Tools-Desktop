import { Component, Input, OnInit } from '@angular/core';
import { Modification } from '../../../shared/models/compressed-air-assessment';
import { BaselineResults, DayTypeModificationResult } from '../../compressed-air-assessment-results.service';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  baselineResults: BaselineResults;
  @Input()
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult }>;



  displayAddReceiverVolume: boolean;
  displayAdjustCascadingSetPoints: boolean;
  displayImproveEndUseEfficiency: boolean;
  displayReduceAirLeaks: boolean;
  displayReduceRuntime: boolean;
  displayReduceSystemPressure: boolean;
  displayUseAutomaticSequencer: boolean;
  displayAuxiliaryPower: boolean;

  constructor() { }

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
    });
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
    if (modification.reduceSystemAirPressure.order != 100) {
      demandProjects = demandProjects + "Reduce System Air Pressure<br>";
      hasProjects = true;
    }
    if (!hasProjects) {
      return '&mdash;';
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
    if (modification.adjustCascadingSetPoints.order != 100) {
      supplyProjects = supplyProjects + "Add Primary Receiver Volume<br>";
      hasProjects = true;
    }
    if (!hasProjects) {
      return '&mdash;';
    }
    return supplyProjects;
  }


}
