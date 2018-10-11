import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SSMT } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { SsmtService } from '../../../ssmt.service';

@Component({
  selector: 'app-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['./header-form.component.css']
})
export class HeaderFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  showHighPressureHeatLoss: boolean = false;
  showMediumPressureHeatLoss: boolean = false;
  showLowPressureHeatLoss: boolean = false;
  showHeatLoss: boolean = false;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.init();
      }
    }
  }

  init() {
    this.initHighPressureHeatLoss();
    this.initMediumPressureHeatLoss();
    this.initLowPressureHeatLoss();
    if (this.showHighPressureHeatLoss || this.showMediumPressureHeatLoss || this.showLowPressureHeatLoss) {
      this.showHeatLoss = true;
    }
  }

  initHighPressureHeatLoss() {
    if (this.ssmt.headerInput.highPressure.heatLoss != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.heatLoss) {
      this.showHighPressureHeatLoss = true;
    }
  }
  initMediumPressureHeatLoss() {
    if (this.ssmt.headerInput.mediumPressure.heatLoss != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.heatLoss) {
      this.showMediumPressureHeatLoss = true;
    }
  }
  initLowPressureHeatLoss() {
    if (this.ssmt.headerInput.lowPressure.heatLoss != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.heatLoss) {
      this.showLowPressureHeatLoss = true;
    }
  }

  toggleHeatLoss() {
    this.showHighPressureHeatLoss = false;
    this.showMediumPressureHeatLoss = false;
    this.showLowPressureHeatLoss = false;
    this.toggleHighPressureHeatLoss();
    this.toggleMediumPressureHeatLoss();
    this.toggleLowPressureHeatLoss();
  }

  toggleHighPressureHeatLoss() {
    if(this.showHighPressureHeatLoss == false){
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.heatLoss = this.ssmt.headerInput.highPressure.heatLoss;
    }
  }

  toggleMediumPressureHeatLoss() {
    if(this.showMediumPressureHeatLoss == false){
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.heatLoss = this.ssmt.headerInput.mediumPressure.heatLoss;
    }
  }
 
  toggleLowPressureHeatLoss() {
    if(this.showLowPressureHeatLoss == false){
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.heatLoss = this.ssmt.headerInput.lowPressure.heatLoss;
    }
  }
  
  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }
}
