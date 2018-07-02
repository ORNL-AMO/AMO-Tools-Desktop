import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { LossTab } from '../../../tabs';
@Component({
  selector: 'app-explore-atmosphere-form',
  templateUrl: './explore-atmosphere-form.component.html',
  styleUrls: ['./explore-atmosphere-form.component.css']
})
export class ExploreAtmosphereFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('changeTab')
  changeTab = new EventEmitter<LossTab>();

  showAtmosphere: boolean = false;
  showFlowRate: Array<boolean>;
  showInletTemp: Array<boolean>;
  flowRateError1: Array<string>;
  flowRateError2: Array<string>;
  inletTempError1: Array<string>;
  inletTempError2: Array<string>;


  constructor() { }

  ngOnInit() {
    this.initData();
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showAtmosphere = false;
        this.initData();
      }
    }
  }

  initData() {
    this.showFlowRate = new Array<boolean>();

    this.flowRateError1 = new Array<string>();
    this.flowRateError2 = new Array<string>();
    this.showInletTemp = new Array<boolean>();
    this.inletTempError1 = new Array<string>();
    this.inletTempError2 = new Array<string>();
    let index: number = 0;
    this.phast.losses.atmosphereLosses.forEach(loss => {
      let check: boolean = (loss.flowRate != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate);
      if (!this.showAtmosphere && check) {
        this.showAtmosphere = check;
      }
      this.showFlowRate.push(check);
      this.flowRateError1.push(null);
      this.flowRateError2.push(null);

      check = (loss.inletTemperature != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature ||
        loss.outletTemperature != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].outletTemperature)
      if (!this.showAtmosphere && check) {
        this.showAtmosphere = check;
      }
      this.showInletTemp.push(check);
      this.inletTempError1.push(null);
      this.inletTempError2.push(null);
      index++;
    })
  }

  toggleAtmosphere() {
    if (this.showAtmosphere == false) {
      let index: number = 0;
      this.phast.losses.atmosphereLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate = loss.flowRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature = loss.inletTemperature;
        index++;
      })
    }
  }

  toggleFlowRate(index: number, baselineFlowRate: number) {
    if (this.showFlowRate[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate = baselineFlowRate;
      this.calculate();
    }
  }


  checkFlowRate(num: number, flowRate: number, index: number) {
    if (flowRate < 0) {
      if (num == 1) {
        this.flowRateError1[index] = 'Flow Rate must be greater than 0';
      } else if (num == 2) {
        this.flowRateError2[index] = 'Flow Rate must be greater than 0';
      }
    } else {
      if (num == 1) {
        this.flowRateError1[index] = null;
      } else if (num == 2) {
        this.flowRateError2[index] = null;
      }
    }
    this.calculate();
  }

  toggleInletTemp(index: number, baselineInletTemp: number) {
    if (this.showInletTemp[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature = baselineInletTemp;
      this.calculate();
    }
  }

  checkTemp(num: number, loss: AtmosphereLoss, index: number) {
    if (loss.inletTemperature > loss.outletTemperature) {
      if (num == 1) {
        this.inletTempError1[index] = 'Inlet temperature is greater than outlet temperature';
      } else if (num == 2) {
        this.inletTempError2[index] = 'Inlet temperature is greater than outlet temperature';
      }
    } else {
      if (num == 1) {
        this.inletTempError1[index] = null;
      } else if (num == 2) {
        this.inletTempError2[index] = null;
      }
    }
    this.calculate();
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Atmosphere',
      componentStr: 'atmosphere-losses',
    });
  }

  focusOut() {

  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
