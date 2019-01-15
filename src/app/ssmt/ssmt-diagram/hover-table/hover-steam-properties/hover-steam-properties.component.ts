import { Component, OnInit, Input } from '@angular/core';
import { CalculateModelService } from '../../../ssmt-calculations/calculate-model.service';
import { SteamPropertiesOutput, BoilerOutput, PrvOutput, TurbineOutput } from '../../../../shared/models/steam/steam-outputs';

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
    } else if (this.hoveredProperty == 'condensingTurbineInletHovered') {
      this.condensingTurbineInletHovered();
    } else if (this.hoveredProperty == 'mediumToLowTurbineInletHovered') {
      this.mediumToLowTurbineInletHovered();
    } else if (this.hoveredProperty == 'highToLowTurbineInletHovered') {
      this.highToLowTurbineInletHovered();
    } else if (this.hoveredProperty == 'highToMediumTurbineInletHovered') {
      this.highToMediumTurbineInletHovered();
    } else if (this.hoveredProperty == 'condensingTurbineOutletHovered') {
      this.condensingTurbineOutletHovered();
    } else if (this.hoveredProperty == 'mediumToLowTurbineOutletHovered') {
      this.mediumToLowTurbineOutletHovered();
    } else if (this.hoveredProperty == 'highToLowTurbineOutletHovered') {
      this.highToLowTurbineOutletHovered();
    } else if (this.hoveredProperty == 'highToMediumTurbineOutletHovered') {
      this.highToMediumTurbineOutletHovered();
    }
  }
  condensingTurbineOutletHovered() {
    this.label = 'Condensing Turbine Outlet';
    let turbine: TurbineOutput = this.calculateModelService.condensingTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  condensingTurbineInletHovered() {
    this.label = 'Condensing Turbine Inlet';
    let turbine: TurbineOutput = this.calculateModelService.condensingTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  mediumToLowTurbineOutletHovered() {
    this.label = 'Medium to Low Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.calculateModelService.mediumToLowPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  mediumToLowTurbineInletHovered() {
    this.label = 'Medium to Low Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.calculateModelService.mediumToLowPressureTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  highToLowTurbineOutletHovered() {
    this.label = 'High to Low Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.calculateModelService.highToLowPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  highToLowTurbineInletHovered() {
    this.label = 'High to Low Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.calculateModelService.highToLowPressureTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  highToMediumTurbineOutletHovered() {
    this.label = 'High to Medium Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.calculateModelService.highPressureToMediumPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  highToMediumTurbineInletHovered() {
    this.label = 'High to Medium Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.calculateModelService.highPressureToMediumPressureTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  setInletSteam(steamData: TurbineOutput | PrvOutput, massFlow: number) {
    this.steam = {
      pressure: steamData.inletPressure,
      temperature: steamData.inletTemperature,
      specificEnthalpy: steamData.inletSpecificEnthalpy,
      specificEntropy: steamData.inletSpecificEntropy,
      quality: steamData.inletQuality,
      massFlow: massFlow
    }
  }

  setOutletSteam(steamData: TurbineOutput | PrvOutput, massFlow: number) {
    this.steam = {
      pressure: steamData.outletPressure,
      temperature: steamData.outletTemperature,
      specificEnthalpy: steamData.outletSpecificEnthalpy,
      specificEntropy: steamData.outletSpecificEntropy,
      quality: steamData.outletQuality,
      massFlow: massFlow
    }
  }

  mediumPressurePRVFeedwaterHovered() {
    this.label = 'High to Medium PRV Feedwater';
    let prv: PrvOutput = this.calculateModelService.highToMediumPressurePRV;
    this.setFeedwaterProperties(prv);
  }

  lowPressurePRVFeedwaterHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Feedwater';
    } else {
      this.label = 'High to Low PRV Inlet';
    }
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.setFeedwaterProperties(prv);
  }

  setFeedwaterProperties(steamData: PrvOutput | BoilerOutput) {
    this.steam = {
      pressure: steamData.feedwaterPressure,
      temperature: steamData.feedwaterTemperature,
      specificEnthalpy: steamData.feedwaterSpecificEnthalpy,
      specificEntropy: steamData.feedwaterSpecificEntropy,
      quality: steamData.feedwaterQuality,
      massFlow: steamData.feedwaterMassFlow
    }
  }

  mediumPressurePRVInletHovered() {
    this.label = 'Medium to Low PRV Inlet';
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.setInletSteam(prv, prv.inletMassFlow);
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
    this.setInletSteam(prv, prv.inletMassFlow);
  }

  lowPressurePRVOutletHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Outlet';
    } else {
      this.label = 'High to Low PRV Outlet';
    }
    let prv: PrvOutput = this.calculateModelService.lowPressurePRV;
    this.setOutletSteam(prv, prv.inletMassFlow);
  }

  mediumPressurePRVOutletHovered() {
    this.label = 'High to Medium PRV Outlet';
    let prv: PrvOutput = this.calculateModelService.highToMediumPressurePRV;
    this.setOutletSteam(prv, prv.inletMassFlow);
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
    this.setFeedwaterProperties(boilerOutput);
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
