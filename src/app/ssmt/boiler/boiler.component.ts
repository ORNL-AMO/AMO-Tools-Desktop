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
import { Observable } from 'rxjs';


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
  
  warnings: BoilerWarnings;
  formWidth: number;
  showBlowdownRateModal: boolean = false;
  showBoilerEfficiencyModal: boolean = false;
  boilerForm: UntypedFormGroup;
  operationsForm: UntypedFormGroup;
  options: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;
  showModal: boolean;
  idString: string = 'baseline_';

  SteamQuality = SteamQuality;
  SteamPressureOrTemp = SteamPressureOrTemp;
  saturatedPropertiesOutput$: Observable<SaturatedPropertiesOutput>;

  boilerTempValidationErrorValue: number;
  headerLowPressureValidationErrorValue: number;
  
  constructor(private boilerService: BoilerService, private ssmtService: SsmtService,
    private compareService: CompareService, private headerService: HeaderService, 
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService
  ) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.saturatedPropertiesOutput$ = this.boilerService.baselineSaturatedPropertiesOutput$;
    } else {
      this.idString = 'modification_';
      this.saturatedPropertiesOutput$ = this.boilerService.modificationSaturatedPropertiesOutput$;
    }
    this.initForm();
    this.setFuelTypes();
    if (this.selected === false) {
      this.disableForm();
    }
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
    if (this.ssmt.boilerInput) {
      this.boilerForm = this.boilerService.initFormFromBoilerInput(this.ssmt.boilerInput, this.settings);
    } else {
      this.boilerForm = this.boilerService.initEmptyForm(this.settings);
    }
    this.setHeaderValidationErrors(this.boilerForm.getRawValue());
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
  }

  updateSteamQuality(): void {
    this.saturatedPressure.clearValidators();
    this.steamTemperature.clearValidators();
    this.boilerService.setPressureAndTemperatureValidators(this.boilerForm, this.settings);
  }

  updateSteamMeasurementField(): void {
    if (this.steamQuality.value === SteamQuality.SATURATED) {
      if (this.pressureOrTemperature.value === SteamPressureOrTemp.PRESSURE) {
        this.saturatedPressure.patchValue(null);
      } else {
        this.steamTemperature.patchValue(null);
      }
    }

    this.boilerService.setPressureAndTemperatureValidators(this.boilerForm, this.settings);
  }

  setFuelTypes() {
    if (this.boilerForm.controls.fuelType.value === 0) {
      this.options = this.solidLiquidMaterialDbService.getAllMaterials();
    } else if (this.boilerForm.controls.fuelType.value === 1) {
      this.options = this.flueGasMaterialDbService.getAllMaterials();
    }
  }

  enableForm() {
    this.boilerForm.enable();
  }

  disableForm() {
    this.boilerForm.disable();
  }

  setHeaderValidationErrors(boilerInput: BoilerInput) {
      this.boilerTempValidationErrorValue = this.headerService.getBoilerTempErrorValue(boilerInput, this.ssmt.headerInput, this.settings);
      this.headerLowPressureValidationErrorValue = this.headerService.getHeaderLowPressureMinErrorValue(boilerInput, this.ssmt.headerInput, this.settings);
  }

  updateSaturatedProperties() {
    this.boilerService.updateFormSaturatedProperties(this.boilerForm, this.ssmt, this.settings, this.isBaseline);
    this.save();
  }

  save() {
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
    const boiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
    this.setHeaderValidationErrors(boiler);
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
  isSteamPressureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isSaturatedPressureDifferent();
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
