import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
@Component({
  selector: 'app-solid-charge-material-form',
  templateUrl: './solid-charge-material-form.component.html',
  styleUrls: ['./solid-charge-material-form.component.css']
})
export class SolidChargeMaterialFormComponent implements OnInit {
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
  selectedMaterialId: any;
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
    //get material types from ToolSuiteDb
    this.materialTypes = this.suiteDbService.selectSolidLoadChargeMaterials();
    if (this.chargeMaterialForm) {
      if (this.chargeMaterialForm.value.materialId && this.chargeMaterialForm.value.materialId != '') {
        if (this.chargeMaterialForm.value.materialLatentHeatOfFusion == '') {
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
    if (this.chargeMaterialForm.satus == "VALID") {
      this.calculate.emit(true);
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  setProperties() {
    let selectedMaterial = this.suiteDbService.selectSolidLoadChargeMaterialById(this.chargeMaterialForm.value.materialId);
    this.chargeMaterialForm.patchValue({
      materialLatentHeatOfFusion: selectedMaterial.latentHeat,
      materialMeltingPoint: selectedMaterial.meltingPoint,
      materialHeatOfLiquid: selectedMaterial.specificHeatLiquid,
      materialSpecificHeatOfSolidMaterial: selectedMaterial.specificHeatSolid
    })
    this.checkForm();
  }
}
