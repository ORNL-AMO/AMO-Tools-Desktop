import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-makeup-water',
  templateUrl: './hover-makeup-water.component.html',
  styleUrls: ['./hover-makeup-water.component.css']
})
export class HoverMakeupWaterComponent implements OnInit {
  @Input()
  combined: boolean;

  makeupWater: SteamPropertiesOutput;
  makeupWaterLabel: string;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if(this.combined){
      this.makeupWater = this.calculateModelService.makeupWaterAndCondensateHeader;
      this.makeupWaterLabel = 'Make-up Water and Condensate';
    }else{
      this.makeupWater = this.calculateModelService.makeupWater;
      this.makeupWaterLabel = 'Make-up Water';
    }
  }
}
