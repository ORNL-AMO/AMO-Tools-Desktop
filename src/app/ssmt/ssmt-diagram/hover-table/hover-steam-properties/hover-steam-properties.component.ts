import { Component, OnInit, Input } from '@angular/core';
import { SteamPropertiesOutput, BoilerOutput, PrvOutput, TurbineOutput, HeaderOutputObj, FlashTankOutput, DeaeratorOutput, ProcessSteamUsage, SSMTOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-hover-steam-properties',
  templateUrl: './hover-steam-properties.component.html',
  styleUrls: ['./hover-steam-properties.component.css']
})
export class HoverSteamPropertiesComponent implements OnInit {
  @Input()
  hoveredProperty: string;
  @Input()
  settings: Settings;
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;

  steam: SteamPropertiesOutput;
  label: string;
  numberOfHeaders: number;
  constructor() { }

  ngOnInit() {
    this.numberOfHeaders = this.inputData.headerInput.numberOfHeaders;
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
    } else if (this.hoveredProperty == 'lowPressureProcessSteamInletHovered') {
      this.lowPressureProcessSteamInletHovered();
    } else if (this.hoveredProperty == 'mediumPressureProcessSteamInletHovered') {
      this.mediumPressureProcessSteamInletHovered();
    } else if (this.hoveredProperty == 'highPressureProcessSteamInletHovered') {
      this.highPressureProcessSteamInletHovered();
    } else if (this.hoveredProperty == 'lowPressureCondensateHovered') {
      this.lowPressureCondensateHovered();
    } else if (this.hoveredProperty == 'mediumPressureCondensateHovered') {
      this.mediumPressureCondensateHovered();
    } else if (this.hoveredProperty == 'highPressureCondensateHovered') {
      this.highPressureCondensateHovered();
    } else if (this.hoveredProperty == 'highPressureFlashTankOutletSteamHovered') {
      this.highPressureFlashTankOutletSteamHovered();
    } else if (this.hoveredProperty == 'mediumPressureFlashTankOutletSteamHovered') {
      this.mediumPressureFlashTankOutletSteamHovered();
    } else if (this.hoveredProperty == 'mediumPressureFlashTankInletCondensateHovered') {
      this.mediumPressureFlashTankInletCondensateHovered();
    } else if (this.hoveredProperty == 'highPressureFlashTankOutletCondensateHovered') {
      this.highPressureFlashTankOutletCondensateHovered();
    } else if (this.hoveredProperty == 'mediumPressureFlashTankOutletCondensateHovered') {
      this.mediumPressureFlashTankOutletCondensateHovered();
    } else if (this.hoveredProperty == 'condensateFlashTankInletHovered') {
      this.condensateFlashTankInletHovered();
    } else if (this.hoveredProperty == 'condensateFlashTankVentHovered') {
      this.condensateFlashTankVentHovered();
    } else if (this.hoveredProperty == 'boilerBlowdownFlashedLiquidHovered') {
      this.boilerBlowdownFlashedLiquidHovered();
    } else if (this.hoveredProperty == 'boilerBlowdownFlashedHovered') {
      this.boilerBlowdownFlashedHovered();
    } else if (this.hoveredProperty == 'makeupWaterPropertiesHovered') {
      this.makeupWaterPropertiesHovered();
    } else if (this.hoveredProperty == 'returnCondensateHovered') {
      this.returnCondensateHovered();
    } else if (this.hoveredProperty == 'makeupWaterCondensatePropertiesHovered') {
      this.makeupWaterCondensatePropertiesHovered();
    } else if (this.hoveredProperty == 'deaeratorInletSteamHovered') {
      this.deaeratorInletSteamHovered();
    } else if (this.hoveredProperty == 'deaeratorVentHovered') {
      this.deaeratorVentHovered();
    } else if (this.hoveredProperty == 'deaeratorFeedwaterHovered') {
      this.deaeratorFeedwaterHovered();
    } else if (this.hoveredProperty == 'feedwaterHovered') {
      this.boilerFeedwaterHovered();
    }else if (this.hoveredProperty == 'ventedLowPressureSteam'){
      this.hoverVentedLowPressureSteam();
    }
  }

  hoverVentedLowPressureSteam(){
    this.label = 'Low Pressure Vented Steam';
    let ventedSteam: SteamPropertiesOutput = this.outputData.ventedLowPressureSteam;
    this.setSteamProperties(ventedSteam);
  }

  deaeratorFeedwaterHovered() {
    this.label = 'Deaerator Feedwater';
    let deaerator: DeaeratorOutput = this.outputData.deaeratorOutput;
    this.steam = {
      pressure: deaerator.feedwaterPressure,
      temperature: deaerator.feedwaterTemperature,
      specificEnthalpy: deaerator.feedwaterSpecificEnthalpy,
      specificEntropy: deaerator.feedwaterSpecificEntropy,
      quality: deaerator.feedwaterQuality,
      massFlow: deaerator.feedwaterMassFlow
    }
  }
  deaeratorInletSteamHovered() {
    this.label = 'Deaerator Steam Use';
    let deaerator: DeaeratorOutput = this.outputData.deaeratorOutput;
    this.steam = {
      pressure: deaerator.inletSteamPressure,
      temperature: deaerator.inletSteamTemperature,
      specificEnthalpy: deaerator.inletSteamSpecificEnthalpy,
      specificEntropy: deaerator.inletSteamSpecificEntropy,
      quality: deaerator.inletSteamQuality,
      massFlow: deaerator.inletSteamMassFlow
    }
  }
  deaeratorVentHovered() {
    this.label = 'Deaerator Vented Steam';
    let deaerator: DeaeratorOutput = this.outputData.deaeratorOutput;
    this.steam = {
      pressure: deaerator.ventedSteamPressure,
      temperature: deaerator.ventedSteamTemperature,
      specificEnthalpy: deaerator.ventedSteamSpecificEnthalpy,
      specificEntropy: deaerator.ventedSteamSpecificEntropy,
      quality: deaerator.ventedSteamQuality,
      massFlow: deaerator.ventedSteamMassFlow
    }
  }
  makeupWaterCondensatePropertiesHovered() {
    this.label = 'Condensate and Make-Up Water';
    let headerObj: HeaderOutputObj = this.outputData.makeupWaterAndCondensateHeader;
    this.setSteamProperties(headerObj);
  }
  returnCondensateHovered() {
    this.label = 'Condensate Returned';
    let returnedCondensate: SteamPropertiesOutput = this.outputData.returnCondensate;
    this.setSteamProperties(returnedCondensate);
  }
  makeupWaterPropertiesHovered() {
    this.label = 'Make-Up Water';
    let makeupWater: SteamPropertiesOutput = this.outputData.makeupWater;
    this.setSteamProperties(makeupWater);
  }

  boilerBlowdownFlashedLiquidHovered() {
    this.label = 'Boiler Blowdown Drain';
    let flashTank: FlashTankOutput = this.outputData.blowdownFlashTank;
    this.setFlashTankOutletCondensate(flashTank);
  }

  boilerBlowdownFlashedHovered() {
    this.label = 'Blowdown Flashed';
    let flashTank: FlashTankOutput = this.outputData.blowdownFlashTank;
    this.setFlashTankSteam(flashTank);
  }

  condensateFlashTankVentHovered() {
    this.label = 'Condensate Flashed';
    let flashTank: FlashTankOutput = this.outputData.condensateFlashTank;
    this.setFlashTankSteam(flashTank);
  }
  condensateFlashTankInletHovered() {
    this.label = 'All Condensate Condensate';
    let flashTank: FlashTankOutput = this.outputData.condensateFlashTank;
    this.setFlashTankInletCondensate(flashTank)
  }

  mediumPressureFlashTankInletCondensateHovered() {
    this.label = 'High and Medium Pressure Condensate';
    let flashTank: FlashTankOutput = this.outputData.mediumPressureCondensateFlashTank;
    this.setFlashTankInletCondensate(flashTank);
  }

  highPressureFlashTankOutletCondensateHovered() {
    this.label = 'Remaining High Pressure Condensate';
    let flashTank: FlashTankOutput = this.outputData.highPressureCondensateFlashTank;
    this.setFlashTankOutletCondensate(flashTank);
  }

  mediumPressureFlashTankOutletCondensateHovered() {
    this.label = 'Remaining High and Medium Pressure Condensate';
    let flashTank: FlashTankOutput = this.outputData.mediumPressureCondensateFlashTank;
    this.setFlashTankOutletCondensate(flashTank);
  }

  setFlashTankOutletCondensate(flashTank: FlashTankOutput) {
    this.steam = {
      pressure: flashTank.outletLiquidPressure,
      temperature: flashTank.outletLiquidTemperature,
      specificEnthalpy: flashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: flashTank.outletLiquidSpecificEntropy,
      quality: flashTank.outletLiquidQuality,
      massFlow: flashTank.outletLiquidMassFlow
    }
  }

  setFlashTankInletCondensate(flashTank: FlashTankOutput) {
    this.steam = {
      pressure: flashTank.inletWaterPressure,
      temperature: flashTank.inletWaterTemperature,
      specificEnthalpy: flashTank.inletWaterSpecificEnthalpy,
      specificEntropy: flashTank.inletWaterSpecificEntropy,
      quality: flashTank.inletWaterQuality,
      massFlow: flashTank.inletWaterMassFlow
    }
  }

  mediumPressureFlashTankOutletSteamHovered() {
    this.label = 'Medium Pressure Condensate Flashed';
    let flashTank: FlashTankOutput = this.outputData.mediumPressureCondensateFlashTank;
    this.setFlashTankSteam(flashTank);
  }

  highPressureFlashTankOutletSteamHovered() {
    this.label = 'High Pressure Condensate Flashed';
    let flashTank: FlashTankOutput = this.outputData.highPressureCondensateFlashTank;
    this.setFlashTankSteam(flashTank);
  }

  setFlashTankSteam(flashTank: FlashTankOutput) {
    this.steam = {
      pressure: flashTank.outletGasPressure,
      temperature: flashTank.outletGasTemperature,
      specificEnthalpy: flashTank.outletGasSpecificEnthalpy,
      specificEntropy: flashTank.outletGasSpecificEntropy,
      quality: flashTank.outletGasQuality,
      massFlow: flashTank.outletGasMassFlow
    }
  }
  highPressureCondensateHovered() {
    this.label = 'High Pressure Condensate';
    let condensate: SteamPropertiesOutput = this.outputData.highPressureCondensate;
    this.setSteamProperties(condensate);
  }
  mediumPressureCondensateHovered() {
    this.label = 'Medium Pressure Condensate';
    let condensate: SteamPropertiesOutput = this.outputData.mediumPressureCondensate;
    this.setSteamProperties(condensate);
  }
  lowPressureCondensateHovered() {
    this.label = 'Low Pressure Condensate';
    let condensate: SteamPropertiesOutput = this.outputData.lowPressureCondensate;
    this.setSteamProperties(condensate);
  }

  setSteamProperties(steamData: SteamPropertiesOutput | HeaderOutputObj) {
    this.steam = {
      pressure: steamData.pressure,
      temperature: steamData.temperature,
      specificEnthalpy: steamData.specificEnthalpy,
      specificEntropy: steamData.specificEntropy,
      quality: steamData.quality,
      massFlow: steamData.massFlow
    }
  }


  lowPressureProcessSteamInletHovered() {
    this.label = 'Low Pressure Process Steam';
    let header: HeaderOutputObj = this.outputData.lowPressureHeader;
    let processUsage: ProcessSteamUsage = this.outputData.lowPressureProcessUsage;
    this.setSteamProperties(header);
    this.steam.massFlow = processUsage.massFlow;
  }

  mediumPressureProcessSteamInletHovered() {
    this.label = 'Medium Pressure Process Steam';
    let header: HeaderOutputObj = this.outputData.mediumPressureHeader;
    let processUsage: ProcessSteamUsage = this.outputData.mediumPressureProcessUsage;
    this.setSteamProperties(header);
    this.steam.massFlow = processUsage.massFlow;

  }

  highPressureProcessSteamInletHovered() {
    this.label = 'High Pressure Process Steam';
    let header: HeaderOutputObj = this.outputData.highPressureHeader;
    let processUsage: ProcessSteamUsage = this.outputData.highPressureProcessUsage;
    this.setSteamProperties(header);
    this.steam.massFlow = processUsage.massFlow;
  }

  condensingTurbineOutletHovered() {
    this.label = 'Condensing Turbine Outlet';
    let turbine: TurbineOutput = this.outputData.condensingTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  condensingTurbineInletHovered() {
    this.label = 'Condensing Turbine Inlet';
    let turbine: TurbineOutput = this.outputData.condensingTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  mediumToLowTurbineOutletHovered() {
    this.label = 'Medium to Low Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.outputData.mediumToLowPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  mediumToLowTurbineInletHovered() {
    this.label = 'Medium to Low Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.outputData.mediumToLowPressureTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  highToLowTurbineOutletHovered() {
    this.label = 'High to Low Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.outputData.highToLowPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  highToLowTurbineInletHovered() {
    this.label = 'High to Low Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.outputData.highToLowPressureTurbine;
    this.setInletSteam(turbine, turbine.massFlow);
  }

  highToMediumTurbineOutletHovered() {
    this.label = 'High to Medium Pressure Turbine Outlet';
    let turbine: TurbineOutput = this.outputData.highPressureToMediumPressureTurbine;
    this.setOutletSteam(turbine, turbine.massFlow);
  }

  highToMediumTurbineInletHovered() {
    this.label = 'High to Medium Pressure Turbine Inlet';
    let turbine: TurbineOutput = this.outputData.highPressureToMediumPressureTurbine;
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
    let prv: PrvOutput = this.outputData.highToMediumPressurePRV;
    this.setFeedwaterProperties(prv);
  }

  lowPressurePRVFeedwaterHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Feedwater';
    } else {
      this.label = 'High to Low PRV Inlet';
    }
    let prv: PrvOutput = this.outputData.lowPressurePRV;
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
    let prv: PrvOutput = this.outputData.lowPressurePRV;
    this.setInletSteam(prv, prv.inletMassFlow);
  }

  highPressurePRVInletHovered() {
    let prv: PrvOutput;
    if (this.numberOfHeaders == 3) {
      this.label = 'High to Medium PRV Inlet';
      prv = this.outputData.highToMediumPressurePRV;
    } else {
      this.label = 'High to Low PRV Inlet';
      prv = this.outputData.lowPressurePRV;
    }
    this.setInletSteam(prv, prv.inletMassFlow);
  }

  lowPressurePRVOutletHovered() {
    if (this.numberOfHeaders == 3) {
      this.label = 'Medium to Low PRV Outlet';
    } else {
      this.label = 'High to Low PRV Outlet';
    }
    let prv: PrvOutput = this.outputData.lowPressurePRV;
    this.setOutletSteam(prv, prv.inletMassFlow);
  }

  mediumPressurePRVOutletHovered() {
    this.label = 'High to Medium PRV Outlet';
    let prv: PrvOutput = this.outputData.highToMediumPressurePRV;
    this.setOutletSteam(prv, prv.inletMassFlow);
  }

  boilerSteamHovered() {
    this.label = 'Boiler Steam';
    let boilerOutput: BoilerOutput = this.outputData.boilerOutput;
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
    if (this.hoveredProperty == 'boilerFeedwaterHovered') {
      this.label = 'Boiler Feedwater';
    } else if (this.hoveredProperty == 'feedwaterHovered') {
      this.label = 'Feedwater';
    }
    let boilerOutput: BoilerOutput = this.outputData.boilerOutput;
    this.setFeedwaterProperties(boilerOutput);
  }

  boilerBlowdownHovered() {
    this.label = 'Boiler Blowdown';
    let boilerOutput: BoilerOutput = this.outputData.boilerOutput;
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
