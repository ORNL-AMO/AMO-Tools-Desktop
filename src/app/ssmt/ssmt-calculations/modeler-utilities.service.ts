import { Injectable } from '@angular/core';
import { BoilerOutput, SSMTOutput, HeaderOutputObj } from '../../shared/models/steam/steam-outputs';
import { SteamService } from '../../calculator/steam/steam.service';
import { Settings } from '../../shared/models/settings';

@Injectable()
export class ModelerUtilitiesService {

  constructor(private steamService: SteamService) { }

  setBlowdown(_ssmtOutputData: SSMTOutput): SSMTOutput {
    //im not sure this is correct but it's what the php has
    // this.blowdown = this.steamService.steamProperties(
    //   {
    //     pressure: highPressureHeaderInput.pressure,
    //     thermodynamicQuantity: 3,
    //     quantityValue: 0
    //   },
    //   this._settings
    // )
    //may be this: using the boilerModel outputs
    _ssmtOutputData.blowdown = {
      pressure: _ssmtOutputData.boilerOutput.blowdownPressure,
      temperature: _ssmtOutputData.boilerOutput.blowdownTemperature,
      specificEnthalpy: _ssmtOutputData.boilerOutput.blowdownSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.boilerOutput.blowdownSpecificEntropy,
      quality: _ssmtOutputData.boilerOutput.blowdownQuality,
      massFlow: _ssmtOutputData.boilerOutput.blowdownMassFlow,
      energyFlow: _ssmtOutputData.boilerOutput.blowdownEnergyFlow,
    }
    return _ssmtOutputData;
  }

  setBlowdownFlashTankModel(_ssmtOutputData: SSMTOutput, _tankPressure: number, _settings: Settings): SSMTOutput {
    //tankPressure = lowHeaderPressure
    _ssmtOutputData.blowdownFlashTank = this.steamService.flashTank(
      {
        inletWaterPressure: _ssmtOutputData.blowdown.pressure,
        thermodynamicQuantity: 3,
        quantityValue: _ssmtOutputData.blowdown.quality,
        inletWaterMassFlow: _ssmtOutputData.blowdown.massFlow,
        tankPressure: _tankPressure
      },
      _settings
    )
    //previous versions initial pass through
    // this.ssmtOutputData.blowdownFlashTank = this.steamService.flashTank(
    //   {
    //     inletWaterPressure: highPressureHeaderInput.pressure,
    //     thermodynamicQuantity: 3,
    //     quantityValue: 0,
    //     inletWaterMassFlow: this.ssmtOutputData.boilerOutput.blowdownMassFlow,
    //     tankPressure: lowPressureHeaderInput.pressure
    //   },
    //   this._settings
    // )
    return _ssmtOutputData;
  }

  setHeatLoss(_header: HeaderOutputObj, _heatLossPercent: number, _settings: Settings): HeaderOutputObj {
    let tmpHeatLoss = this.steamService.heatLoss(
      {
        inletPressure: _header.pressure,
        thermodynamicQuantity: 1,
        quantityValue: _header.specificEnthalpy,
        inletMassFlow: _header.massFlow,
        percentHeatLoss: _heatLossPercent
      },
      _settings
    );
    _header.remainingSteam = {
      pressure: tmpHeatLoss.outletPressure,
      temperature: tmpHeatLoss.outletTemperature,
      specificEnthalpy: tmpHeatLoss.outletSpecificEnthalpy,
      specificEntropy: tmpHeatLoss.outletSpecificEntropy,
      quality: tmpHeatLoss.outletQuality,
      massFlow: tmpHeatLoss.outletMassFlow,
      energyFlow: tmpHeatLoss.outletEnergyFlow,
    }
    _header.finalHeaderSteam = {
      pressure: tmpHeatLoss.outletPressure,
      temperature: tmpHeatLoss.outletTemperature,
      specificEnthalpy: tmpHeatLoss.outletSpecificEnthalpy,
      specificEntropy: tmpHeatLoss.outletSpecificEntropy,
      quality: tmpHeatLoss.outletQuality,
      massFlow: tmpHeatLoss.outletMassFlow,
      energyFlow: tmpHeatLoss.outletEnergyFlow,
    }
    return _header;
  }

  setFeedwater(_ssmtOutputData: SSMTOutput) {
    _ssmtOutputData.feedwater = {
      pressure: _ssmtOutputData.boilerOutput.feedwaterPressure,
      temperature: _ssmtOutputData.boilerOutput.feedwaterTemperature,
      specificEnthalpy: _ssmtOutputData.boilerOutput.feedwaterSpecificEnthalpy,
      specificEntropy: _ssmtOutputData.boilerOutput.feedwaterSpecificEntropy,
      quality: _ssmtOutputData.boilerOutput.feedwaterQuality,
      massFlow: _ssmtOutputData.boilerOutput.feedwaterMassFlow,
      energyFlow: _ssmtOutputData.boilerOutput.feedwaterEnergyFlow,
    }
    return _ssmtOutputData;
  }
}
