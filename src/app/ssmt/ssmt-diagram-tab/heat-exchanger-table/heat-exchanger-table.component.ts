import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges } from '@angular/core';
import { SSMTOutput, HeatExchangerOutput, SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../shared/models/settings';
import { HeatExchangerInput } from '../../../shared/models/steam/steam-inputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { SteamService } from '../../../calculator/steam/steam.service';

@Component({
    selector: 'app-heat-exchanger-table',
    templateUrl: './heat-exchanger-table.component.html',
    styleUrls: ['./heat-exchanger-table.component.css'],
    standalone: false
})
export class HeatExchangerTableComponent implements OnInit {
  @Input()
  outputData: SSMTOutput;
  @Input()
  settings: Settings;
  @Input()
  inputData: SSMTInputs;

  @ViewChild('copyTable0', { static: false }) copyTable0: ElementRef;
  table0String: any;

  heatExchangerOutput: HeatExchangerOutput;

  heatExchangerInput: HeatExchangerInput;
  constructor(private steamService: SteamService) { }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes.outputData.isFirstChange()) {
      this.getData();
    }
  }

  ngOnInit() {
    this.getData();
  }

  updateTable0String() {
    this.table0String = this.copyTable0.nativeElement.innerText;
  }

  getData() {
    this.heatExchangerOutput = this.outputData.heatExchanger;
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      let hotInletProperties: SteamPropertiesOutput = this.steamService.steamProperties(
        {
          pressure: this.outputData.blowdownFlashTank.outletLiquidPressure,
          quantityValue: this.outputData.blowdownFlashTank.outletLiquidSpecificEnthalpy,
          thermodynamicQuantity: 1 //specificEnthalpy
        },
        this.settings
      )
      this.heatExchangerInput = {
        hotInletMassFlow: this.outputData.blowdownFlashTank.outletLiquidMassFlow,
        hotInletEnergyFlow: this.outputData.blowdownFlashTank.outletLiquidEnergyFlow,
        hotInletTemperature: this.outputData.blowdownFlashTank.outletLiquidTemperature,
        hotInletPressure: this.outputData.blowdownFlashTank.outletLiquidPressure,
        hotInletQuality: this.outputData.blowdownFlashTank.outletLiquidQuality,
        hotInletSpecificVolume: hotInletProperties.specificVolume,
        hotInletDensity: 1 / hotInletProperties.specificVolume,
        hotInletSpecificEnthalpy: this.outputData.blowdownFlashTank.outletLiquidSpecificEnthalpy,
        hotInletSpecificEntropy: this.outputData.blowdownFlashTank.outletLiquidSpecificEntropy,

        coldInletMassFlow: this.outputData.makeupWater.massFlow,
        coldInletEnergyFlow: this.outputData.makeupWater.energyFlow,
        coldInletTemperature: this.outputData.makeupWater.temperature,
        coldInletPressure: this.outputData.makeupWater.pressure,
        coldInletQuality: this.outputData.makeupWater.quality,
        coldInletSpecificVolume: this.outputData.makeupWater.specificVolume,
        coldInletDensity: 1 / this.outputData.makeupWater.specificVolume,
        coldInletSpecificEnthalpy: this.outputData.makeupWater.specificEnthalpy,
        coldInletSpecificEntropy: this.outputData.makeupWater.specificEntropy,
        approachTemp: this.inputData.boilerInput.approachTemperature
      }
    } else {
      let hotInletProperties: SteamPropertiesOutput = this.steamService.steamProperties(
        {
          pressure: this.outputData.boilerOutput.blowdownPressure,
          quantityValue: this.outputData.boilerOutput.blowdownSpecificEnthalpy,
          thermodynamicQuantity: 1 //specificEnthalpy
        },
        this.settings
      )
      this.heatExchangerInput = {
        hotInletMassFlow: this.outputData.boilerOutput.blowdownMassFlow,
        hotInletEnergyFlow: this.outputData.boilerOutput.blowdownEnergyFlow,
        hotInletTemperature: this.outputData.boilerOutput.blowdownTemperature,
        hotInletPressure: this.outputData.boilerOutput.blowdownPressure,
        hotInletQuality: this.outputData.boilerOutput.blowdownQuality,
        hotInletSpecificVolume: hotInletProperties.specificVolume,
        hotInletDensity: 1 / hotInletProperties.specificVolume,
        hotInletSpecificEnthalpy: this.outputData.boilerOutput.blowdownSpecificEnthalpy,
        hotInletSpecificEntropy: this.outputData.boilerOutput.blowdownSpecificEntropy,
        coldInletMassFlow: this.outputData.makeupWater.massFlow,
        coldInletEnergyFlow: this.outputData.makeupWater.energyFlow,
        coldInletTemperature: this.outputData.makeupWater.temperature,
        coldInletPressure: this.outputData.makeupWater.pressure,
        coldInletQuality: this.outputData.makeupWater.quality,
        coldInletSpecificVolume: this.outputData.makeupWater.specificVolume,
        coldInletDensity: 1 / this.outputData.makeupWater.specificVolume,
        coldInletSpecificEnthalpy: this.outputData.makeupWater.specificEnthalpy,
        coldInletSpecificEntropy: this.outputData.makeupWater.specificEntropy,
        approachTemp: this.inputData.boilerInput.approachTemperature
      }
    }
  }

}
