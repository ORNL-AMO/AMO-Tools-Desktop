import { Component, OnInit, Input } from '@angular/core';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessmentService } from '../../../calculator/furnaces/pre-assessment/pre-assessment.service';
import { PreAssessment } from '../../../calculator/furnaces/pre-assessment/pre-assessment';
import { MeteredEnergy } from '../../../shared/models/phast/meteredEnergy';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { DirectoryDbService } from '../../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-phast-rollup-pre-assessment-table',
  templateUrl: './phast-rollup-pre-assessment-table.component.html',
  styleUrls: ['./phast-rollup-pre-assessment-table.component.css']
})
export class PhastRollupPreAssessmentTableComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  calculator: Calculator;

  preAssessments: Array<PreAssessment>;
  graphColors: Array<string>;
  data: Array<{ name: string, type: string, energyUse: number, energyCost: number, percentEnergy: number, percentCost: number, color: string }>;
  unit: string
  totalEnergyUse: number;
  totalEnergyCost: number;
  directorySettings: Settings;

  constructor(private preAssessmentService: PreAssessmentService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    this.totalEnergyUse = 0;
    this.totalEnergyCost = 0;
    this.unit = this.settings.energyResultUnit;
    this.graphColors = graphColors;
    this.getDirectorySettings();
  }

  getDirectorySettings() {
    let tmpSettings: Settings = this.settingsDbService.getByDirectoryId(this.calculator.directoryId);
    if (tmpSettings) {
      this.directorySettings = tmpSettings;
      this.getData();
    }
  }

  getData(): void {
    if (this.calculator !== undefined) {
      if (this.calculator.preAssessments !== undefined) {
        this.preAssessments = this.calculator.preAssessments;
      }
    }
    this.data = new Array<{ name: string, type: string, energyUse: number, energyCost: number, percentEnergy: number, percentCost: number, color: string }>();
    let costResults = new Array<{ name: string, percent: number, value: number, color: string, energyCost: number }>();
    let energyResults = new Array<{ name: string, percent: number, value: number, color: string, energyCost: number }>();

    if (this.preAssessments !== undefined) {
      costResults = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, 'energyCost');
      energyResults = this.preAssessmentService.getResults(this.preAssessments, this.directorySettings, 'value');

      for (let i = 0; i < this.preAssessments.length; i++) {

        let tmpData: { name: string, type: string, energyUse: number, energyCost: number, percentEnergy: number, percentCost: number, color: string };

        tmpData = {
          name: costResults[i].name,
          type: this.preAssessments[i].type,
          energyUse: energyResults[i].value,
          energyCost: energyResults[i].energyCost,
          percentEnergy: energyResults[i].percent / 100,
          percentCost: costResults[i].percent / 100,
          color: energyResults[i].color
        }
        this.data.unshift(tmpData);
      }
    }
  }
}
