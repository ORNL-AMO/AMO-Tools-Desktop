import { Component, OnInit, Input } from '@angular/core';
import { FSAT, FsatOutput } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-fsat-report-sankey',
  templateUrl: './fsat-report-sankey.component.html',
  styleUrls: ['./fsat-report-sankey.component.css']
})
export class FsatReportSankeyComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  printView: boolean;

  modifications: Array<{ name: string, fsat: FSAT }>;
  assessmentName: string;
  fsat1: { name: string, fsat: FSAT };
  fsat2: { name: string, fsat: FSAT };
  modExists: boolean = false;
  fsatOptions: Array<{ name: string, fsat: FSAT }>;
  fsat1CostSavings: number;
  fsat2CostSavings: number;

  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.assessmentName = this.assessment.name;
    this.prepFsatOptions();
    if (this.modExists) {
      this.getFsat1Savings();
      this.getFsat2Savings();
    }
  }

  prepFsatOptions() {
    this.fsatOptions = new Array<{ name: string, fsat: FSAT }>();
    this.fsatOptions.push({ name: 'Baseline', fsat: this.fsat });
    this.fsat1 = this.fsatOptions[0];

    if (this.fsat.modifications !== undefined && this.fsat.modifications !== null) {

      if (this.fsat.modifications.length > 0) {
        this.modExists = true;
        this.fsat.modifications.forEach(mod => {
          this.fsatOptions.push({ name: mod.fsat.name, fsat: mod.fsat });
        });
        this.fsat2 = this.fsatOptions[1];
      }
    }
  }

  getFsat1Savings() {

    if (!this.fsat1) {
      return;
    }

    let isMod;
    let baseFsatResults: FsatOutput;
    let fsat1Results: FsatOutput;
    baseFsatResults = this.fsatService.getResults(this.fsat, 'existing', this.settings);

    if (this.fsat1.name == this.fsat.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }

    if (isMod) {
      if (this.fsat1.fsat.fanMotor.optimize) {
        fsat1Results = this.fsatService.getResults(this.fsat1.fsat, 'optimal', this.settings);
      }
      else {
        fsat1Results = this.fsatService.getResults(this.fsat1.fsat, 'modified', this.settings);
      }
    }
    else {
      fsat1Results = this.fsatService.getResults(this.fsat1.fsat, 'existing', this.settings);
    }

    let annualSavingsPotential = baseFsatResults.annualCost - fsat1Results.annualCost;
    this.fsat1CostSavings = annualSavingsPotential;
  }

  getFsat2Savings() {

    if (!this.fsat2) {
      return;
    }

    let isMod;
    let baseFsatResults: FsatOutput;
    let fsat2Results: FsatOutput;
    baseFsatResults = this.fsatService.getResults(this.fsat, 'existing', this.settings);

    if (this.fsat2.name == this.fsat.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }

    if (isMod) {
      if (this.fsat2.fsat.fanMotor.optimize) {
        fsat2Results = this.fsatService.getResults(this.fsat2.fsat, 'optimal', this.settings);
      }
      else {
        fsat2Results = this.fsatService.getResults(this.fsat2.fsat, 'modified', this.settings);
      }
    }
    else {
      fsat2Results = this.fsatService.getResults(this.fsat2.fsat, 'existing', this.settings);
    }

    let annualSavingsPotential = baseFsatResults.annualCost - fsat2Results.annualCost;
    this.fsat2CostSavings = annualSavingsPotential;
  }

}
