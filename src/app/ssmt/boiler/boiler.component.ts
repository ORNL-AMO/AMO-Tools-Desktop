import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BoilerService, BoilerWarnings } from './boiler.service';
import { BoilerInput, HeaderInput, SSMT } from '../../shared/models/steam/ssmt';
import { FormGroup } from '@angular/forms';
import { SuiteDbService } from '../../suiteDb/suite-db.service';
import { SsmtService } from '../ssmt.service';
import { ModalDirective } from 'ngx-bootstrap';
import { CompareService } from '../compare.service';
import { HeaderService } from '../header/header.service';
import { StackLossService } from '../../calculator/steam/stack-loss/stack-loss.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../shared/models/materials';

@Component({
  selector: 'app-boiler',
  templateUrl: './boiler.component.html',
  styleUrls: ['./boiler.component.css']
})
export class BoilerComponent implements OnInit {
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<BoilerInput>();
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  ssmt: SSMT;
  
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
  boilerForm: FormGroup;
  operationsForm: FormGroup;
  options: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;
  showModal: boolean;
  idString: string = 'baseline_';
  highPressureHeaderForm: FormGroup;
  lowPressureHeaderForm: FormGroup;
  constructor(private boilerService: BoilerService, private suiteDbService: SuiteDbService, private ssmtService: SsmtService,
    private compareService: CompareService, private headerService: HeaderService, private stackLossService: StackLossService) { }

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
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.boilerForm.controls.fuelType.value === 1) {
      this.options = this.suiteDbService.selectGasFlueGasMaterials();
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
        this.highPressureHeaderForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.ssmt, this.settings, boilerInput);
      }

      if (this.headerInput.numberOfHeaders == 1 && this.headerInput.highPressureHeader) {
        this.lowPressureHeaderForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.ssmt, this.settings, this.boilerInput, boilerInput.deaeratorPressure);
      } else if (this.headerInput.lowPressureHeader && this.headerInput.numberOfHeaders > 1) {
        this.lowPressureHeaderForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressureHeader, this.ssmt, this.settings, boilerInput.deaeratorPressure, undefined);
      }
    }
  }

  save() {
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
}
