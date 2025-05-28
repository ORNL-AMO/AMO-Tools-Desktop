import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SSMTOutput, HeatExchangerOutput } from '../../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { HeatExchangerInput } from '../../../../shared/models/steam/steam-inputs';

@Component({
    selector: 'app-hover-heat-exchanger',
    templateUrl: './hover-heat-exchanger.component.html',
    styleUrls: ['./hover-heat-exchanger.component.css'],
    standalone: false
})
export class HoverHeatExchangerComponent implements OnInit {
  @Input()
  outputData: SSMTOutput;
  @Input()
  inputData: SSMTInputs;
  @Input()
  settings: Settings;
  @Input()
  inResultsPanel: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  tableString: any;

  heatExchangerInput: HeatExchangerInput;
  constructor() { }

  ngOnInit() {
    if (this.inputData.boilerInput.blowdownFlashed == true) {
      this.heatExchangerInput = {
        hotInletMassFlow: this.outputData.blowdownFlashTank.outletLiquidMassFlow,
        hotInletEnergyFlow: this.outputData.blowdownFlashTank.outletLiquidEnergyFlow,
        hotInletTemperature: this.outputData.blowdownFlashTank.outletLiquidTemperature,
        hotInletPressure: this.outputData.blowdownFlashTank.outletLiquidPressure,
        hotInletQuality: this.outputData.blowdownFlashTank.outletLiquidQuality,
        hotInletSpecificVolume: 0,
        hotInletDensity: 0,
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
      this.heatExchangerInput = {
        hotInletMassFlow: this.outputData.boilerOutput.blowdownMassFlow,
        hotInletEnergyFlow: this.outputData.boilerOutput.blowdownEnergyFlow,
        hotInletTemperature: this.outputData.boilerOutput.blowdownTemperature,
        hotInletPressure: this.outputData.boilerOutput.blowdownPressure,
        hotInletQuality: this.outputData.boilerOutput.blowdownQuality,
        hotInletSpecificVolume: 0,
        hotInletDensity: 0,
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

  updateTableString() {
    this.tableString = this.copyTable.nativeElement.innerText;
  }

}
