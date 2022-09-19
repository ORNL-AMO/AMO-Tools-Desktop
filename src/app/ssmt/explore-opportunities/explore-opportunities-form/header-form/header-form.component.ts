import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SSMT, HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import { ExploreOpportunitiesService } from '../../explore-opportunities.service';
import { HeaderService, HeaderRanges, HeaderWarnings } from '../../../header/header.service';
import { FormGroup, Validators } from '@angular/forms';
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
  emitSave = new EventEmitter<SSMT>();

  showHighPressureHeatLoss: boolean = false;
  showMediumPressureHeatLoss: boolean = false;
  showLowPressureHeatLoss: boolean = false;
  showHighPressureSteamUsage: boolean = false;
  showMediumPressureSteamUsage: boolean = false;
  showLowPressureSteamUsage: boolean = false;

  baselineHighPressureForm: FormGroup;
  modificationHighPressureForm: FormGroup;

  baselineLowPressureForm: FormGroup;
  modificationLowPressureForm: FormGroup;

  baselineMediumPressureForm: FormGroup;
  modificationMediumPressureForm: FormGroup;
  baselineWarnings: HeaderWarnings;
  modificationWarnings: HeaderWarnings;
  constructor(private exploreOpportunitiesService: ExploreOpportunitiesService, private headerService: HeaderService,
    private ssmtService: SsmtService) { }

  ngOnInit() {
    this.initForms();
    this.initHeatLoss();
    this.initSteamUsage();
    this.setWarnings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.exploreModIndex) {
      if (!changes.exploreModIndex.isFirstChange()) {
        this.initForms();
        this.initHeatLoss();
        this.initSteamUsage();
        this.setWarnings();
      }
    }
  }

  initForms() {

    if (this.ssmt.headerInput.highPressureHeader) {
      this.baselineHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.headerInput.highPressureHeader, this.settings, this.ssmt.boilerInput, undefined);
    } else {
      this.baselineHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.ssmt.boilerInput, undefined);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader) {
      this.modificationHighPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader, this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput, undefined);
    } else {
      this.modificationHighPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.boilerInput, undefined);
    }

    if (this.ssmt.headerInput.lowPressureHeader) {
      let pressureMax: number;
      if (this.ssmt.headerInput.numberOfHeaders == 3) {
        pressureMax = this.ssmt.headerInput.mediumPressureHeader.pressure;
      } else {
        pressureMax = this.ssmt.headerInput.highPressureHeader.pressure;
      }
      this.baselineLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.lowPressureHeader, this.settings, undefined, pressureMax);
    } else {
      this.baselineLowPressureForm = this.headerService.initHeaderForm(this.settings, false, undefined, undefined);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader) {
      let pressureMax: number;
      if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.numberOfHeaders == 3) {
        pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader.pressure;
      } else {
        pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure;
      }
      this.modificationLowPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader, this.settings, undefined, pressureMax);
    } else {
      this.modificationLowPressureForm = this.headerService.initHeaderForm(this.settings, true, undefined, undefined);
    }

    if (this.ssmt.headerInput.mediumPressureHeader) {
      this.baselineMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.headerInput.mediumPressureHeader, this.settings, this.ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.headerInput.highPressureHeader.pressure);
    } else {
      this.baselineMediumPressureForm = this.headerService.initHeaderForm(this.settings, false);
    }
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader) {
      this.modificationMediumPressureForm = this.headerService.getHeaderFormFromObj(this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader, this.settings, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure);
    } else {
      this.modificationMediumPressureForm = this.headerService.initHeaderForm(this.settings, true);
    }
    this.baselineHighPressureForm.disable();
    this.baselineLowPressureForm.disable();
    this.baselineMediumPressureForm.disable();
  }

  //HEAT LOSS
  initHeatLoss() {
    this.showMediumPressureHeatLoss = false;
    this.showLowPressureHeatLoss = false;
    this.initHighPressureHeatLoss();
    if (this.ssmt.headerInput.mediumPressureHeader) {
      this.initMediumPressureHeatLoss();
    }
    if (this.ssmt.headerInput.lowPressureHeader) {
      this.initLowPressureHeatLoss();
    }
    if (this.showHighPressureHeatLoss || this.showMediumPressureHeatLoss || this.showLowPressureHeatLoss) {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowHeatLoss = { hasOpportunity: true, display: "Adjust Heat Loss Percentages" };
    } else {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowHeatLoss = { hasOpportunity: false, display: "Adjust Heat Loss Percentages" };
    }
  }

  initHighPressureHeatLoss() {
    if (this.baselineHighPressureForm.controls.heatLoss.value !== this.modificationHighPressureForm.controls.heatLoss.value) {
      this.showHighPressureHeatLoss = true;
    } else {
      this.showHighPressureHeatLoss = false;
    }
  }
  initMediumPressureHeatLoss() {
    if (this.baselineMediumPressureForm.controls.heatLoss.value !== this.modificationMediumPressureForm.controls.heatLoss.value) {
      this.showMediumPressureHeatLoss = true;
    }
  }
  initLowPressureHeatLoss() {
    if (this.baselineLowPressureForm.controls.heatLoss.value !== this.modificationLowPressureForm.controls.heatLoss.value) {
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
    if (this.showHighPressureHeatLoss === false) {
      this.modificationHighPressureForm.controls.heatLoss.patchValue(this.baselineHighPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleMediumPressureHeatLoss() {
    if (this.showMediumPressureHeatLoss === false) {
      this.modificationMediumPressureForm.controls.heatLoss.patchValue(this.baselineMediumPressureForm.controls.heatLoss.value);
      this.save();
    }
  }

  toggleLowPressureHeatLoss() {
    if (this.showLowPressureHeatLoss === false) {
      this.modificationLowPressureForm.controls.heatLoss.patchValue(this.baselineLowPressureForm.controls.heatLoss.value);
      this.save();
    }
  }
  //STEAM USAGE
  initSteamUsage() {
    this.showMediumPressureSteamUsage = false;
    this.showLowPressureSteamUsage = false;
    this.initHighPressureSteamUsage();
    if (this.baselineMediumPressureForm.controls) {
      this.initMediumPressureSteamUsage();
    }
    if (this.baselineLowPressureForm) {
      this.initLowPressureSteamUsage();
    }
    if (this.showHighPressureSteamUsage || this.showMediumPressureSteamUsage || this.showLowPressureSteamUsage) {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowSteamUsage = { hasOpportunity: true, display: "Adjust Steam Demand/Usage" };
    } else {
      this.ssmt.modifications[this.exploreModIndex].exploreOppsShowSteamUsage = { hasOpportunity: false, display: "Adjust Steam Demand/Usage" };
    }
  }

  initHighPressureSteamUsage() {
    if (this.baselineHighPressureForm.controls.processSteamUsage.value !== this.modificationHighPressureForm.controls.processSteamUsage.value) {
      this.showHighPressureSteamUsage = true;
    } else {
      this.showHighPressureHeatLoss = false;
    }
  }
  initMediumPressureSteamUsage() {
    if (this.modificationLowPressureForm.controls.useBaselineProcessSteamUsage.value == false) {
      this.showMediumPressureSteamUsage = true;
    }
  }
  initLowPressureSteamUsage() {
    if (this.modificationLowPressureForm.controls.useBaselineProcessSteamUsage.value == false) {
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
    if (this.showHighPressureSteamUsage === false) {
      this.modificationHighPressureForm.controls.processSteamUsage.patchValue(this.baselineHighPressureForm.controls.processSteamUsage.value);
      this.save();
    }
  }

  toggleMediumPressureSteamUsage() {
    if (this.showMediumPressureSteamUsage === false) {
      this.modificationMediumPressureForm.controls.processSteamUsage.patchValue(this.baselineMediumPressureForm.controls.processSteamUsage.value);
      this.save();
    }
    this.modificationMediumPressureForm.controls.useBaselineProcessSteamUsage.patchValue(!this.showMediumPressureSteamUsage);
  }

  toggleLowPressureSteamUsage() {
    if (this.showLowPressureSteamUsage === false) {
      this.modificationLowPressureForm.controls.processSteamUsage.patchValue(this.baselineLowPressureForm.controls.processSteamUsage.value);
      this.save();
    }
    this.modificationLowPressureForm.controls.useBaselineProcessSteamUsage.patchValue(!this.showLowPressureSteamUsage);
  }

  save() {
    // add rest of baseline if we ever enable baseline
    // let tmpBaselineHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.baselineHighPressureForm);
    // this.ssmt.headerInput.highPressureHeader = tmpBaselineHighPressureHeader;
    let tmpModificationHighPressureHeader: HeaderWithHighestPressure = this.headerService.getHighestPressureObjFromForm(this.modificationHighPressureForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader = tmpModificationHighPressureHeader;
    let tmpModificationMediumPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationMediumPressureForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader = tmpModificationMediumPressureHeader;
    let tmpModificationLowPressureHeader: HeaderNotHighestPressure = this.headerService.initHeaderObjFromForm(this.modificationLowPressureForm);
    this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader = tmpModificationLowPressureHeader;
    this.updatePressureMaxMins();
    this.setWarnings();
    this.emitSave.emit(this.ssmt);
  }

  focusField(str: string) {
    this.exploreOpportunitiesService.currentTab.next('header');
    this.ssmtService.isBaselineFocused.next(false);
    this.exploreOpportunitiesService.currentField.next(str);
  }


  updatePressureMaxMins() {
    // add rest of baseline if we ever enable baseline
    let pressureMax: number;
    if (this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.numberOfHeaders == 3) {
      pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.mediumPressureHeader.pressure;
    } else {
      pressureMax = this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure;
    }
    let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, undefined, pressureMax);
    this.modificationLowPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.modificationLowPressureForm.controls.pressure.updateValueAndValidity();

    ranges = this.headerService.getRanges(this.settings, undefined, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.lowPressureHeader.pressure, this.ssmt.modifications[this.exploreModIndex].ssmt.headerInput.highPressureHeader.pressure);
    this.modificationMediumPressureForm.controls.pressure.setValidators([Validators.required, Validators.max(ranges.pressureMax), Validators.min(ranges.pressureMin)]);
    this.modificationMediumPressureForm.controls.pressure.updateValueAndValidity();
  }

  setWarnings(){
    this.baselineWarnings = this.headerService.checkHeaderWarnings(this.ssmt, 'highPressure', this.settings);
    this.modificationWarnings = this.headerService.checkHeaderWarnings(this.ssmt.modifications[this.exploreModIndex].ssmt, 'highPressure', this.settings);
  }
}
