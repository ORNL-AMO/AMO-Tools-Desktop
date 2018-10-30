import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SSMT, HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { HeaderService } from '../../../header/header.service';
import { FormGroup } from '@angular/forms';

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
  emitSave = new EventEmitter<SSMT>();

  showHighPressureHeatLoss: boolean = false;
  showMediumPressureHeatLoss: boolean = false;
  showLowPressureHeatLoss: boolean = false;
  showHeatLoss: boolean = false;
  showHighPressureSteamUsage: boolean = false;
  showMediumPressureSteamUsage: boolean = false;
  showLowPressureSteamUsage: boolean = false;
  showSteamUsage: boolean = false;

  baselineHighPressureForm: FormGroup;
  modificationHighPressureForm: FormGroup;

  baselineLowPressureForm: FormGroup;
  modificationLowPressureForm: FormGroup;

  baselineMediumPressureForm: FormGroup;
  modificationMediumPressureForm: FormGroup;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private headerService: HeaderService) { }

  ngOnInit() {
    this.initForms();
    this.initHeatLoss();
    this.initSteamUsage();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms();
        this.showHighPressureHeatLoss = false;
        this.showMediumPressureHeatLoss = false;
        this.showLowPressureHeatLoss = false;
        this.showHeatLoss = false;
        this.showHighPressureSteamUsage = false;
        this.showMediumPressureSteamUsage = false;
        this.showLowPressureSteamUsage = false;
        this.showSteamUsage = false;
        this.initHeatLoss();
        this.initSteamUsage();
      }
    }
  }

  initForms() {
    if (this.ssmt.headerInput.highPressure) {
      this.baselineHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.headerInput.highPressure, this.settings);
    } else {
      this.baselineHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure) {
      this.modificationHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure, this.settings);
    } else {
      this.modificationHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings);
    }

    if (this.ssmt.headerInput.lowPressure) {
      this.baselineLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.lowPressure, this.settings);
    } else {
      this.baselineLowPressureForm = this.headerService.initHeaderForm(this.settings);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure) {
      this.modificationLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure, this.settings);
    } else {
      this.modificationLowPressureForm = this.headerService.initHeaderForm(this.settings);
    }

    if (this.ssmt.headerInput.mediumPressure) {
      this.baselineMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.mediumPressure, this.settings);
    } else {
      this.baselineMediumPressureForm = this.headerService.initHeaderForm(this.settings);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure) {
      this.modificationMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure, this.settings);
    } else {
      this.modificationMediumPressureForm = this.headerService.initHeaderForm(this.settings);
    }
    this.baselineHighPressureForm.disable();
    this.baselineLowPressureForm.disable();
    this.baselineMediumPressureForm.disable();
  }

  //HEAT LOSS
  initHeatLoss() {
    this.initHighPressureHeatLoss();
    if (this.ssmt.headerInput.mediumPressure) {
      this.initMediumPressureHeatLoss();
    }
    if (this.ssmt.headerInput.lowPressure) {
      this.initLowPressureHeatLoss();
    }
    if (this.showHighPressureHeatLoss || this.showMediumPressureHeatLoss || this.showLowPressureHeatLoss) {
      this.showHeatLoss = true;
    }
  }

  initHighPressureHeatLoss() {
    if (this.baselineHighPressureForm.controls.heatLoss.value != this.modificationHighPressureForm.controls.heatLoss.value) {
      this.showHighPressureHeatLoss = true;
    }
  }
  initMediumPressureHeatLoss() {
    if (this.baselineMediumPressureForm.controls.heatLoss.value != this.modificationMediumPressureForm.controls.heatLoss.value) {
      this.showMediumPressureHeatLoss = true;
    }
  }
  initLowPressureHeatLoss() {
    if (this.baselineLowPressureForm.controls.heatLoss.value != this.modificationLowPressureForm.controls.heatLoss.value) {
      this.showLowPressureHeatLoss = true;
    }
  }

  toggleHeatLoss() {
    this.showHighPressureHeatLoss = false;
    this.showMediumPressureHeatLoss = false;
    this.showLowPressureHeatLoss = false;
    this.toggleHighPressureHeatLoss();
    if (this.baselineMediumPressureForm.controls) {
      this.toggleMediumPressureHeatLoss();
    }
    if (this.baselineLowPressureForm) {
      this.toggleLowPressureHeatLoss();
    }
  }

  toggleHighPressureHeatLoss() {
    if (this.showHighPressureHeatLoss == false) {
      this.modificationHighPressureForm.controls.heatLoss.patchValue(this.baselineHighPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleMediumPressureHeatLoss() {
    if (this.showMediumPressureHeatLoss == false) {
      this.modificationMediumPressureForm.controls.heatLoss.patchValue(this.baselineMediumPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleLowPressureHeatLoss() {
    if (this.showLowPressureHeatLoss == false) {
      this.modificationLowPressureForm.controls.heatLoss.patchValue(this.baselineLowPressureForm.controls.heatLoss.value);
      this.save();
    }
  }
  //STEAM USAGE
  initSteamUsage() {
    this.initHighPressureSteamUsage();
    if (this.baselineMediumPressureForm.controls) {
      this.initMediumPressureSteamUsage();
    }
    if (this.baselineLowPressureForm) {
      this.initLowPressureSteamUsage();
    }
    if (this.showHighPressureSteamUsage || this.showMediumPressureSteamUsage || this.showLowPressureSteamUsage) {
      this.showSteamUsage = true;
    }
  }

  initHighPressureSteamUsage() {
    if (this.baselineHighPressureForm.controls.processSteamUsage.value != this.modificationHighPressureForm.controls.processSteamUsage.value) {
      this.showHighPressureSteamUsage = true;
    }
  }
  initMediumPressureSteamUsage() {
    if (this.baselineMediumPressureForm.controls.processSteamUsage.value != this.modificationMediumPressureForm.controls.processSteamUsage.value) {
      this.showMediumPressureSteamUsage = true;
    }
  }
  initLowPressureSteamUsage() {
    if (this.baselineLowPressureForm.controls.processSteamUsage.value != this.modificationLowPressureForm.controls.processSteamUsage.value) {
      this.showLowPressureSteamUsage = true;
    }
  }

  toggleSteamUsage() {
    this.showHighPressureSteamUsage = false;
    this.showMediumPressureSteamUsage = false;
    this.showLowPressureSteamUsage = false;
    this.toggleHighPressureSteamUsage();
    if (this.baselineMediumPressureForm.controls) {
      this.toggleMediumPressureSteamUsage();
    }
    if (this.baselineLowPressureForm) {
      this.toggleLowPressureSteamUsage();
    }
  }
  toggleHighPressureSteamUsage() {
    if (this.showHighPressureSteamUsage == false) {
      this.modificationHighPressureForm.controls.processSteamUsage.patchValue(this.baselineHighPressureForm.controls.processSteamUsage.value);
      this.save();
    }
  }

  toggleMediumPressureSteamUsage() {
    if (this.showMediumPressureSteamUsage == false) {
      this.modificationMediumPressureForm.controls.processSteamUsage.patchValue(this.baselineMediumPressureForm.controls.processSteamUsage.value);
      this.save();
    }
  }

  toggleLowPressureSteamUsage() {
    if (this.showLowPressureSteamUsage == false) {
      this.modificationLowPressureForm.controls.processSteamUsage.patchValue(this.baselineLowPressureForm.controls.processSteamUsage.value);
      this.save();
    }
  }

  save() {
    // add rest of baseline if we ever enable baseline
    // let tmpBaselineHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.baselineHighPressureForm);
    // this.ssmt.headerInput.highPressure = tmpBaselineHighPressureHeader;
    let tmpModificationHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.modificationHighPressureForm)
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressure = tmpModificationHighPressureHeader;
    let tmpModificationMediumPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationMediumPressureForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressure = tmpModificationMediumPressureHeader;
    let tmpModificationLowPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationLowPressureForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressure = tmpModificationLowPressureHeader;
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('header');
    this.exploreOpportunitiesService.currentField.next(str);
  }

  focusOut() {
    // this.exploreOpportunitiesService.currentTab.next('header');
    // this.exploreOpportunitiesService.currentField.next('default');
  }
}
