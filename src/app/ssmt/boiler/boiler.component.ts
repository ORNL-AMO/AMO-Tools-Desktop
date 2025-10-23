import { SaturatedPropertiesOutput } from './../../shared/models/steam/steam-outputs';
import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef, HostListener, ChangeDetectorRef } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BoilerService, BoilerWarnings } from './boiler.service';
import { BoilerInput, HeaderInput, SSMT } from '../../shared/models/steam/ssmt';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { SsmtService } from '../ssmt.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CompareService } from '../compare.service';
import { HeaderService } from '../header/header.service';
import { StackLossService } from '../../calculator/steam/stack-loss/stack-loss.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../shared/models/materials';
import { FlueGasMaterialDbService } from '../../indexedDb/flue-gas-material-db.service';
import { SolidLiquidMaterialDbService } from '../../indexedDb/solid-liquid-material-db.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
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
  ranges: { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number };
  @Input()
  output: SaturatedPropertiesOutput;
  
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
  saturatedPropertiesOutput: SaturatedPropertiesOutput;
  validPlot: boolean = false;
  constructor(private boilerService: BoilerService, private ssmtService: SsmtService,
    private compareService: CompareService, private headerService: HeaderService, 
    private stackLossService: StackLossService,
    private solidLiquidMaterialDbService: SolidLiquidMaterialDbService,
    private flueGasMaterialDbService: FlueGasMaterialDbService,
    private cd: ChangeDetectorRef,
    private convertUnitsService: ConvertUnitsService
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
    this.ranges = this.getRanges();
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
      this.boilerForm = this.boilerService.initFormFromObj(this.boilerInput, this.settings);
    } else {
      this.boilerForm = this.boilerService.initForm(this.settings);
    }
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
    this.setPressureForms(this.boilerInput);
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

  setPressureForms(boilerInput: BoilerInput) {
    if (boilerInput) {
      if (this.headerInput.highPressureHeader) {
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
    this.objToCalculate();
    this.warnings = this.boilerService.checkBoilerWarnings(this.boilerForm, this.ssmt, this.settings);
    let tmpBoiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
    this.setPressureForms(tmpBoiler);
    if (this.boilerInput) {
      tmpBoiler.stackLossInput = this.boilerInput.stackLossInput;
    }    
    this.emitSave.emit(tmpBoiler);
  }

  setPreheatMakeupWater() {
    let tmpBoiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
    this.boilerForm = this.boilerService.initFormFromObj(tmpBoiler, this.settings);
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
    if (this.boilerInput && this.boilerInput.stackLossInput) {
      this.stackLossService.stackLossInput = this.boilerInput.stackLossInput;
    }
    this.showBoilerEfficiencyModal = true;
    this.ssmtService.modalOpen.next(this.showBoilerEfficiencyModal);
  }

  closeBoilerEfficiencyModal() {
    this.showBoilerEfficiencyModal = false;
    this.ssmtService.modalOpen.next(this.showBoilerEfficiencyModal)
    this.save();
  }

  setBoilerEfficiencyAndClose(efficiency: number) {
    if (this.boilerInput && this.boilerInput.stackLossInput) {
      this.boilerInput.stackLossInput = this.stackLossService.stackLossInput;
    } else {
      let tmpBoiler: BoilerInput = this.boilerService.initObjFromForm(this.boilerForm);
      this.boilerInput = tmpBoiler;
      this.boilerInput.stackLossInput = this.stackLossService.stackLossInput;
    }
    this.boilerForm.controls.combustionEfficiency.patchValue(efficiency);
    this.closeBoilerEfficiencyModal();
  }

  changeField(str: string) {
    this.emitChangeField.emit(str);
  }

  setValidators() {
    if (this.boilerForm.controls.pressureOrTemperature.value === 0) {
      this.boilerForm.controls.saturatedPressure.setValidators([Validators.required, Validators.min(this.ranges.minPressure), Validators.max(this.ranges.maxPressure)]);
      this.boilerForm.controls.steamTemperature.clearValidators();
      this.boilerForm.controls.steamTemperature.reset(this.boilerForm.controls.steamTemperature.value);
    }else if (this.boilerForm.controls.pressureOrTemperature.value === 1) {
      this.boilerForm.controls.steamTemperature.setValidators([Validators.required, Validators.min(this.ranges.minTemp), Validators.max(this.ranges.maxTemp)]);
      this.boilerForm.controls.saturatedPressure.clearValidators();
      this.boilerForm.controls.saturatedPressure.reset(this.boilerForm.controls.saturatedPressure.value);
    }
    this.cd.detectChanges();
  }

  getRanges(): { minTemp: number, maxTemp: number, minPressure: number, maxPressure: number } {
    let minTemp: number, maxTemp: number;
    if (this.settings.steamTemperatureMeasurement === 'F') {
      minTemp = 32;
      maxTemp = 705.1;
    } else {
      minTemp = 0;
      maxTemp = 373.9;
    }
    let minPressure: number = Number(this.convertUnitsService.value(1).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    let maxPressure: number = Number(this.convertUnitsService.value(22064).from('kPaa').to(this.settings.steamPressureMeasurement).toFixed(3));
    return { minTemp: minTemp, maxTemp: maxTemp, minPressure: minPressure, maxPressure: maxPressure };
  }

  objToCalculate() {
    this.emitCalculate.emit(this.boilerForm);
  }
}
