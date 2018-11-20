import { Injectable } from '@angular/core';
import { ModelerUtilitiesService } from './modeler-utilities.service';
import { SSMTInputs, Header } from '../../shared/models/steam/ssmt';
import { SSMTOutput, BoilerOutput, HeaderOutputObj, SteamPropertiesOutput, PrvOutput } from '../../shared/models/steam/steam-outputs';
import { BalanceTurbinesService } from './balance-turbines.service';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class RunModelService {

  constructor(private modelerUtilitiesService: ModelerUtilitiesService, private balanceTurbinesService: BalanceTurbinesService, private steamService: SteamService) { }

  runModel(_additionalSteamFlow: number, _inputData: SSMTInputs, _ssmtOutputData: SSMTOutput, _settings: Settings, _steamProduction?: number): { adjustment: number, outputData: SSMTOutput } {
    let lowPressureHeaderInput: Header = _inputData.headerInput[2];
    let mediumPressureHeaderInput: Header = _inputData.headerInput[1];
    let highPressureHeaderInput: Header = _inputData.headerInput[0];

    let tmpSteamProduction: number;
    //1a. Estimate steam production
    if (_steamProduction) {
      tmpSteamProduction = _steamProduction;
    } else {
      tmpSteamProduction = highPressureHeaderInput.processSteamUsage + mediumPressureHeaderInput.processSteamUsage + lowPressureHeaderInput.processSteamUsage + _additionalSteamFlow + _ssmtOutputData.condensingTurbine.massFlow;
    }

    //1b. Adjust boiler model steam production, feedwater and blowdown massflows
    _ssmtOutputData.boilerOutput = this.updateBoilerModel(_ssmtOutputData.boilerOutput, tmpSteamProduction, _inputData, _settings);
    _ssmtOutputData = this.modelerUtilitiesService.setBlowdown(_ssmtOutputData);
    _ssmtOutputData = this.modelerUtilitiesService.setFeedwater(_ssmtOutputData);

    //1c. Model flash tank from boiler blowdown
    if (_inputData.boilerInput.blowdownFlashed) {
      _ssmtOutputData = this.updateBlowdownFlashTankModel(_ssmtOutputData, lowPressureHeaderInput, _settings)
    }

    //2. High Pressure Header
    //2a. update high pressure header
    _ssmtOutputData = this.updateHighPressureHeader(_ssmtOutputData, lowPressureHeaderInput, _settings);

    //2b.Adjust High Pressure Header Mass Flow by removing high pressure header steam usage
    _ssmtOutputData.highPressureHeader = this.adjustHighPressureHeaderMassFlow(_ssmtOutputData.highPressureHeader, highPressureHeaderInput);

    //2c. Evaluate turbine steam usage
    _ssmtOutputData = this.balanceTurbinesService.balanceTurbines(_inputData.turbineInput, _ssmtOutputData);
    _ssmtOutputData = this.adjustHighPressureTurbineSteamUsage(_ssmtOutputData, highPressureHeaderInput);

    //2d. Process High Pressure Header Condensate
    _ssmtOutputData = this.calculateHighPressureCondensate(_ssmtOutputData, highPressureHeaderInput, mediumPressureHeaderInput, _settings);
    if (highPressureHeaderInput.flashCondensateReturn) {
      //flash medium header input pressure or medium header output model pressure?
      _ssmtOutputData = this.flashHighPressureCondensate(_ssmtOutputData, mediumPressureHeaderInput, _settings);
    }
    //2e. Update high pressure to medium pressure header reducing value (PRV)
    _ssmtOutputData.highPressureToMediumPressurePrv = this.updateHighPressureToLowPressurePRV(_ssmtOutputData, mediumPressureHeaderInput, _settings);

    //3. Medium Pressure Header
    //3a. update medium pressure header
    _ssmtOutputData = this.updateMediumPressureHeader(_ssmtOutputData, mediumPressureHeaderInput, _settings);

    //3b.Adjust Medium Pressure Header Mass Flow by removing medium pressure header steam usage
    _ssmtOutputData.mediumPressureHeader = this.adjustMediumPressureHeaderSteamUsage(_ssmtOutputData.mediumPressureHeader, mediumPressureHeaderInput);

    //3c.set medium pressure to low pressure turbine inlet steam from medium pressure header and then balance turbine
    _ssmtOutputData = this.setMediumPressureToLowPressureTurbineInletSteam(_ssmtOutputData)
    _ssmtOutputData = this.balanceTurbinesService.balanceTurbines(_inputData.turbineInput, _ssmtOutputData);
    //update medium pressure header remaining steam after balancing
    _ssmtOutputData = this.adjustMediumPressureTurbineSteamUsage(_ssmtOutputData, mediumPressureHeaderInput);

    //3d. Process Medium Pressure Header Condensate
    _ssmtOutputData = this.calculateMediumPressureCondensate(_ssmtOutputData, mediumPressureHeaderInput, lowPressureHeaderInput, _settings);
    //flash condensate of mixture
    if (mediumPressureHeaderInput.flashCondensateIntoHeader) {
      _ssmtOutputData = this.flashMediumToLowPressureCondensate(_ssmtOutputData, lowPressureHeaderInput, _settings);
    }

    //3e. Update Medium Pressure to Low Pressure reducing value (PRV)
    _ssmtOutputData.mediumPressureToLowPressurePrv = this.updateMediumToLowPressurePRV(_ssmtOutputData, lowPressureHeaderInput, _settings);

    //4. Low Pressure Header
    //4a. Setup low pressure header
    _ssmtOutputData = this.updateLowPressureHeaderModel(_ssmtOutputData, lowPressureHeaderInput, _settings);

    //4b. Adjust Low Pressure Header Mass Flow by removing low pressure header steam usage
    _ssmtOutputData = this.adjustLowPressureHeaderSteamUsage(_ssmtOutputData, lowPressureHeaderInput);

    //4c. process low pressure header condensate
    _ssmtOutputData = this.calculateLowPressureCondensate(_ssmtOutputData, lowPressureHeaderInput, _settings);
    if (highPressureHeaderInput.flashCondensateReturn == true) {
      //flash low pressure condensate
      _ssmtOutputData = this.flashLowPressureCondensate(_ssmtOutputData, _inputData, _settings);
    } else {
      //dont flash set mass flow
      _ssmtOutputData.condensate.massFlow = _ssmtOutputData.condensingTurbine.massFlow;
    }

    //5. Determine Makeup Water Requirement
    //calculate makeup water mass flow
    _ssmtOutputData.makeupWater.massFlow = this.getMakeupWaterMassFlow(_ssmtOutputData, _inputData);

    //calculate makeup water and condensate properties (makeupWaterHeated in php)
    //start with makeup water properties
    _ssmtOutputData.makeupWaterAndCondensate = _ssmtOutputData.makeupWater;

    if (_inputData.boilerInput.preheatMakeupWater == true) {
      //inlet steam properties for heat exchanger from blowdown
      let blowdownInlet: SteamPropertiesOutput
      if (_inputData.boilerInput.blowdownFlashed) {
        //if blowdown is flashed then set properties to outlet liquid of flowdown flash tank
        blowdownInlet =
          {
            pressure: _ssmtOutputData.blowdownFlashTank.outletLiquidPressure,
            temperature: _ssmtOutputData.blowdownFlashTank.outletLiquidTemperature,
            specificEnthalpy: _ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEnthalpy,
            specificEntropy: _ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEntropy,
            quality: _ssmtOutputData.blowdownFlashTank.outletLiquidQuality,
            specificVolume: _ssmtOutputData.blowdownFlashTank.outletLiquidVolume,
            massFlow: _ssmtOutputData.blowdownFlashTank.outletLiquidMassFlow,
            energyFlow: _ssmtOutputData.blowdownFlashTank.outletLiquidEnergyFlow,
          }
      } else {
        //blowdown not flashed so just use properties from blowdown
        blowdownInlet = _ssmtOutputData.blowdown;
      }
      //Next you will have to call the "HeatExchanger"
      //it was added later and doesn't have a binding for me to do it hear in the desktop
      //the HeatExchanger has hotOutlet and coldOutlet steam properties
      //set the makeupWaterAndCondensate output to the coldOutlet properties
      //Would look something like this if it was available here..
      //let heatExchangerResults = HeatExchanger()
      //_ssmtOutputData.makeupWaterAndCondensate = heatExchangerResults.coldOutlet
    }

    //6. Model Deaerator
    // the daWaterFeed may need to be set to one of the output objects.
    //steam to dearator (daWaterFeed in php), header calcuator using:
    //input deaerator pressure
    //Array of:
    //_ssmtOutputData.makeupWaterAndCondensate 
    //_ssmtOutputData.condensate
    //_ssmtOutputData.turbineCondensateSteamCooled
    let daWaterFeed: SteamPropertiesOutput = this.steamService.header(
      {
        headerPressure: _inputData.boilerInput.deaeratorPressure,
        inlets: [
          {
            pressure: _ssmtOutputData.makeupWaterAndCondensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: _ssmtOutputData.makeupWaterAndCondensate.specificEnthalpy,
            massFlow: _ssmtOutputData.makeupWaterAndCondensate.massFlow
          },
          {
            pressure: _ssmtOutputData.condensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: _ssmtOutputData.condensate.specificEnthalpy,
            massFlow: _ssmtOutputData.condensate.massFlow
          },
          {
            pressure: _ssmtOutputData.turbineCondensateSteamCooled.pressure,
            thermodynamicQuantity: 1,
            quantityValue: _ssmtOutputData.turbineCondensateSteamCooled.specificEnthalpy,
            massFlow: _ssmtOutputData.turbineCondensateSteamCooled.massFlow
          }
        ]
      },
      _settings
    ).header.finalHeaderSteam;
    _ssmtOutputData.steamToDeaerator = _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow;
    _ssmtOutputData.deaeratorOutput = this.steamService.deaerator(
      {
        deaeratorPressure: _inputData.boilerInput.deaeratorPressure,
        ventRate: _inputData.boilerInput.deaeratorVentRate / 100,
        feedwaterMassFlow: _ssmtOutputData.feedwater.massFlow,
        waterPressure: daWaterFeed.pressure,
        waterThermodynamicQuantity: 1,
        waterQuantityValue: daWaterFeed.specificEnthalpy,
        steamPressure: _ssmtOutputData.lowPressureHeader.remainingSteam.pressure,
        steamThermodynamicQuantity: 1,
        steamQuantityValue: _ssmtOutputData.lowPressureHeader.remainingSteam.specificEnthalpy
      },
      _settings
    )

    //7. Calculate Forced Excess Steam, if positive: open vent

    let forcedExcessSteamMediumPressure: number = _ssmtOutputData.highPressureSteamGasToMediumPressure.massFlow - mediumPressureHeaderInput.processSteamUsage;

    let forcedExcessSteamLowPressure: number =
      _ssmtOutputData.mediumPressureSteamGasToLowPressure.massFlow
      + _ssmtOutputData.blowdownGasToLowPressure.massFlow
      - _ssmtOutputData.deaeratorOutput.inletSteamMassFlow
      - lowPressureHeaderInput.processSteamUsage;

    if (_inputData.turbineInput.highToMediumTurbine.useTurbine) {
      if (_inputData.turbineInput.highToMediumTurbine.operationType != 2) {
        //if operation type isn't "Balance Header"
        forcedExcessSteamMediumPressure = forcedExcessSteamMediumPressure + _inputData.turbineInput.highToLowTurbine.operationValue1;
      }
    }

    if (_inputData.turbineInput.mediumToLowTurbine.useTurbine) {
      if (_inputData.turbineInput.mediumToLowTurbine.operationType != 2) {
        forcedExcessSteamMediumPressure = forcedExcessSteamMediumPressure - _inputData.turbineInput.mediumToLowTurbine.operationValue1;
        forcedExcessSteamLowPressure = forcedExcessSteamLowPressure + _inputData.turbineInput.mediumToLowTurbine.operationValue1;
      }
    }

    if (_inputData.turbineInput.highToLowTurbine.useTurbine) {
      if (_inputData.turbineInput.highToLowTurbine.operationType != 2) {
        forcedExcessSteamLowPressure = forcedExcessSteamLowPressure + _inputData.turbineInput.highToLowTurbine.operationValue1;
      }
    }


    if (forcedExcessSteamMediumPressure > 0) {
      let forcedSteamThroughTurbine = 0;
      let forcedSteamThroughPRV = forcedExcessSteamMediumPressure;
      //operationType = "Balance Headers"
      if (_inputData.turbineInput.mediumToLowTurbine.useTurbine && _inputData.turbineInput.mediumToLowTurbine.operationType == 2) {
        forcedSteamThroughTurbine = forcedExcessSteamMediumPressure;
        forcedSteamThroughPRV = 0;
      }
      //operationType == "Power Range" or "Flow Range"
      if (_inputData.turbineInput.mediumToLowTurbine.useTurbine && _inputData.turbineInput.mediumToLowTurbine.operationType == 3 || _inputData.turbineInput.mediumToLowTurbine.operationType == 4) {
        //max flow - min flow
        let forcedPrvMediumPressureLowPressureRemaining: number = forcedExcessSteamMediumPressure - _inputData.turbineInput.mediumToLowTurbine.operationValue2 + _inputData.turbineInput.mediumToLowTurbine.operationValue1;
        if (forcedPrvMediumPressureLowPressureRemaining > 0) {
          forcedSteamThroughTurbine = _inputData.turbineInput.mediumToLowTurbine.operationValue2 - _inputData.turbineInput.mediumToLowTurbine.operationValue1
          forcedSteamThroughPRV = forcedExcessSteamMediumPressure - forcedSteamThroughTurbine;
        } else {
          forcedSteamThroughTurbine = forcedExcessSteamMediumPressure;
          forcedSteamThroughPRV = 0;
        }
      }
      //operationType == "Power Generation" or "Steam Flow"
      if (_inputData.turbineInput.mediumToLowTurbine.useTurbine && _inputData.turbineInput.mediumToLowTurbine.operationType == 0 || _inputData.turbineInput.mediumToLowTurbine.operationType == 1) {
        forcedSteamThroughTurbine = 0;
        forcedSteamThroughPRV = forcedExcessSteamMediumPressure;
      }

      if (forcedSteamThroughPRV > 0 && lowPressureHeaderInput.desuperheatSteamIntoNextHighest == true) {
        let forcedPrvMediumPressureLowPressureSteam: SteamPropertiesOutput = _ssmtOutputData.mediumPressureHeader.remainingSteam;
        //set mass flow
        forcedPrvMediumPressureLowPressureSteam.massFlow = forcedSteamThroughPRV;
        let forcedMediumPressureLowPressurePRV = this.steamService.prvWithDesuperheating(
          {
            inletPressure: forcedPrvMediumPressureLowPressureSteam.pressure,
            thermodynamicQuantity: 1,
            quantityValue: forcedPrvMediumPressureLowPressureSteam.specificEnthalpy,
            inletMassFlow: forcedPrvMediumPressureLowPressureSteam.massFlow,
            outletPressure: lowPressureHeaderInput.pressure,
            feedwaterPressure: _ssmtOutputData.feedwater.pressure,
            feedwaterThermodynamicQuantity: 1,
            feedwaterQuantityValue: _ssmtOutputData.feedwater.specificEnthalpy,
            desuperheatingTemp: lowPressureHeaderInput.desuperheatSteamTemperature
          },
          _settings
        );
        forcedSteamThroughPRV = forcedMediumPressureLowPressurePRV.outletMassFlow;
      }
      forcedExcessSteamLowPressure = forcedExcessSteamLowPressure + forcedSteamThroughTurbine + forcedSteamThroughPRV;
    }

    let lowPressureSteamVent: number = 0;
    if (forcedExcessSteamLowPressure > 0) {
      lowPressureSteamVent = forcedExcessSteamLowPressure;
    }

    _ssmtOutputData.lowPressureSteamNeed =
      lowPressureHeaderInput.processSteamUsage
      + _ssmtOutputData.deaeratorOutput.inletSteamMassFlow
      - _ssmtOutputData.mediumPressureSteamGasToLowPressure.massFlow
      - _ssmtOutputData.blowdownGasToLowPressure.massFlow;

    if (forcedExcessSteamMediumPressure > _ssmtOutputData.lowPressureSteamNeed) {
      _ssmtOutputData.lowPressureSteamNeed = forcedExcessSteamMediumPressure;
    }

    _ssmtOutputData = this.balanceTurbinesService.balanceTurbines(_inputData.turbineInput, _ssmtOutputData);

    _ssmtOutputData.lowPressurePRVneed = _ssmtOutputData.mediumPressureSteamNeed - _ssmtOutputData.highPressureToLowPressureTurbine.massFlow - _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow;
    //UNUSED
    //let remainingSteam: number = _ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow - _ssmtOutputData.lowPressurePRVneed;

    let lowPressureBalance: number =
      lowPressureHeaderInput.processSteamUsage
      + _ssmtOutputData.deaeratorOutput.inletSteamMassFlow
      - _ssmtOutputData.mediumPressureSteamGasToLowPressure.massFlow
      - _ssmtOutputData.blowdownGasToLowPressure.massFlow
      - _ssmtOutputData.highPressureToLowPressureTurbine.massFlow
      - _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow
      - _ssmtOutputData.mediumPressureToLowPressurePrv.outletMassFlow
      + lowPressureSteamVent;

    let daSteamDifference: number = _ssmtOutputData.deaeratorOutput.inletSteamMassFlow - _ssmtOutputData.steamToDeaerator;

    if (lowPressureBalance > 0) {
      daSteamDifference = daSteamDifference + lowPressureBalance;
    }
    _ssmtOutputData.ventedSteam = _ssmtOutputData.lowPressureHeader.finalHeaderSteam;
    _ssmtOutputData.ventedSteam.massFlow = _ssmtOutputData.lowPressureSteamVent;
    //next in the php there is a set of calculations for a "steamRequirements" array but none of it seems to be used.
    //some of this section is used to logging

    return { outputData: _ssmtOutputData, adjustment: daSteamDifference }
  }

  //****** BOILER FUNCTIONS *********/
  updateBoilerModel(_currentBoilerModel: BoilerOutput, _newMassFlow: number, _inputData: SSMTInputs, _settings: Settings): BoilerOutput {
    //I used the input data where there wasn't corresponding data in the BoilerOutput
    //use enthalpy
    return this.steamService.boiler({
      deaeratorPressure: _inputData.boilerInput.deaeratorPressure,
      combustionEfficiency: _inputData.boilerInput.combustionEfficiency,
      blowdownRate: _inputData.boilerInput.blowdownRate,
      steamPressure: _currentBoilerModel.steamPressure,
      thermodynamicQuantity: 1, //enthalpy
      quantityValue: _currentBoilerModel.steamSpecificEnthalpy,
      steamMassFlow: _newMassFlow
    },
      _settings)
  }

  updateBlowdownFlashTankModel(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    //use the ssmtOutputData.highPressureHeader instead of pressure from input data here?
    _ssmtOutputData = this.modelerUtilitiesService.setBlowdownFlashTankModel(_ssmtOutputData, _lowPressureHeaderInput.pressure, _settings);
    _ssmtOutputData.blowdownGasToLowPressure = {
      pressure: _ssmtOutputData.blowdownFlashTank.outletGasPressure,
      temperature: _ssmtOutputData.blowdownFlashTank.outletGasTemperature,
      specificEnthalpy: _ssmtOutputData.blowdownFlashTank.outletGasSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.blowdownFlashTank.outletGasSpecificEntropy,
      quality: _ssmtOutputData.blowdownFlashTank.outletGasQuality,
      massFlow: _ssmtOutputData.blowdownFlashTank.outletGasMassFlow,
      energyFlow: _ssmtOutputData.blowdownFlashTank.outletGasEnergyFlow,
    }
    _ssmtOutputData.blowdownFlashLiquid = {
      pressure: _ssmtOutputData.blowdownFlashTank.outletLiquidPressure,
      temperature: _ssmtOutputData.blowdownFlashTank.outletLiquidTemperature,
      specificEnthalpy: _ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.blowdownFlashTank.outletLiquidSpecificEntropy,
      quality: _ssmtOutputData.blowdownFlashTank.outletLiquidQuality,
      massFlow: _ssmtOutputData.blowdownFlashTank.outletLiquidMassFlow,
      energyFlow: _ssmtOutputData.blowdownFlashTank.outletLiquidEnergyFlow
    }
    return _ssmtOutputData;
  }
  //****** HIGH PRESSURE HEADER FUNCTIONS *********/
  updateHighPressureHeader(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.highPressureHeader = this.steamService.header(
      {
        headerPressure: _lowPressureHeaderInput.pressure,
        inlets: [{
          pressure: _ssmtOutputData.boilerOutput.steamPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.boilerOutput.steamSpecificEnthalpy,
          massFlow: _ssmtOutputData.boilerOutput.steamMassFlow
        }
        ]
      },
      _settings
    ).header;
    _ssmtOutputData.highPressureHeader = this.modelerUtilitiesService.setHeatLoss(_ssmtOutputData.highPressureHeader, _lowPressureHeaderInput.heatLoss, _settings);
    return _ssmtOutputData;
  }

  adjustHighPressureHeaderMassFlow(_highPressureHeaderOutput: HeaderOutputObj, _highPressureHeaderInput: Header): HeaderOutputObj {
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (_ssmtOutputData.highPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    _highPressureHeaderOutput.remainingSteam.massFlow = _highPressureHeaderOutput.remainingSteam.massFlow - _highPressureHeaderInput.processSteamUsage;
    _highPressureHeaderOutput.massFlow = _highPressureHeaderOutput.remainingSteam.massFlow;
    return _highPressureHeaderOutput;
  }

  adjustHighPressureTurbineSteamUsage(_ssmtOutputData: SSMTOutput, _highPressureHeaderInput: Header): SSMTOutput {
    //subtract condensing turbine
    _ssmtOutputData.highPressureHeader.remainingSteam.massFlow = _ssmtOutputData.highPressureHeader.remainingSteam.massFlow - _ssmtOutputData.condensingTurbine.massFlow;
    //subtract high to low pressure turbine
    _ssmtOutputData.highPressureHeader.remainingSteam.massFlow = _ssmtOutputData.highPressureHeader.remainingSteam.massFlow - _ssmtOutputData.highPressureToLowPressureTurbine.massFlow;
    //subtract high to medium pressure
    _ssmtOutputData.highPressureHeader.remainingSteam.massFlow = _ssmtOutputData.highPressureHeader.remainingSteam.massFlow - _ssmtOutputData.highPressureToMediumPressureTurbine.massFlow;
    //update header mass flows
    //I'm not sure we need two seperate variables "highPressureHeader" and "highPressureHeaderSteam" but that's what php has
    _ssmtOutputData.highPressureHeader.massFlow = _ssmtOutputData.highPressureHeader.remainingSteam.massFlow;
    _ssmtOutputData.highPressureHeaderSteam = _ssmtOutputData.highPressureHeader.remainingSteam;
    _ssmtOutputData.highPressureHeaderSteam.massFlow = _highPressureHeaderInput.processSteamUsage;
    return _ssmtOutputData;
  }

  calculateHighPressureCondensate(_ssmtOutputData: SSMTOutput, _highPressureHeaderInput: Header, _mediumPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.initialHighPressureCondensate.massFlow = _highPressureHeaderInput.processSteamUsage * (_highPressureHeaderInput.condensationRecoveryRate / 100);
    _ssmtOutputData.finalHighPressureCondensate = _ssmtOutputData.initialHighPressureCondensate;
    return _ssmtOutputData;
  }

  flashHighPressureCondensate(_ssmtOutputData: SSMTOutput, _mediumPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.condensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: _ssmtOutputData.finalHighPressureCondensate.pressure,
        quantityValue: _ssmtOutputData.finalHighPressureCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: _ssmtOutputData.finalHighPressureCondensate.massFlow,
        tankPressure: _mediumPressureHeaderInput.pressure
      },
      _settings
    );
    _ssmtOutputData.highPressureSteamGasToMediumPressure = {
      pressure: _ssmtOutputData.condensateFlashTank.outletGasPressure,
      temperature: _ssmtOutputData.condensateFlashTank.outletGasTemperature,
      specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
      quality: _ssmtOutputData.condensateFlashTank.outletGasQuality,
      massFlow: _ssmtOutputData.condensateFlashTank.outletGasMassFlow,
      energyFlow: _ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
    }
    _ssmtOutputData.finalHighPressureCondensate = {
      pressure: _ssmtOutputData.condensateFlashTank.outletLiquidPressure,
      temperature: _ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
      specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
      quality: _ssmtOutputData.condensateFlashTank.outletLiquidQuality,
      massFlow: _ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
      energyFlow: _ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
    }
    return _ssmtOutputData;
  }

  updateHighPressureToLowPressurePRV(_ssmtOutputData: SSMTOutput, _mediumPressureHeaderInput: Header, _settings): PrvOutput {
    if (_mediumPressureHeaderInput.desuperheatSteamIntoNextHighest) {
      //medium pressure input or medium pressure header in ouput?
      return this.steamService.prvWithDesuperheating(
        {
          inletPressure: _ssmtOutputData.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: _ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: _ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
          outletPressure: _mediumPressureHeaderInput.pressure,
          feedwaterPressure: _ssmtOutputData.feedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: _ssmtOutputData.feedwater.specificEnthalpy,
          desuperheatingTemp: _mediumPressureHeaderInput.desuperheatSteamTemperature
        },
        _settings
      );
    } else {
      //medium pressure input or medium pressure header in ouput?
      //undefined values are unused in this calc
      return this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: _ssmtOutputData.highPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: _ssmtOutputData.highPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: _ssmtOutputData.highPressureHeader.remainingSteam.massFlow,
          outletPressure: _mediumPressureHeaderInput.pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        _settings
      );
    }
  }

  //****** MEDIUM PRESSURE HEADER FUNCTIONS *********/
  updateMediumPressureHeader(_ssmtOutputData: SSMTOutput, _mediumPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.mediumPressureHeader = this.steamService.header(
      {
        headerPressure: _mediumPressureHeaderInput.pressure,
        inlets: [{
          pressure: _ssmtOutputData.highPressureToMediumPressurePrv.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.highPressureToMediumPressurePrv.outletSpecificEnthalpy,
          massFlow: _ssmtOutputData.highPressureToMediumPressurePrv.outletMassFlow
        },
        {
          pressure: _ssmtOutputData.highPressureSteamGasToMediumPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.highPressureSteamGasToMediumPressure.specificEnthalpy,
          massFlow: _ssmtOutputData.highPressureSteamGasToMediumPressure.massFlow
        },
        {
          pressure: _ssmtOutputData.highPressureToMediumPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.highPressureToMediumPressureTurbine.outletSpecificEnthalpy,
          massFlow: _ssmtOutputData.highPressureToMediumPressureTurbine.massFlow
        }
        ]
      },
      _settings
    ).header;
    _ssmtOutputData.mediumPressureHeader = this.modelerUtilitiesService.setHeatLoss(_ssmtOutputData.mediumPressureHeader, _mediumPressureHeaderInput.heatLoss, _settings);
    return _ssmtOutputData;
  }

  adjustMediumPressureHeaderSteamUsage(_mediumPressureHeaderOutput: HeaderOutputObj, _mediumPressureHeaderInput: Header): HeaderOutputObj {
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (_ssmtOutputData.mediumPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    _mediumPressureHeaderOutput.remainingSteam.massFlow = _mediumPressureHeaderOutput.remainingSteam.massFlow - _mediumPressureHeaderInput.processSteamUsage;
    _mediumPressureHeaderOutput.massFlow = _mediumPressureHeaderOutput.remainingSteam.massFlow;
    return _mediumPressureHeaderOutput;
  }

  setMediumPressureToLowPressureTurbineInletSteam(_ssmtOutputData: SSMTOutput): SSMTOutput {
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletEnergyFlow = _ssmtOutputData.mediumPressureHeader.remainingSteam.energyFlow;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletPressure = _ssmtOutputData.mediumPressureHeader.remainingSteam.pressure;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletQuality = _ssmtOutputData.mediumPressureHeader.remainingSteam.quality;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletSpecificEnthalpy = _ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletSpecificEntropy = _ssmtOutputData.mediumPressureHeader.remainingSteam.specificEntropy;
    _ssmtOutputData.mediumPressureToLowPressureTurbine.inletTemperature = _ssmtOutputData.mediumPressureHeader.remainingSteam.temperature;
    return _ssmtOutputData;
  }

  adjustMediumPressureTurbineSteamUsage(_ssmtOutputData: SSMTOutput, _mediumPressureHeaderInput: Header): SSMTOutput {
    //remove mass flow from header into medium to low turbine
    _ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow = _ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow - _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow;
    _ssmtOutputData.mediumPressureSteamNeed = _mediumPressureHeaderInput.processSteamUsage + _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow - _ssmtOutputData.highPressureSteamGasToMediumPressure.massFlow;
    //if there is inlet mass flow update steam need
    if (_ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow) {
      _ssmtOutputData.mediumPressureSteamNeed = _ssmtOutputData.mediumPressureSteamNeed + _ssmtOutputData.mediumPressureToLowPressurePrv.inletMassFlow;
    }
    //update header steam values
    _ssmtOutputData.mediumPressureHeaderSteam = _ssmtOutputData.mediumPressureHeader.remainingSteam;
    _ssmtOutputData.mediumPressureHeaderSteam.massFlow = _mediumPressureHeaderInput.processSteamUsage;
    return _ssmtOutputData;
  }


  calculateMediumPressureCondensate(_ssmtOutputData: SSMTOutput, _mediumPressureHeaderInput: Header, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    //set mass flow
    _ssmtOutputData.intitialMediumPressureCondensate.massFlow = _mediumPressureHeaderInput.processSteamUsage * (_mediumPressureHeaderInput.condensationRecoveryRate / 100);
    //calculate high and low steam mixture
    _ssmtOutputData.finalMediumPressureCondensate = this.steamService.header(
      {
        headerPressure: _mediumPressureHeaderInput.pressure,
        inlets: [{
          pressure: _ssmtOutputData.finalHighPressureCondensate.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.finalHighPressureCondensate.specificEnthalpy,
          massFlow: _ssmtOutputData.finalHighPressureCondensate.massFlow
        },
        {
          pressure: _ssmtOutputData.intitialMediumPressureCondensate.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.intitialMediumPressureCondensate.specificEnthalpy,
          massFlow: _ssmtOutputData.intitialMediumPressureCondensate.massFlow
        }
        ]
      },
      _settings
    ).header;
    return _ssmtOutputData;
  }

  flashMediumToLowPressureCondensate(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.mediumPressureCondensateFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: _ssmtOutputData.finalMediumPressureCondensate.pressure,
        quantityValue: _ssmtOutputData.finalMediumPressureCondensate.specificEnthalpy,
        thermodynamicQuantity: 1,
        inletWaterMassFlow: _ssmtOutputData.finalMediumPressureCondensate.massFlow,
        tankPressure: _lowPressureHeaderInput.pressure
      },
      _settings
    );
    _ssmtOutputData.mediumPressureSteamGasToLowPressure = {
      pressure: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasPressure,
      temperature: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasTemperature,
      specificEnthalpy: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasSpecificEntropy,
      quality: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasQuality,
      massFlow: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasMassFlow,
      energyFlow: _ssmtOutputData.mediumPressureCondensateFlashTank.outletGasEnergyFlow
    }
    _ssmtOutputData.finalHighPressureCondensate = {
      pressure: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidPressure,
      temperature: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidTemperature,
      specificEnthalpy: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidSpecificEntropy,
      quality: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidQuality,
      massFlow: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidMassFlow,
      energyFlow: _ssmtOutputData.mediumPressureCondensateFlashTank.outletLiquidEnergyFlow
    }
    return _ssmtOutputData;
  }

  updateMediumToLowPressurePRV(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): PrvOutput {
    if (_lowPressureHeaderInput.desuperheatSteamIntoNextHighest) {
      _ssmtOutputData.mediumPressureToLowPressurePrv = this.steamService.prvWithDesuperheating(
        {
          inletPressure: _ssmtOutputData.mediumPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: _ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: _ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow,
          outletPressure: _lowPressureHeaderInput.pressure,
          feedwaterPressure: _ssmtOutputData.feedwater.pressure,
          feedwaterThermodynamicQuantity: 1,//1 is enthalpy
          feedwaterQuantityValue: _ssmtOutputData.feedwater.specificEnthalpy,
          desuperheatingTemp: _lowPressureHeaderInput.desuperheatSteamTemperature
        },
        _settings
      );
    } else {
      _ssmtOutputData.mediumPressureToLowPressurePrv = this.steamService.prvWithoutDesuperheating(
        {
          inletPressure: _ssmtOutputData.mediumPressureHeader.remainingSteam.pressure,
          thermodynamicQuantity: 1,//1 is enthalpy
          quantityValue: _ssmtOutputData.mediumPressureHeader.remainingSteam.specificEnthalpy,
          inletMassFlow: _ssmtOutputData.mediumPressureHeader.remainingSteam.massFlow,
          outletPressure: _lowPressureHeaderInput.pressure,
          feedwaterPressure: undefined,
          feedwaterThermodynamicQuantity: undefined,
          feedwaterQuantityValue: undefined,
          desuperheatingTemp: undefined
        },
        _settings
      );
    }
    return _ssmtOutputData.mediumPressureToLowPressurePrv;
  }

  //****** LOW PRESSURE HEADER FUNCTIONS *********/
  updateLowPressureHeaderModel(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.lowPressureHeader = this.steamService.header(
      {
        headerPressure: _lowPressureHeaderInput.pressure,
        inlets: [{
          pressure: _ssmtOutputData.mediumPressureToLowPressurePrv.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.mediumPressureToLowPressurePrv.outletSpecificEnthalpy,
          massFlow: _ssmtOutputData.mediumPressureToLowPressurePrv.outletMassFlow
        },
        {
          pressure: _ssmtOutputData.mediumPressureSteamGasToLowPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.mediumPressureSteamGasToLowPressure.specificEnthalpy,
          massFlow: _ssmtOutputData.mediumPressureSteamGasToLowPressure.massFlow
        },
        {
          pressure: _ssmtOutputData.blowdownGasToLowPressure.pressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.blowdownGasToLowPressure.specificEnthalpy,
          massFlow: _ssmtOutputData.blowdownGasToLowPressure.massFlow
        },
        {
          pressure: _ssmtOutputData.highPressureToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.highPressureToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: _ssmtOutputData.highPressureToLowPressureTurbine.massFlow
        },
        {
          pressure: _ssmtOutputData.mediumPressureToLowPressureTurbine.outletPressure,
          thermodynamicQuantity: 1,
          quantityValue: _ssmtOutputData.mediumPressureToLowPressureTurbine.outletSpecificEnthalpy,
          massFlow: _ssmtOutputData.mediumPressureToLowPressureTurbine.massFlow
        }
        ]
      },
      _settings
    ).header;
    //setup heat loss values
    _ssmtOutputData.lowPressureHeader = this.modelerUtilitiesService.setHeatLoss(_ssmtOutputData.lowPressureHeader, _lowPressureHeaderInput.heatLoss, _settings);
    //low pressure steam vent may come from deaerator "Vented Steam"
    _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow = _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow - _ssmtOutputData.deaeratorOutput.ventedSteamMassFlow;
    return _ssmtOutputData;
  }

  adjustLowPressureHeaderSteamUsage(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header): SSMTOutput {
    //no idea what the fixed usage stuff is..
    // if (this.energyUsageFixed) {
    //   this.highPressureSteamUsage = this.setSetEnergyUsageHP * 100 / (_ssmtOutputData.mediumPressureHeader.re.outletSpecificEnthalpy - this.highPressureSaturatedLiquidEnthalpy);
    // }
    _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow = _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow - _lowPressureHeaderInput.processSteamUsage;
    _ssmtOutputData.lowPressureHeader.massFlow = _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow;

    _ssmtOutputData.lowPressureHeaderSteam = _ssmtOutputData.lowPressureHeader.remainingSteam;
    _ssmtOutputData.lowPressureHeaderSteam.massFlow = _lowPressureHeaderInput.processSteamUsage;
    return _ssmtOutputData;
  }

  calculateLowPressureCondensate(_ssmtOutputData: SSMTOutput, _lowPressureHeaderInput: Header, _settings: Settings): SSMTOutput {
    _ssmtOutputData.initialLowPressureCondensate.massFlow = _lowPressureHeaderInput.processSteamUsage * (_lowPressureHeaderInput.condensationRecoveryRate / 100)
    _ssmtOutputData.finalLowPressureCondensate = this.steamService.header(
      {
        headerPressure: _lowPressureHeaderInput.pressure,
        inlets: [
          {
            pressure: _ssmtOutputData.finalMediumPressureCondensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: _ssmtOutputData.finalMediumPressureCondensate.specificEnthalpy,
            massFlow: _ssmtOutputData.finalMediumPressureCondensate.massFlow
          },
          {
            pressure: _ssmtOutputData.initialLowPressureCondensate.pressure,
            thermodynamicQuantity: 1,
            quantityValue: _ssmtOutputData.initialLowPressureCondensate.specificEnthalpy,
            massFlow: _ssmtOutputData.initialLowPressureCondensate.massFlow
          },
        ]
      }
      , _settings).header;

    _ssmtOutputData.inititialReturnCondensate.massFlow = _ssmtOutputData.finalLowPressureCondensate.massFlow;
    return _ssmtOutputData;
  }

  flashLowPressureCondensate(_ssmtOutputData: SSMTOutput, _inputData: SSMTInputs, _settings): SSMTOutput {
    _ssmtOutputData.condensateFlashTank = this.steamService.flashTank({
      inletWaterPressure: _ssmtOutputData.inititialReturnCondensate.pressure,
      quantityValue: _ssmtOutputData.inititialReturnCondensate.specificEnthalpy,
      thermodynamicQuantity: 1,
      inletWaterMassFlow: _ssmtOutputData.inititialReturnCondensate.massFlow,
      tankPressure: _inputData.boilerInput.deaeratorPressure
    },
      _settings)
    //gas generated from flash tank (gas)
    _ssmtOutputData.condensateReturnVent = {
      pressure: _ssmtOutputData.condensateFlashTank.outletGasPressure,
      temperature: _ssmtOutputData.condensateFlashTank.outletGasTemperature,
      specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.condensateFlashTank.outletGasSpecificEntropy,
      quality: _ssmtOutputData.condensateFlashTank.outletGasQuality,
      massFlow: _ssmtOutputData.condensateFlashTank.outletGasMassFlow,
      energyFlow: _ssmtOutputData.condensateFlashTank.outletGasEnergyFlow
    };
    //condensate after flashed (liquid)
    _ssmtOutputData.condensate = {
      pressure: _ssmtOutputData.condensateFlashTank.outletLiquidPressure,
      temperature: _ssmtOutputData.condensateFlashTank.outletLiquidTemperature,
      specificEnthalpy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.condensateFlashTank.outletLiquidSpecificEntropy,
      quality: _ssmtOutputData.condensateFlashTank.outletLiquidQuality,
      massFlow: _ssmtOutputData.condensateFlashTank.outletLiquidMassFlow,
      energyFlow: _ssmtOutputData.condensateFlashTank.outletLiquidEnergyFlow
    };
    return _ssmtOutputData;
  }

  //get makeup water flow
  getMakeupWaterMassFlow(_ssmtOutputData: SSMTOutput, _inputData: SSMTInputs) {
    //makeupWaterMassFlow = (fedwater mass flow + flow through PRV) * (1 + deareator vent rate / 100) - (condensate mass flow + low pressure header remaining steam flow + condensing turbine cooled steam mass flow);
    let makeupWaterMassFlow: number =
      (_ssmtOutputData.feedwater.massFlow + _ssmtOutputData.highPressureToMediumPressurePrv.outletMassFlow + _ssmtOutputData.mediumPressureToLowPressurePrv.outletMassFlow)
      * (1 + _inputData.boilerInput.deaeratorVentRate / 100)
      - (_ssmtOutputData.condensate.massFlow + _ssmtOutputData.lowPressureHeader.remainingSteam.massFlow + _ssmtOutputData.turbineCondensateSteamCooled.massFlow);
    return makeupWaterMassFlow;
  }

}
