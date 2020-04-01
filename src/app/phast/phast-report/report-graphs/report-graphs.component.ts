import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { phastGraphColors } from './graphColors';

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
  // @Input()
  // assessment: Assessment;
  @Input()
  showPrint: boolean;
  @Input()
  printSankey: boolean;
  @Input()
  printGraphs: boolean;

  selectedPhast1: PHAST;
  selectedPhast1PieData: Array<{ value: number, label: string }>;
  selectedPhast2: PHAST;
  selectedPhast2PieData: Array<{ value: number, label: string }>;


  lossUnit: string;
  constructor(private phastResultsService: PhastResultsService) { }

  ngOnInit() {
    this.selectedPhast1 = this.phast;
    this.setSelectedPhast1();
    if (this.phast.modifications && this.phast.modifications.length != 0) {
      this.selectedPhast2 = this.phast.modifications[0].phast;
      this.setSelectedPhast2();
    }

    if (this.settings.unitsOfMeasure === "Metric") {
      this.lossUnit = "GJ/hr";
    }
    else if (this.settings.unitsOfMeasure === "Imperial") {
      this.lossUnit = "MMBtu/hr";
    }
  }

  setSelectedPhast1() {
    this.selectedPhast1PieData = this.getValuesAndLabels(this.selectedPhast1);
  }
  setSelectedPhast2() {
    this.selectedPhast2PieData = this.getValuesAndLabels(this.selectedPhast2)
  }



  getValuesAndLabels(phast: PHAST): Array<{ value: number, label: string }> {
    let results: PhastResults = this.phastResultsService.getResults(phast, this.settings);
    let resultCats: ShowResultsCategories = this.phastResultsService.getResultCategories(this.settings);
    let pieData = new Array<{ label: string, value: number }>();

    if (results.totalWallLoss) {
      pieData.push({ label: "Wall", value: results.totalWallLoss });
    }
    if (results.totalAtmosphereLoss) {
      pieData.push({ label: "Atmosphere", value: results.totalAtmosphereLoss });
    }
    if (results.totalOtherLoss) {
      pieData.push({ label: "Other", value: results.totalOtherLoss });
    }
    if (results.totalCoolingLoss) {
      pieData.push({ label: "Cooling", value: results.totalCoolingLoss });
    }
    if (results.totalOpeningLoss) {
      pieData.push({ label: "Opening", value: results.totalOpeningLoss });
    }
    if (results.totalFixtureLoss) {
      pieData.push({ label: "Fixture", value: results.totalFixtureLoss });
    }
    if (results.totalLeakageLoss) {
      pieData.push({ label: "Leakage", value: results.totalLeakageLoss });
    }
    if (results.totalExtSurfaceLoss) {
      pieData.push({ label: "Extended Surface", value: results.totalExtSurfaceLoss });
    }
    if (results.totalChargeMaterialLoss) {
      pieData.push({ label: "Charge Material", value: results.totalChargeMaterialLoss });
    }
    if (resultCats.showFlueGas) {
      pieData.push({ label: "Flue Gas", value: results.totalFlueGas });
    }
    if (resultCats.showAuxPower) {
      pieData.push({ label: "Auxiliary", value: results.totalAuxPower });
    }
    if (resultCats.showSlag) {
      pieData.push({ label: "Slag", value: results.totalSlag });
    }
    if (resultCats.showExGas) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGasEAF });
    }
    if (resultCats.showEnInput2) {
      pieData.push({ label: "Exhaust Gas", value: results.totalExhaustGas });
    }
    if (resultCats.showSystemEff) {
      pieData.push({ label: "System Eff.", value: results.totalSystemLosses });
    }
    return pieData;
  }
}
