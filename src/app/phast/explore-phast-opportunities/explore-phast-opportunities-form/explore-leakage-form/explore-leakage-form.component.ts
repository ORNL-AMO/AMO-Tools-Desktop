import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { LeakageFormService, LeakageWarnings } from '../../../../calculator/furnaces/leakage/leakage-form.service';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { LossTab } from '../../../tabs';

@Component({
  selector: 'app-explore-leakage-form',
  templateUrl: './explore-leakage-form.component.html',
  styleUrls: ['./explore-leakage-form.component.css']
})
export class ExploreLeakageFormComponent implements OnInit {
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


  showOpening: Array<boolean>;
  showPressure: Array<boolean>;
  showLeakage: boolean = false;
  baselineWarnings: Array<LeakageWarnings>;
  modificationWarnings: Array<LeakageWarnings>;
  constructor(private leakageFormService: LeakageFormService) { }

  ngOnInit() {
    this.initData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initData();
      }
    }
  }
  initData() {
    this.showOpening = new Array();
    this.baselineWarnings = new Array<LeakageWarnings>();
    this.modificationWarnings = new Array<LeakageWarnings>();
    this.showPressure = new Array();
    this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage = { hasOpportunity: false, display: 'Control and Optimize Furnace Pressure' }; 
    
    let index: number = 0;
    this.phast.losses.leakageLosses.forEach(loss => {
      let check: boolean = this.initOpening(loss.openingArea, this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage = { hasOpportunity: check, display: 'Control and Optimize Furnace Pressure' }; 
      }
      this.showOpening.push(check);
      check = this.initOpening(loss.draftPressure, this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].draftPressure);
      if (!this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage.hasOpportunity && check) {
        this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage = { hasOpportunity: check, display: 'Control and Optimize Furnace Pressure' }; 
      }
      this.showPressure.push(check);
      let tmpWarnings: LeakageWarnings = this.leakageFormService.checkLeakageWarnings(loss);
      this.baselineWarnings.push(tmpWarnings);
      tmpWarnings = this.leakageFormService.checkLeakageWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index]);
      this.modificationWarnings.push(tmpWarnings);
      index++;
    });
  }


  initOpening(area1: number, area2: number) {
    if (area1 !== area2) {
      return true;
    } else {
      return false;
    }
  }

  toggleLeakage() {
    if (this.phast.modifications[this.exploreModIndex].exploreOppsShowLeakage.hasOpportunity === false) {
      let index: number = 0;
      this.phast.losses.leakageLosses.forEach(loss => {
        let baselineArea: number = loss.openingArea;
        let baselinePressure: number = loss.draftPressure;
        this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea = baselineArea;
        this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].draftPressure = baselinePressure;
        index++;
      });
      this.initData();
      this.calculate();
    }
  }

  toggleOpening(index: number, baselineArea: number) {
    if (this.showOpening[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].openingArea = baselineArea;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  togglePressure(index: number, baselinePressure: number) {
    if (this.showPressure[index] === false) {
      this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index].draftPressure = baselinePressure;
      this.checkModificationWarnings(index);
      this.calculate();
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
    this.changeTab.emit({
      tabName: 'Gas Leakage',
      step: 7,
      next: 8,
      back: 6,
      componentStr: 'gas-leakage-losses',
      showAdd: true
    });
  }

  checkBaselineWarnings(index: number) {
    let tmpWarnings: LeakageWarnings = this.leakageFormService.checkLeakageWarnings(this.phast.losses.leakageLosses[index]);
    this.baselineWarnings[index] = tmpWarnings;
    this.calculate();
  }

  checkModificationWarnings(index: number) {
    let tmpWarnings: LeakageWarnings = this.leakageFormService.checkLeakageWarnings(this.phast.modifications[this.exploreModIndex].phast.losses.leakageLosses[index]);
    this.modificationWarnings[index] = tmpWarnings;
    this.calculate();
  }

  focusOut() {
    this.changeField.emit('default');
  }

  calculate() {
    this.emitCalculate.emit(true);
  }

}
