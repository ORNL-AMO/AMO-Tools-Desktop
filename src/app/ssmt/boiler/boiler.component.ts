import { SaturatedPropertiesOutput } from './../../shared/models/steam/steam-outputs';
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BoilerService, BoilerWarnings } from './boiler.service';
import { BoilerInput, HeaderInput, SSMT } from '../../shared/models/steam/ssmt';
import { UntypedFormGroup } from '@angular/forms';
import { SsmtService } from '../ssmt.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompareService } from '../compare.service';
import { HeaderService } from '../header/header.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { SteamPressureOrTemp, SteamQuality } from '../../shared/models/steam/steam-inputs';

@Component({
    selector: 'app-boiler',
    templateUrl: './boiler.component.html',
    styleUrls: ['./boiler.component.css'],
    standalone: false
})
export class BoilerComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  ssmt: SSMT;
  @Input()
  saturatedPropertiesOutput: SaturatedPropertiesOutput;

  @Output()
  emitCalculate = new EventEmitter<UntypedFormGroup>();
  @Output('emitSave')
  emitSave = new EventEmitter<BoilerInput>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setBlowdownRateModalWidth();
  }
  
  headerInput: HeaderInput;
  boilerInput: BoilerInput;
  warnings: BoilerWarnings;
  formWidth: number;
  showBlowdownRateModal: boolean = false;
  showBoilerEfficiencyModal: boolean = false;
  boilerForm: UntypedFormGroup;
  operationsForm: UntypedFormGroup;
  options: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;
  showModal: boolean;
  idString: string = 'baseline_';
  highPressureHeaderForm: UntypedFormGroup;
  lowPressureHeaderForm: UntypedFormGroup;

  SteamQuality = SteamQuality;
  SteamPressureOrTemp = SteamPressureOrTemp;
  
  constructor(private boilerService: BoilerService, private ssmtService: SsmtService,
    private compareService: CompareService, private headerService: HeaderService, 
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService
  ) { }

  ngOnInit() {
    this.boilerInput = this.ssmt.boilerInput;
    this.headerInput = this.ssmt.headerInput;
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
    this.initForm();
    this.setFuelTypes();
    if (this.selected === false) {
      this.disableForm();
    }
    // todo we shouldn't need to call this on init, validation is already being (or should be) performed on initForm --> service call
    // this.setPressureOrTemperatureValidators();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected === true) {
        this.enableForm();
      } else if (this.selected === false) {
        this.disableForm();
      }
    }
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.initForm();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setBlowdownRateModalWidth();
    }, 100)
  }

  initForm() {
    if (this.boilerInput) {
      this.boilerForm = this.boilerService.initFormFromBoilerInput(this.boilerInput, this.settings);
    } else {
      this.boilerForm = this.boilerService.initEmptyForm(this.settings);
    }
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
    this.setPressureForms(this.boilerInput);
  }

  setPressureOrTemperatureValidators() {
    if (this.steamQuality.value === SteamQuality.SUPERHEATED) {
      this.boilerService.setSaturatedPressureValidators(this.saturatedPressure, this.settings);
      this.boilerService.setSteamTemperatureValidators(this.steamTemperature, this.settings);
    } else if (this.pressureOrTemperature.value === SteamPressureOrTemp.PRESSURE) {
      this.boilerService.setSaturatedPressureValidators(this.saturatedPressure, this.settings);
      this.steamTemperature.clearValidators();
    } else if (this.pressureOrTemperature.value === SteamPressureOrTemp.TEMPERATURE) {
      this.boilerService.setSteamTemperatureValidators(this.steamTemperature, this.settings);
      this.saturatedPressure.clearValidators();
    }
    this.saturatedPressure.updateValueAndValidity();
    this.steamTemperature.updateValueAndValidity();
  }

    // todo this method should be a change handler that's triggered on a form control change. Bound in the component to (input), (change)
  updateHiddenFieldValues(): void {
    // * looking back at our earlier slack messages, I believe we only run the logic in this handler if the quality == saturated, 
    // * because we'll have both values if it's super heated? you'll have to double check me on this
    if (this.steamQuality.value === SteamQuality.SATURATED) {
      if (this.pressureOrTemperature.value === SteamPressureOrTemp.PRESSURE) {
        // todo use patchValue for these, not setValue
        this.saturatedPressure.patchValue(null);
      } else {
        this.steamTemperature.patchValue(null);
      }
    }

    // * we set validation any time pressureOrTemp metric changes. Is that right?
    this.setPressureOrTemperatureValidators();
  }


  setFuelTypes() {
    if (this.boilerForm.controls.fuelType.value === 0) {
      this.options = this.solidLiquidMaterialDbService.getAllMaterials();
    } else if (this.boilerForm.controls.fuelType.value === 1) {
      this.options = this.flueGasMaterialDbService.getAllMaterials();
    }
  }

  enableForm() {
    this.boilerForm.controls.fuelType.enable();
    this.boilerForm.controls.fuel.enable();
    this.boilerForm.controls.blowdownFlashed.enable();
    this.boilerForm.controls.preheatMakeupWater.enable();
  }

  disableForm() {
    this.boilerForm.controls.fuelType.disable();
    this.boilerForm.controls.fuel.disable();
    this.boilerForm.controls.blowdownFlashed.disable();
    this.boilerForm.controls.preheatMakeupWater.disable();
  }

  // todo for nbintertech - new issue after 7661, get these header forms out of the class/template and read header validation returned from a service call instead
  setPressureForms(boilerInput: BoilerInput) {
    if (boilerInput) {
      if (this.headerInput.highPressureHeader) {
        // * We need to do something here, not clear what yet
        this.highPressureHeaderForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.settings, boilerInput, undefined);
      }

      if (this.headerInput.numberOfHeaders == 1 && this.headerInput.highPressureHeader) {
        this.lowPressureHeaderForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.settings, this.boilerInput, boilerInput.deaeratorPressure);
      } else if (this.headerInput.lowPressureHeader && this.headerInput.numberOfHeaders > 1) {
        this.lowPressureHeaderForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressureHeader, this.settings, boilerInput.deaeratorPressure, undefined);
      }
    }
  }

  save() {
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
    const boiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
    this.setPressureForms(boiler);
    this.emitSave.emit(boiler);
  }

  setPreheatMakeupWater() {
    let tmpBoiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
    this.boilerForm = this.boilerService.initFormFromBoilerInput(tmpBoiler, this.settings);
    this.save();
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
    this.ssmtService.isBaselineFocused.next(this.isBaseline);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  showMaterialModal() {
    this.showModal = true;
    this.ssmtService.modalOpen.next(this.showModal);
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    this.materialModal.hide();
    this.setFuelTypes();
    this.showModal = false;
    this.ssmtService.modalOpen.next(this.showModal);
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }
  isBlowdownRateDifferent() {
    if (this.canCompare()) {
      return this.compareService.isBlowdownRateDifferent();
    } else {
      return false;
    }
  }
  isBlowdownFlashedDifferent() {
    if (this.canCompare()) {
      return this.compareService.isBlowdownFlashedDifferent();
    } else {
      return false;
    }
  }
  isPreheatMakeupWaterDifferent() {
    if (this.canCompare()) {
      return this.compareService.isPreheatMakeupWaterDifferent();
    } else {
      return false;
    }
  }
  isApproachTemperatureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isApproachTemperatureDifferent();
    } else {
      return false;
    }
  }
  isSteamTemperatureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSteamTemperatureDifferent();
    } else {
      return false;
    }
  }
  isDeaeratorVentRateDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDeaeratorVentRateDifferent();
    } else {
      return false;
    }
  }
  isDeaeratorPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isDeaeratorPressureDifferent();
    } else {
      return false;
    }
  }
  isCombustionEfficiencyDifferent() {
    if (this.canCompare()) {
      return this.compareService.isCombustionEfficiencyDifferent();
    } else {
      return false;
    }
  }

  closeBlowdownRateModal() {
    this.showBlowdownRateModal = false;
    this.ssmtService.modalOpen.next(false);
  }

  openBlowdownRateModal() {
    this.showBlowdownRateModal = true;
    this.ssmtService.modalOpen.next(true);
  }

  saveAndCloseBlowdownRateModal() {
    this.save();
    this.closeBlowdownRateModal();
  }

  setBlowdownRateModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  openBoilerEfficiencyModal() {
    this.showBoilerEfficiencyModal = true;
    this.ssmtService.modalOpen.next(this.showBoilerEfficiencyModal);
  }

  closeBoilerEfficiencyModal() {
    this.showBoilerEfficiencyModal = false;
    this.ssmtService.modalOpen.next(this.showBoilerEfficiencyModal)
    this.save();
  }

  setBoilerEfficiencyAndClose(efficiency: number) {
    this.boilerForm.controls.combustionEfficiency.patchValue(efficiency);
    this.closeBoilerEfficiencyModal();
  }

  // * original method
  // private updateHiddenFieldValues(): void {
  //   const showSaturatedPressure =
  //     this.pressureOrTemperature.value === SteamPressureOrTemp.PRESSURE ||
  //     this.steamQuality.value === SteamQuality.SUPERHEATED;
  //   if (!showSaturatedPressure) {
  //     this.saturatedPressure.setValue(null);
  //     // this.saturatedPressure.markAsPristine();
  //   }

  //   const showSteamTemperature =
  //     this.pressureOrTemperature.value === SteamPressureOrTemp.TEMPERATURE ||
  //     this.steamQuality.value === SteamQuality.SUPERHEATED;
  //   if (!showSteamTemperature) {
  //     this.steamTemperature.setValue(null);
  //     // this.steamTemperature.markAsPristine();
  //   }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  get pressureOrTemperature() {
    return this.boilerForm.get('pressureOrTemperature');
  }

  get steamTemperature() {
    return this.boilerForm.get('steamTemperature');
  }

  get saturatedPressure() {
    return this.boilerForm.get('saturatedPressure');  
  }

  get steamQuality() {
    return this.boilerForm.get('steamQuality');
  }

}
