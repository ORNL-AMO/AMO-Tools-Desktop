import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';

@Component({
  selector: 'app-liquid-charge-material-form',
  templateUrl: './liquid-charge-material-form.component.html',
  styleUrls: ['./liquid-charge-material-form.component.css']
})
export class LiquidChargeMaterialFormComponent implements OnInit {
  @Input()
  chargeMaterialForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  materialTypes: any;
  selectedMaterial: any;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() {
    this.materialTypes = this.suiteDbService.selectLiquidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.value.materialId && this.chargeMaterialForm.value.materialId != '') {
        if (this.chargeMaterialForm.value.materialLatentHeat == '') {
          this.setProperties();
        }
      }
    }
    if (!this.baselineSelected) {
      this.disableForm();
    }
  }

  disableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }


  checkForm() {
    this.lossState.saved = false;
    if (this.chargeMaterialForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }


  setProperties() {
    console.log(this.chargeMaterialForm.value.materialId);
    let selectedMaterial = this.suiteDbService.selectLiquidLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
    this.chargeMaterialForm.patchValue({
      materialLatentHeat: selectedMaterial.latentHeat,
      materialSpecificHeatLiquid: selectedMaterial.specificHeatLiquid,
      materialSpecificHeatVapor: selectedMaterial.specificHeatVapor,
      materialVaporizingTemperature: selectedMaterial.vaporizationTemperature
    })
    this.checkForm();
  }
}
