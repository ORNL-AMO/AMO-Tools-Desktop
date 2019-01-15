import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput, BoilerOutput, PrvOutput } from '../../../../shared/models/steam/steam-outputs';

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
  numberOfHeaders: number;
  constructor(private calculateModelService: CalculateModelService) { }

  ngOnInit() {
    this.numberOfHeaders = this.calculateModelService.inputData.headerInput.numberOfHeaders;
    if (this.hoveredProperty == 'boilerSteamHovered') {
      this.boilerSteamHovered();
    } else if (this.hoveredProperty == 'boilerFeedwaterHovered') {
      this.boilerFeedwaterHovered();
    } else if (this.hoveredProperty == 'boilerBlowdownHovered') {
      this.boilerBlowdownHovered();
    } else if (this.hoveredProperty == 'mediumPressurePRVInletHovered') {
      this.mediumPressurePRVInletHovered();
    } else if (this.hoveredProperty == 'highPressurePRVInletHovered') {
      this.highPressurePRVInletHovered();
    } else if (this.hoveredProperty == 'lowPressurePRVOutletHovered') {
      this.lowPressurePRVOutletHovered();
    } else if (this.hoveredProperty == 'mediumPressurePRVOutletHovered') {
      this.mediumPressurePRVOutletHovered();
    } else if (this.hoveredProperty == 'mediumPressurePRVFeedwaterHovered') {
      this.mediumPressurePRVFeedwaterHovered();
    } else if (this.hoveredProperty == 'lowPressurePRVFeedwaterHovered') {
      this.lowPressurePRVFeedwaterHovered();
    }
  }

  mediumPressurePRVFeedwaterHovered() {
    this.label = 'High to Medium PRV Feedwater';
    let prv: PrvOutput = this.calculateModelService.highToMediumPressurePRV;
    this.steam = {
      pressure: prv.feedwaterPressure,
      temperature: prv.feedwaterTemperature,
      specificEnthalpy: prv.feedwaterSpecificEnthalpy,
      specificEntropy: prv.feedwaterSpecificEntropy,
      quality: prv.feedwaterQuality,
      massFlow: prv.feedwaterMassFlow
    }
  }

  lowPressurePRVFeedwaterHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Feedwater';
    } else {
      this.label = 'High to Low PRV Inlet';
    }
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.steam = {
      pressure: prv.feedwaterPressure,
      temperature: prv.feedwaterTemperature,
      specificEnthalpy: prv.feedwaterSpecificEnthalpy,
      specificEntropy: prv.feedwaterSpecificEntropy,
      quality: prv.feedwaterQuality,
      massFlow: prv.feedwaterMassFlow
    }
  }

  mediumPressurePRVInletHovered() {
    this.label = 'Medium to Low PRV Inlet';
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.steam = {
      pressure: prv.inletPressure,
      temperature: prv.inletTemperature,
      specificEnthalpy: prv.inletSpecificEnthalpy,
      specificEntropy: prv.inletSpecificEntropy,
      quality: prv.inletQuality,
      massFlow: prv.inletMassFlow
    }
  }
  highPressurePRVInletHovered() {
    let prv: PrvOutput;
    if (this.numberOfHeaders == 3) {
      this.label = 'High to Medium PRV Inlet';
      prv = this.calculateModelService.highToMediumPressurePRV;
    } else {
      this.label = 'High to Low PRV Inlet';
      prv = this.calculateModelService.lowPressurePRV;
    }
    this.steam = {
      pressure: prv.inletPressure,
      temperature: prv.inletTemperature,
      specificEnthalpy: prv.inletSpecificEnthalpy,
      specificEntropy: prv.inletSpecificEntropy,
      quality: prv.inletQuality,
      massFlow: prv.inletMassFlow
    }
  }
  lowPressurePRVOutletHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Outlet';
    } else {
      this.label = 'High to Low PRV Outlet';
    }
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.steam = {
      pressure: prv.inletPressure,
      temperature: prv.inletTemperature,
      specificEnthalpy: prv.inletSpecificEnthalpy,
      specificEntropy: prv.inletSpecificEntropy,
      quality: prv.inletQuality,
      massFlow: prv.inletMassFlow
    }
  }
  mediumPressurePRVOutletHovered() {
    this.label = 'High to Medium PRV Outlet';
    let prv: PrvOutput = this.calculateModelService.highToMediumPressurePRV;
    this.steam = {
      pressure: prv.inletPressure,
      temperature: prv.inletTemperature,
      specificEnthalpy: prv.inletSpecificEnthalpy,
      specificEntropy: prv.inletSpecificEntropy,
      quality: prv.inletQuality,
      massFlow: prv.inletMassFlow
    }
  }
  boilerSteamHovered() {
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

  boilerFeedwaterHovered() {
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

  boilerBlowdownHovered() {
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
