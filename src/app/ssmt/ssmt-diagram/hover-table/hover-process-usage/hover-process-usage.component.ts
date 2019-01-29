import { Component, OnInit, Input } from '@angular/core';
import { ProcessSteamUsage, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-process-usage',
  templateUrl: './hover-process-usage.component.html',
  styleUrls: ['./hover-process-usage.component.css']
})
export class HoverProcessUsageComponent implements OnInit {
  @Input()
  pressureLevel: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  processSteamUsage: ProcessSteamUsage;
  constructor() { }

  ngOnInit() {
    if (this.pressureLevel == 'Low') {
      this.processSteamUsage = this.outputData.lowPressureProcessUsage;
    } else if (this.pressureLevel == 'Medium') {
      this.processSteamUsage = this.outputData.mediumPressureProcessUsage;

    } else if (this.pressureLevel == 'High') {
      this.processSteamUsage = this.outputData.highPressureProcessUsage;

    }
  }

}
