import { Component, OnInit, Input, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { SSMT } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../../explore-opportunities.service';
import { FormGroup } from '@angular/forms';

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
  @Input()
  baselineHighPressureForm: FormGroup;
  @Input()
  modificationHighPressureForm: FormGroup;
  @Input()
  baselineLowPressureForm: FormGroup;
  @Input()
  modificationLowPressureForm: FormGroup;
  @Input()
  baselineMediumPressureForm: FormGroup;
  @Input()
  modificationMediumPressureForm: FormGroup;


  showCondensateHandling: boolean = false;
  showHighPressureCondensateRecovery: boolean = false;
  showMediumPressureCondensateRecovery: boolean = false;
  showLowPressureCondensateRecovery: boolean = false;
  showReturnTemperature: boolean = false;
  showFlashCondensateMediumPressure: boolean = false;
  showFlashCondensateLowPressure: boolean = false;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService) { }

  ngOnInit() {
    this.initCondensateHandling();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.showCondensateHandling = false;
        this.showHighPressureCondensateRecovery = false;
        this.showMediumPressureCondensateRecovery = false;
        this.showLowPressureCondensateRecovery = false;
        this.showReturnTemperature = false;
        this.showFlashCondensateMediumPressure = false;
        this.showFlashCondensateLowPressure = false;
        this.initCondensateHandling();
      }
    }
  }

  initCondensateHandling() {
    this.initHighPressureCondensateRecovery();
    this.initReturnTemperature();
    if (this.baselineMediumPressureForm) {
      this.initMediumPressureCondensateRecovery();
      this.initFlashCondensateMediumPressure();
    }
    if (this.baselineLowPressureForm.controls) {
      this.initLowPressureCondensateRecovery();
      this.initFlashCondensateLowPressure();
    }
    if (this.showHighPressureCondensateRecovery || this.showMediumPressureCondensateRecovery || this.showLowPressureCondensateRecovery || this.showReturnTemperature || this.showFlashCondensateLowPressure || this.showFlashCondensateMediumPressure) {
      this.showCondensateHandling = true;
    }
  }

  toggleCondensate() {
    this.showHighPressureCondensateRecovery = false;
    this.showMediumPressureCondensateRecovery = false;
    this.showLowPressureCondensateRecovery = false;
    this.showReturnTemperature = false;
    this.showFlashCondensateMediumPressure = false;
    this.showFlashCondensateLowPressure = false;
    this.toggleReturnTemperature();
    this.toggleHighPressureCondensateRecovery();
    if (this.baselineMediumPressureForm) {
      this.toggleMediumPressureCondensateRecovery();
      this.toggleFlashCondensateMediumPressure();
    }
    if (this.baselineLowPressureForm.controls) {
      this.toggleFlashCondensateLowPressure();
      this.toggleLowPressureCondensateRecovery();
    }
  }

  //condensate recovery rate
  initHighPressureCondensateRecovery() {
    if (this.baselineHighPressureForm.controls.condensationRecoveryRate.value != this.modificationHighPressureForm.controls.condensationRecoveryRate.value) {
      this.showHighPressureCondensateRecovery = true;
    }
  }
  initMediumPressureCondensateRecovery() {
    if (this.baselineMediumPressureForm.controls.condensationRecoveryRate.value != this.modificationMediumPressureForm.controls.condensationRecoveryRate.value) {
      this.showMediumPressureCondensateRecovery = true;
    }
  }
  initLowPressureCondensateRecovery() {
    if (this.baselineLowPressureForm.controls.condensationRecoveryRate.value != this.modificationLowPressureForm.controls.condensationRecoveryRate.value) {
      this.showLowPressureCondensateRecovery = true;
    }
  }

  toggleHighPressureCondensateRecovery() {
    if (this.showHighPressureCondensateRecovery == false) {
      this.modificationHighPressureForm.controls.condensationRecoveryRate.patchValue(this.baselineHighPressureForm.controls.condensationRecoveryRate.value);
      this.save();
    }
  }

  toggleMediumPressureCondensateRecovery() {
    if (this.showMediumPressureCondensateRecovery == false) {
      this.modificationMediumPressureForm.controls.condensationRecoveryRate.patchValue(this.baselineMediumPressureForm.controls.condensationRecoveryRate.value);
      this.save();
    }
  }

  toggleLowPressureCondensateRecovery() {
    if (this.showLowPressureCondensateRecovery == false) {
      this.modificationLowPressureForm.controls.condensationRecoveryRate.patchValue(this.baselineLowPressureForm.controls.condensationRecoveryRate.value);
      this.save();
    }
  }

  //condensate return temperature
  initReturnTemperature() {
    if (this.modificationHighPressureForm.controls.condensateReturnTemperature.value != this.baselineHighPressureForm.controls.condensateReturnTemperature.value) {
      this.showReturnTemperature = true;
    }
  }

  toggleReturnTemperature() {
    if (this.showReturnTemperature == false) {
      this.modificationHighPressureForm.controls.condensateReturnTemperature.patchValue(this.baselineHighPressureForm.controls.condensateReturnTemperature.value);
      this.save();
    }
  }


  //flash condensate
  initFlashCondensateLowPressure() {
    if (this.modificationLowPressureForm.controls.flashCondensateIntoHeader.value != this.baselineLowPressureForm.controls.flashCondensateIntoHeader.value) {
      this.showFlashCondensateLowPressure = true;
    }
  }

  toggleFlashCondensateLowPressure() {
    if (this.showFlashCondensateLowPressure == false) {
      this.modificationLowPressureForm.controls.flashCondensateIntoHeader.patchValue(this.baselineLowPressureForm.controls.flashCondensateIntoHeader.value);
      this.save();
    }
  }

  initFlashCondensateMediumPressure() {
    if (this.modificationMediumPressureForm.controls.flashCondensateIntoHeader.value != this.baselineMediumPressureForm.controls.flashCondensateIntoHeader.value) {
      this.showFlashCondensateMediumPressure = true;
    }
  }

  toggleFlashCondensateMediumPressure() {
    if (this.showFlashCondensateLowPressure == false) {
      this.modificationMediumPressureForm.controls.flashCondensateIntoHeader.patchValue(this.baselineMediumPressureForm.controls.flashCondensateIntoHeader.value);
      this.save();
    }
  }
  save() {
    this.emitSave.emit(true);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('turbine');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('turbine');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
}
