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
  showHighPressureSteamUsage: boolean = false;
  showMediumPressureSteamUsage: boolean = false;
  showLowPressureSteamUsage: boolean = false;
  showSteamUsage: boolean = false;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.initHeatLoss();
    this.initSteamUsage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initHeatLoss();
        this.initSteamUsage();
      }
    }
  }

  //HEAT LOSS
  initHeatLoss() {
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
    if (this.showHighPressureHeatLoss == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.heatLoss = this.ssmt.headerInput.highPressure.heatLoss;
      this.save();
    }
  }

  toggleMediumPressureHeatLoss() {
    if (this.showMediumPressureHeatLoss == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.heatLoss = this.ssmt.headerInput.mediumPressure.heatLoss;
      this.save();
    }
  }

  toggleLowPressureHeatLoss() {
    if (this.showLowPressureHeatLoss == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.heatLoss = this.ssmt.headerInput.lowPressure.heatLoss;
      this.save();
    }
  }
  //STEAM USAGE
  initSteamUsage() {
    this.initHighPressureSteamUsage();
    this.initMediumPressureSteamUsage();
    this.initLowPressureSteamUsage();
    if (this.showHighPressureSteamUsage || this.showMediumPressureSteamUsage || this.showLowPressureSteamUsage) {
      this.showSteamUsage = true;
    }
  }

  initHighPressureSteamUsage() {
    if (this.ssmt.headerInput.highPressure.processSteamUsage != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.processSteamUsage) {
      this.showHighPressureSteamUsage = true;
    }
  }
  initMediumPressureSteamUsage() {
    if (this.ssmt.headerInput.mediumPressure.processSteamUsage != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.processSteamUsage) {
      this.showMediumPressureSteamUsage = true;
    }
  }
  initLowPressureSteamUsage() {
    if (this.ssmt.headerInput.lowPressure.processSteamUsage != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.processSteamUsage) {
      this.showLowPressureSteamUsage = true;
    }
  }

  toggleSteamUsage() {
    this.showHighPressureSteamUsage = false;
    this.showMediumPressureSteamUsage = false;
    this.showLowPressureSteamUsage = false;
    this.toggleHighPressureSteamUsage();
    this.toggleMediumPressureSteamUsage();
    this.toggleLowPressureSteamUsage();
  }

  toggleHighPressureSteamUsage() {
    if (this.showHighPressureSteamUsage == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.processSteamUsage = this.ssmt.headerInput.highPressure.processSteamUsage;
      this.save();
    }
  }

  toggleMediumPressureSteamUsage() {
    if (this.showMediumPressureSteamUsage == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.processSteamUsage = this.ssmt.headerInput.mediumPressure.processSteamUsage;
      this.save();
    }
  }

  toggleLowPressureSteamUsage() {
    if (this.showLowPressureSteamUsage == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.processSteamUsage = this.ssmt.headerInput.lowPressure.processSteamUsage;
      this.save();
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
