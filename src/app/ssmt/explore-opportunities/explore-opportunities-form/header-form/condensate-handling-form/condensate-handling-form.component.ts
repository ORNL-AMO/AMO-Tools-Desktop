import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { SSMT } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { SsmtService } from '../../../../ssmt.service';

@Component({
  selector: 'app-condensate-handling-form',
  templateUrl: './condensate-handling-form.component.html',
  styleUrls: ['./condensate-handling-form.component.css']
})
export class CondensateHandlingFormComponent implements OnInit {
  @Input()
  ssmt: SSMT;
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();

  showCondensateRecovery: boolean = false;
  showHighPressureCondensateRecovery: boolean = false;
  showMediumPressureCondensateRecovery: boolean = false;
  showLowPressureCondensateRecovery: boolean = false;
  showReturnTemperature: boolean = false;
  showFlashCondensateMediumPressure: boolean = false;
  showFlashCondensateLowPressure: boolean = false;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.initCondensateRecovery();
    this.initReturnTemperature();
    this.initFlashCondensateLowPressure();
    this.initFlashCondensateMediumPressure();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initCondensateRecovery();
        this.initReturnTemperature();
        this.initFlashCondensateLowPressure();
        this.initFlashCondensateMediumPressure();
      }
    }
  }

  //HEAT LOSS
  initCondensateRecovery() {
    this.initHighPressureCondensateRecovery();
    this.initMediumPressureCondensateRecovery();
    this.initLowPressureCondensateRecovery();
    if (this.showHighPressureCondensateRecovery || this.showMediumPressureCondensateRecovery || this.showLowPressureCondensateRecovery) {
      this.showCondensateRecovery = true;
    }
  }

  initHighPressureCondensateRecovery() {
    if (this.ssmt.headerInput.highPressure.condensationRecoveryRate != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.condensationRecoveryRate) {
      this.showHighPressureCondensateRecovery = true;
    }
  }
  initMediumPressureCondensateRecovery() {
    if (this.ssmt.headerInput.mediumPressure.condensationRecoveryRate != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.condensationRecoveryRate) {
      this.showMediumPressureCondensateRecovery = true;
    }
  }
  initLowPressureCondensateRecovery() {
    if (this.ssmt.headerInput.lowPressure.condensationRecoveryRate != this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.condensationRecoveryRate) {
      this.showLowPressureCondensateRecovery = true;
    }
  }

  toggleCondensateRecovery() {
    this.showHighPressureCondensateRecovery = false;
    this.showMediumPressureCondensateRecovery = false;
    this.showLowPressureCondensateRecovery = false;
    this.toggleHighPressureCondensateRecovery();
    this.toggleMediumPressureCondensateRecovery();
    this.toggleLowPressureCondensateRecovery();
  }

  toggleHighPressureCondensateRecovery() {
    if (this.showHighPressureCondensateRecovery == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.condensationRecoveryRate = this.ssmt.headerInput.highPressure.condensationRecoveryRate;
      this.save();
    }
  }

  toggleMediumPressureCondensateRecovery() {
    if (this.showMediumPressureCondensateRecovery == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.condensationRecoveryRate = this.ssmt.headerInput.mediumPressure.condensationRecoveryRate;
      this.save();
    }
  }

  toggleLowPressureCondensateRecovery() {
    if (this.showLowPressureCondensateRecovery == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.condensationRecoveryRate = this.ssmt.headerInput.lowPressure.condensationRecoveryRate;
      this.save();
    }
  }

  //condensate return temperature
  initReturnTemperature() {
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.condensateReturnTemperature != this.ssmt.headerInput.highPressure.condensateReturnTemperature) {
      this.showReturnTemperature = true;
    }
  }

  toggleReturnTemperature() {
    if (this.showReturnTemperature == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure.condensateReturnTemperature = this.ssmt.headerInput.highPressure.condensateReturnTemperature;
      this.save();
    }
  }


  //flash condensate
  initFlashCondensateLowPressure() {
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.flashCondensateIntoHeader != this.ssmt.headerInput.lowPressure.flashCondensateIntoHeader) {
      this.showFlashCondensateLowPressure = true;
    }
  }

  toggleFlashCondensateLowPressure() {
    if (this.showFlashCondensateLowPressure == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure.flashCondensateIntoHeader = this.ssmt.headerInput.lowPressure.flashCondensateIntoHeader;
      this.save();
    }
  }

  initFlashCondensateMediumPressure() {
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.flashCondensateIntoHeader != this.ssmt.headerInput.mediumPressure.flashCondensateIntoHeader) {
      this.showFlashCondensateMediumPressure = true;
    }
  }

  toggleFlashCondensateMediumPressure() {
    if (this.showFlashCondensateLowPressure == false) {
      this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure.flashCondensateIntoHeader = this.ssmt.headerInput.mediumPressure.flashCondensateIntoHeader;
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
