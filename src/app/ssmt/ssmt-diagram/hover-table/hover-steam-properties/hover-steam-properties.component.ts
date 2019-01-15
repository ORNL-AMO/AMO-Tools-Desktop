import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput, BoilerOutput } from '../../../../shared/models/steam/steam-outputs';

@Component({
  selector: 'app-hover-steam-properties',
  templateUrl: './hover-steam-properties.component.html',
  styleUrls: ['./hover-steam-properties.component.css']
})
export class HoverSteamPropertiesComponent implements OnInit {
  @Input()
  hoveredProperty: string;
  
  steam: SteamPropertiesOutput;
  label: string;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    if(this.hoveredProperty == 'boilerSteamHovered'){
      this.setBoilerSteam();
    }else if(this.hoveredProperty == 'boilerFeedwaterHovered'){
      this.setBoilerFeedwater();
    }else if(this.hoveredProperty == 'boilerBlowdownHovered'){
      this.setBoilerBlowdown();
    }
  }

  setBoilerSteam(){
    this.label = 'Boiler Steam';
    let boilerOutput: BoilerOutput = this.calculateModelService.boilerOutput;
    this.steam = {
      pressure: boilerOutput.steamPressure,
      temperature: boilerOutput.steamTemperature,
      specificEnthalpy: boilerOutput.steamSpecificEnthalpy,
      specificEntropy: boilerOutput.steamSpecificEntropy,
      quality: boilerOutput.steamQuality,
      massFlow: boilerOutput.steamMassFlow
    }
  }

  setBoilerFeedwater(){
    this.label = 'Boiler Feedwater';
    let boilerOutput: BoilerOutput = this.calculateModelService.boilerOutput;
    this.steam = {
      pressure: boilerOutput.feedwaterPressure,
      temperature: boilerOutput.feedwaterTemperature,
      specificEnthalpy: boilerOutput.feedwaterSpecificEnthalpy,
      specificEntropy: boilerOutput.feedwaterSpecificEntropy,
      quality: boilerOutput.feedwaterQuality,
      massFlow: boilerOutput.feedwaterMassFlow
    }
  }

  setBoilerBlowdown(){
    this.label = 'Boiler Blowdown';
    let boilerOutput: BoilerOutput = this.calculateModelService.boilerOutput;
    this.steam = {
      pressure: boilerOutput.blowdownPressure,
      temperature: boilerOutput.blowdownTemperature,
      specificEnthalpy: boilerOutput.blowdownSpecificEnthalpy,
      specificEntropy: boilerOutput.blowdownSpecificEntropy,
      quality: boilerOutput.blowdownQuality,
      massFlow: boilerOutput.blowdownMassFlow
    }
  }

}
