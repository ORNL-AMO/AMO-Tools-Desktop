import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { AtmosphereLoss } from '../../../../shared/models/phast/losses/atmosphereLoss';
import { LossTab } from '../../../tabs';
import { AtmosphereLossWarnings, AtmosphereLossesService } from '../../../losses/atmosphere-losses/atmosphere-losses.service';
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

  baselineWarnings: Array<AtmosphereLossWarnings>;
  modificationWarnings: Array<AtmosphereLossWarnings>;
  constructor(private atmosphereLossesService: AtmosphereLossesService) { }

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
    this.baselineWarnings = new Array<AtmosphereLossWarnings>();
    this.modificationWarnings = new Array<AtmosphereLossWarnings>();
    this.showInletTemp = new Array<boolean>();
    let index: number = 0;
    this.phast.losses.atmosphereLosses.forEach(loss => {
      let check: boolean = (loss.flowRate != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate);
      if (!this.showAtmosphere && check) {
        this.showAtmosphere = check;
      }
      this.showFlowRate.push(check);

      check = (loss.inletTemperature != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature ||
        loss.outletTemperature != this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].outletTemperature)
      if (!this.showAtmosphere && check) {
        this.showAtmosphere = check;
      }
      this.showInletTemp.push(check);
      let baselineWarningsCheck: AtmosphereLossWarnings = this.atmosphereLossesService.checkWarnings(loss);
      this.baselineWarnings.push(baselineWarningsCheck)
      let modificationWarningsCheck: AtmosphereLossWarnings = this.atmosphereLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index]);
      this.modificationWarnings.push(modificationWarningsCheck);
      index++;
    })
  }

  toggleAtmosphere() {
    if (this.showAtmosphere == false) {
      let index: number = 0;
      this.phast.losses.atmosphereLosses.forEach(loss => {
        this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate = loss.flowRate;
        this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature = loss.inletTemperature;
        this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].outletTemperature = loss.outletTemperature;
        this.showFlowRate[index] = false;
        this.showInletTemp[index] = false;
        this.checkModificationWarnings(index);
        index++;
      })
    }else{
      this.initData();
    }
  }

  toggleFlowRate(index: number, baselineFlowRate: number) {
    if (this.showFlowRate[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].flowRate = baselineFlowRate;
      this.checkModificationWarnings(index);
    }
  }


  toggleInletTemp(index: number, loss: AtmosphereLoss) {
    if (this.showInletTemp[index] == false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].inletTemperature = loss.inletTemperature;
      this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index].outletTemperature = loss.outletTemperature;
      this.checkModificationWarnings(index);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Atmosphere',
      componentStr: 'atmosphere-losses',
    });
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkBaselineWarnings(index: number){
    this.baselineWarnings[index] = this.atmosphereLossesService.checkWarnings(this.phast.losses.atmosphereLosses[index]);
    this.calculate();
  }

  checkModificationWarnings(index: number){
    this.modificationWarnings[index] =this.atmosphereLossesService.checkWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.atmosphereLosses[index]);
    this.calculate();
  }

  calculate() {
    this.emitCalculate.emit(true)
  }
}
