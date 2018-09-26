import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BoilerService } from './boiler.service';
import { BoilerData } from '../../shared/models/ssmt';
import { FormGroup } from '@angular/forms';
import { SuiteDbService } from '../../suiteDb/suite-db.service';
import { SsmtService } from '../ssmt.service';
import { ModalDirective } from 'ngx-bootstrap';
import { CompareService } from '../compare.service';

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
  @Input()
  boilerData: BoilerData;
  @Output('emitSave')
  emitSave = new EventEmitter<BoilerData>();

  @ViewChild('materialModal') public materialModal: ModalDirective;


  fuelOptions: Array<string> = [
    'Natural Gas',
    'Coal',
    'Heavy Fuel Oil',
    'Tires'
  ];

  boilerForm: FormGroup;
  options: any;
  showModal: boolean;
  constructor(private boilerService: BoilerService, private suiteDbService: SuiteDbService, private ssmtService: SsmtService,
    private compareService: CompareService) { }

  ngOnInit() {
    if (this.boilerData) {
      this.boilerForm = this.boilerService.initFormFromObj(this.boilerData);
    } else {
      this.boilerForm = this.boilerService.initForm();
    }
    this.setFuelTypes();
    if (this.selected == false) {
      this.disableForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.isFirstChange()) {
      if (this.selected == true) {
        this.enableForm();
      } else if (this.selected == false) {
        this.disableForm();
      }
    }
  }

  setFuelTypes() {
    if (this.boilerForm.controls.fuelType.value == 0) {
      this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    } else if (this.boilerForm.controls.fuelType.value == 1) {
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

  save() {
    let tmpBoiler: BoilerData = this.boilerService.initObjFromForm(this.boilerForm);
    this.emitSave.emit(tmpBoiler);
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
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
    // if (event) {
    //   this.options = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    //   let newMaterial = this.options.filter(material => { return material.substance == event.substance });
    //   if (newMaterial.length != 0) {
    //     this.flueGasLossForm.patchValue({
    //       gasTypeId: newMaterial[0].id
    //     })
    //     this.setProperties();
    //   }
    // }
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
  isFuelTypeDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFuelTypeDifferent();
    } else {
      return false;
    }
  }
  isFuelDifferent() {
    if (this.canCompare()) {
      return this.compareService.isFuelDifferent();
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
}
