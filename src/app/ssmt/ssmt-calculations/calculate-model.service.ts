import { Injectable } from '@angular/core';
import { SteamService } from '../../calculator/steam/steam.service';
import { BoilerOutput, SteamPropertiesOutput, HeaderOutputObj, HeatLossOutput, PrvOutput, TurbineOutput, FlashTankOutput } from '../../shared/models/steam/steam-outputs';
import { Settings } from '../../shared/models/settings';
import { SSMTInputs } from '../../shared/models/steam/ssmt';

@Injectable()
export class CalculateModelService {
  settings: Settings;
  inputData: SSMTInputs;

  boiler: BoilerOutput;
  blowdown: SteamPropertiesOutput;
  feedwater: SteamPropertiesOutput;

  highPressureHeader: HeaderOutputObj;
  highToMediumPressurePRV: PrvOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highPressureFlashTank: FlashTankOutput;
  highPressureCondensate: SteamPropertiesOutput;

  mediumPressureHeader: HeaderOutputObj;
  mediumToLowPressurePRV: PrvOutput;

  constructor(private steamService: SteamService) { }

  calculateModel(_inputData: SSMTInputs, _settings: Settings) {
    this.inputData = _inputData;
    this.settings = _settings;
    //1. Calculate Boiler
    //1a. Model Boiler
    //TODO: Iterate Mass Flow
    this.calculateBoiler(1);
    //1b. Set Blowdown Properties
    this.setBoilerBlowdown();
    //1c. Set Feedwater Properties
    this.setBoilerFeedwater();

    //2. Calculate High Pressure Header
    //2a. Model High Pressure Header
    this.calculateHighPressureHeader();
    //2b. Calculate Heat Loss for Remaining Steam in High Pressure Header
    this.calculateHeatLossForHighPressureHeader();
    //2c. Calculate High Pressure Condensate
    this.calculateHighPressureCondensate();
    //3. Calculate Steam to Medium Pressure Values
    //3a. Calculate High to Medium PRV
    this.calculateHighToMediumPRV();
    //3b. Calculate High to Medium Steam Turbine
    this.calculateHighToMediumPressureSteamTurbine();
    //3c. Calculate High Pressure Flash Tank
    this.calculateHighCondensatePressureFlashTank();

    //4. Calculate Medium Pressure Header
    //4a. Model High Pressure Header
    //4b. Calculate Heat Loss for Remain Steam in Medium Pressure Header
    //4c. Calculate Medium Pressure Condensate

    //5. Calculate Steam to Low Pressure Values

    //6. Calculate Medium Pressure Header

    //7. Calculate Makeup Water and Condensate Details

    //8. Calculate Deaerator
  }

  //1a. Calculate Boiler
  calculateBoiler(_massFlow: number) {
    this.boiler = this.steamService.boiler(
      {
        steamPressure: this.inputData.headerInput.highPressure.pressure,
        blowdownRate: this.inputData.boilerInput.blowdownRate,
        steamMassFlow: _massFlow,
        thermodynamicQuantity: 0, //temperature
        quantityValue: this.inputData.boilerInput.steamTemperature,
        combustionEfficiency: this.inputData.boilerInput.combustionEfficiency,
        deaeratorPressure: this.inputData.boilerInput.deaeratorPressure
      },
      this.settings
    )
  }

  //1b. Set Boiler Blowdown
  setBoilerBlowdown() {
    this.blowdown = {
      pressure: this.boiler.blowdownPressure,
      temperature: this.boiler.blowdownTemperature,
      specificEnthalpy: this.boiler.blowdownSpecificEnthalpy,
      specificEntropy: this.boiler.blowdownSpecificEntropy,
      quality: this.boiler.blowdownQuality,
      specificVolume: this.boiler.blowdownVolume,
      massFlow: this.boiler.blowdownMassFlow,
      energyFlow: this.boiler.blowdownEnergyFlow
    }
  }

  //1c. Set Boiler Feedwater
  setBoilerFeedwater() {
    this.feedwater = {
      pressure: this.boiler.feedwaterPressure,
      temperature: this.boiler.feedwaterTemperature,
      specificEnthalpy: this.boiler.feedwaterSpecificEnthalpy,
      specificEntropy: this.boiler.feedwaterSpecificEntropy,
      quality: this.boiler.feedwaterQuality,
      specificVolume: this.boiler.feedwaterVolume,
      massFlow: this.boiler.feedwaterMassFlow,
      energyFlow: this.boiler.feedwaterEnergyFlow
    }
  }

