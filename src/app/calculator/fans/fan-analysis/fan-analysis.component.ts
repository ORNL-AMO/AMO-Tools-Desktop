import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Fan203Inputs } from '../../../shared/models/fans';
import { FanAnalysisService } from './fan-analysis.service';
import { ConvertFsatService } from '../../../fsat/convert-fsat.service';

@Component({
  selector: 'app-fan-analysis',
  templateUrl: './fan-analysis.component.html',
  styleUrls: ['./fan-analysis.component.css']
})
export class FanAnalysisComponent implements OnInit {
  @Input()
  settings: Settings;

  inputs: Fan203Inputs;
  constructor(private settingsDbService: SettingsDbService, private fanAnalysisService: FanAnalysisService, private convertFsatService: ConvertFsatService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }

    this.inputs = this.fanAnalysisService.inputData;
    if (this.inputs === undefined) {
      this.inputs = this.fanAnalysisService.getMockData();
      this.inputs = this.convertFsatService.convertFan203Inputs(this.inputs, this.settings);
    }
  }

}
