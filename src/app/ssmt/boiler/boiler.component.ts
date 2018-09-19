import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { BoilerService } from './boiler.service';
import { Boiler } from '../../shared/models/ssmt';
import { FormGroup } from '@angular/forms';
import { SuiteDbService } from '../../suiteDb/suite-db.service';
import { SsmtService } from '../ssmt.service';
import { ModalDirective } from 'ngx-bootstrap';

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
  boiler: Boiler;
  @Output('emitSave')
  emitSave = new EventEmitter<Boiler>();

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
  constructor(private boilerService: BoilerService, private suiteDbService: SuiteDbService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (this.boiler) {
      this.boilerForm = this.boilerService.initFormFromObj(this.boiler);
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
    let tmpBoiler: Boiler = this.boilerService.initObjFromForm(this.boilerForm);
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
}
