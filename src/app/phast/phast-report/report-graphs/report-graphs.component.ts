import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css']
})
export class ReportGraphsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;

  selectedPhast1: any;
  selectedPhast2: any;

  resultsArray: Array<any>;
  modExists: boolean = false;
  showResultsCats: ShowResultsCategories;
  pieLabels: any;
  baselineResults: PhastResults;
  colors: Array<string> = [
    '#BA4A00',
    '#E74C3C',
    '#DC7633',
    '#CA6F1E',
    '#F39C12',
    '#F1C40F',
    '#7B241C',
    '#909497',
    '#D2B4DE',
    '#BB8FCE',
    '#F9E79F',
    '#212F3C',
    '#4A235A'
  ]
  constructor(private phastService: PhastService, private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.resultsArray = new Array<any>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baselineResults = this.phastResultsService.getResults(this.phast, this.settings);
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
      if (this.phast.modifications) {
        if (this.phast.modifications.length != 0) {
          this.modExists = true;
          this.phast.modifications.forEach(mod => {
            let tmpResults = this.phastResultsService.getResults(mod.phast, this.settings);
            this.resultsArray.push({ name: mod.phast.name, data: tmpResults });
          })
          this.selectedPhast2 = this.resultsArray[1];
        }
      }
    } else {
      this.baselineResults = this.phastResultsService.initResults();
      this.resultsArray.push({ name: 'Baseline', data: this.baselineResults })
      this.selectedPhast1 = this.resultsArray[0];
    }
    this.pieLabels = new Array();
    this.getPieLabels(this.baselineResults, this.showResultsCats);
  }

  getPieLabels(phastResults: PhastResults, resultCats: ShowResultsCategories) {
    let i = 0;
    if (phastResults.totalWallLoss) {
      this.pieLabels.push({
        name: 'Wall Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalAtmosphereLoss) {
      this.pieLabels.push({
        name: 'Atmosphere Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalOtherLoss) {
      this.pieLabels.push({
        name: 'Other Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalCoolingLoss) {
      this.pieLabels.push({
        name: 'Cooling Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalOpeningLoss) {
      this.pieLabels.push({
        name: 'Opening Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalFixtureLoss) {
      this.pieLabels.push({
        name: 'Fixture Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalLeakageLoss) {
      this.pieLabels.push({
        name: 'Leakage Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalExtSurfaceLoss) {
      this.pieLabels.push({
        name: 'Extended Surface Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalChargeMaterialLoss) {
      this.pieLabels.push({
        name: 'Charge Materials',
        color: this.colors[i]
      })
      i++;
    }
    if (resultCats.showFlueGas && phastResults.totalFlueGas) {
      this.pieLabels.push({
        name: 'Flue Gas Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (resultCats.showAuxPower && phastResults.totalAuxPower) {
      this.pieLabels.push({
        name: 'Auxiliary Power Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (resultCats.showSlag && phastResults.totalSlag) {
      this.pieLabels.push({
        name: 'Slag Losses',
        color: this.colors[i]
      })
      i++;
    }
    if (resultCats.showExGas && phastResults.totalExhaustGasEAF) {
      this.pieLabels.push({
        name: 'Exhaust Gas',
        color: this.colors[i]
      })
      i++;
    }
    if (resultCats.showEnInput2 && phastResults.totalExhaustGas) {
      this.pieLabels.push({
        name: 'Exhaust Gas',
        color: this.colors[i]
      })
      i++;
    }
    if (phastResults.totalSystemLosses && resultCats.showSystemEff) {
      this.pieLabels.push({
        name: 'System Losses',
        color: this.colors[i]
      })
    }
    console.log(this.pieLabels);
  }
}