  //2a. Calculate High Pressure Header
  calculateHighPressureHeader() {
    //notice .header at the end (need .header obj for highPressureHeader)
    this.highPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.highPressure.pressure,
        inlets: [
          {
            pressure: this.boiler.steamPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.boiler.steamSpecificEnthalpy,
            massFlow: this.boiler.steamMassFlow
          }
        ]
      },
      this.settings
    ).header;
  }

  //2b. Calculate Heat Loss for Remaining Steam in High Pressure Header
  calculateHeatLossForHighPressureHeader() {
    let highPressureHeaderHeatLoss: HeatLossOutput = this.steamService.heatLoss(
      {
        inletPressure: this.highPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.highPressureHeader.specificEnthalpy,
        inletMassFlow: this.highPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.highPressure.heatLoss
      },
      this.settings
    );
    this.highPressureHeader.remainingSteam = {
      pressure: highPressureHeaderHeatLoss.outletPressure,
      temperature: highPressureHeaderHeatLoss.outletTemperature,
      specificEnthalpy: highPressureHeaderHeatLoss.outletSpecificEnthalpy,
      specificEntropy: highPressureHeaderHeatLoss.outletSpecificEntropy,
      quality: highPressureHeaderHeatLoss.outletQuality,
      massFlow: highPressureHeaderHeatLoss.outletMassFlow,
      energyFlow: highPressureHeaderHeatLoss.outletEnergyFlow
    }
  }

  //2c. Calculate High Pressure Condensate
  calculateHighPressureCondensate() {
    let calculatedMassFlow: number = this.inputData.headerInput.highPressure.processSteamUsage * (this.inputData.headerInput.highPressure.condensationRecoveryRate / 100);
    this.highPressureCondensate = {
      pressure: this.blowdown.pressure,
      temperature: this.blowdown.temperature,
      specificEnthalpy: this.blowdown.specificEnthalpy,
      specificEntropy: this.blowdown.specificEntropy,
      quality: this.blowdown.quality,
      energyFlow: this.blowdown.energyFlow,
      specificVolume: this.blowdown.specificVolume,
      massFlow: calculatedMassFlow
    }
  }

  //3a. Calculate High to Medium PRV
  calculateHighToMediumPRV() {
    if (this.inputData.headerInput.mediumPressure.desuperheatSteamIntoNextHighest == true) {
      this.highToMediumPressurePRV = this.steamService.prvWithDesuperheating(
        {
          inletPressure: this.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: this.feedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: this.feedwater.specificEnthalpy,
          desuperheatingTemp: this.inputData.headerInput.mediumPressure.desuperheatSteamTemperature
        },
        this.settings
      );
    } else {
      this.highToMediumPressurePRV = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: this.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: this.highPressureHeader.remainingSteam.massFlow,
          outletPressure: this.inputData.headerInput.mediumPressure.pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        this.settings
      );
    }
  }

  //3b. Calculate High to Medium Steam Turbine
  calculateHighToMediumPressureSteamTurbine() {
    this.highPressureToMediumPressureTurbine = this.steamService.turbine(
      {
        solveFor: 0,
        inletPressure: this.highPressureHeader.remainingSteam.pressure,
        inletQuantity: 1,
        inletQuantityValue: this.highPressureHeader.remainingSteam.specificEnthalpy,
        turbineProperty: this.inputData.turbineInput.highToMediumTurbine.operationType,
        isentropicEfficiency: this.inputData.turbineInput.highToMediumTurbine.isentropicEfficiency,
        generatorEfficiency: this.inputData.turbineInput.highToMediumTurbine.generationEfficiency,
        massFlowOrPowerOut: 0, //mass flow
        outletSteamPressure: this.inputData.headerInput.mediumPressure.pressure,
        outletQuantity: 0,
        outletQuantityValue: 0
      },
      this.settings
    );
  }
  //3c. Calculate High Pressure Condensate Flash Tank
  calculateHighCondensatePressureFlashTank() {
    this.highPressureFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: this.highPressureCondensate.pressure,
        quantityValue: this.highPressureCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: this.highPressureCondensate.massFlow,
        tankPressure: this.inputData.headerInput.mediumPressure.pressure
      },
      this.settings
    )
  }

  //4a. Model Medium Pressure Header
  calculateMediumPressureHeader() {
    this.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: this.inputData.headerInput.mediumPressure.pressure,
        inlets: [
          {
            pressure: this.highToMediumPressurePRV.outletPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.highToMediumPressurePRV.outletSpecificEnthalpy,
            massFlow: this.highToMediumPressurePRV.outletMassFlow
          },
          {
            pressure: this.highPressureToMediumPressureTurbine.outletPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
            massFlow: this.highPressureToMediumPressureTurbine.massFlow
          },
          {
            pressure: this.highPressureFlashTank.outletGasPressure,
            thermodynamicQuantity: 1, //specificEnthalpy
            quantityValue: this.highPressureFlashTank.outletGasSpecificEnthalpy,
            massFlow: this.highPressureFlashTank.outletGasMassFlow
          }
        ]
      },
      this.settings).header;
  }
  //4b. Calculate Heat Loss for Remain Steam in Medium Pressure Header
  calculateHeatLossForMediumPressureHeader(){
    let mediumPressureHeatLoss: HeatLossOutput = this.steamService.heatLoss(
      {
        inletPressure: this.mediumPressureHeader.pressure,
        thermodynamicQuantity: 1, //specificEnthalpy
        quantityValue: this.mediumPressureHeader.specificEnthalpy,
        inletMassFlow: this.mediumPressureHeader.massFlow,
        percentHeatLoss: this.inputData.headerInput.mediumPressure.heatLoss
      },
      this.settings
    );
    this.highPressureHeader.remainingSteam = {
      pressure: mediumPressureHeatLoss.outletPressure,
      temperature: mediumPressureHeatLoss.outletTemperature,
      specificEnthalpy: mediumPressureHeatLoss.outletSpecificEnthalpy,
      specificEntropy: mediumPressureHeatLoss.outletSpecificEntropy,
      quality: mediumPressureHeatLoss.outletQuality,
      massFlow: mediumPressureHeatLoss.outletMassFlow,
      energyFlow: mediumPressureHeatLoss.outletEnergyFlow
    }
  }
  //4c. Calculate Medium Pressure Condensate
}
