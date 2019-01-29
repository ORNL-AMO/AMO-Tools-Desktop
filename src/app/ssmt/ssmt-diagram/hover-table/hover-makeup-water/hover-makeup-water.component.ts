import { Component, OnInit, Input } from '@angular/core';
import { SteamPropertiesOutput, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-hover-makeup-water',
  templateUrl: './hover-makeup-water.component.html',
  styleUrls: ['./hover-makeup-water.component.css']
})
export class HoverMakeupWaterComponent implements OnInit {
  @Input()
  combined: boolean;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;

  makeupWater: SteamPropertiesOutput;
  makeupWaterLabel: string;
  constructor() { }

  ngOnInit() {
    if(this.combined){
      this.makeupWater = this.outputData.makeupWaterAndCondensateHeader;
      this.makeupWaterLabel = 'Make-up Water and Condensate';
    }else{
      this.makeupWater = this.outputData.makeupWater;
      this.makeupWaterLabel = 'Make-up Water';
    }
  }
}
