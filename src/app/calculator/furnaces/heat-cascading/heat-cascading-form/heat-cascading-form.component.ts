import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { HeatCascadingInput } from '../../../../shared/models/phast/heatCascading';
import { Settings } from '../../../../shared/models/settings';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { HeatCascadingFormService } from '../heat-cascading-form.service';
import { HeatCascadingService } from '../heat-cascading.service';

@Component({
  selector: 'app-heat-cascading-form',
  templateUrl: './heat-cascading-form.component.html',
  styleUrls: ['./heat-cascading-form.component.css']
})
export class HeatCascadingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('flueGasModal', { static: false }) public flueGasModal: ModalDirective;
  @ViewChild('gasMaterialModal', { static: false }) public gasMaterialModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: FormGroup;
  fuelOptions: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  
  formWidth: number;
  
  showPriOpHoursModal: boolean = false;
  showSecOpHoursModal: boolean = false;
  showSecFlueGasModal: boolean;
  showPriFlueGasModal: boolean;

  constructor(private suiteDbService: SuiteDbService,
              private heatCascadingService: HeatCascadingService, 
              private heatCascadingFormService: HeatCascadingFormService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.heatCascadingService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.heatCascadingService.generateExample.subscribe(value => {
      this.initForm();
    })
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnDestroy() {
    this.resetDataSub.unsubscribe();
    this.generateExampleSub.unsubscribe();
  }

  initForm() {
    let heatCascadingInput: HeatCascadingInput = this.heatCascadingService.heatCascadingInput.getValue();
    this.form = this.heatCascadingFormService.getHeatCascadingForm(heatCascadingInput);
    this.initFormSetup();
  }

  initFormSetup() {
    this.fuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    
    if (this.form.controls.materialTypeId.value && this.form.controls.materialTypeId.value !== '') {
      if (this.form.controls.CH4.value === '' || !this.form.controls.CH4.value) {
        this.setMaterialProperties();
      }
    }
  }

  setMaterialProperties() {
    let material = this.suiteDbService.selectGasFlueGasMaterialById(this.form.controls.materialTypeId.value);
    this.form.patchValue({
      CH4: this.heatCascadingService.roundVal(material.CH4, 4),
      C2H6: this.heatCascadingService.roundVal(material.C2H6, 4),
      N2: this.heatCascadingService.roundVal(material.N2, 4),
      H2: this.heatCascadingService.roundVal(material.H2, 4),
      C3H8: this.heatCascadingService.roundVal(material.C3H8, 4),
      C4H10_CnH2n: this.heatCascadingService.roundVal(material.C4H10_CnH2n, 4),
      H2O: this.heatCascadingService.roundVal(material.H2O, 4),
      CO: this.heatCascadingService.roundVal(material.CO, 4),
      CO2: this.heatCascadingService.roundVal(material.CO2, 4),
      SO2: this.heatCascadingService.roundVal(material.SO2, 4),
      O2: this.heatCascadingService.roundVal(material.O2, 4),
      substance: material.substance
    });
  
    this.calculate();
  }

  focusField(str: string) {
    if (str === 'materialTypeId' && this.inModal) {
      str = 'materialTypeIdModal';
    }
    this.heatCascadingService.currentField.next(str);
  }

  calculate() {
    let updatedInput: HeatCascadingInput = this.heatCascadingFormService.getHeatCascadingInput(this.form);
    this.heatCascadingService.heatCascadingInput.next(updatedInput)
  }

  initFlueGasModal(processName: string) {
    if (processName == 'primary') {
      this.showPriFlueGasModal = true;
    } else {
      this.showSecFlueGasModal = true;
    }
    this.heatCascadingService.modalOpen.next(true);
    this.flueGasModal.show();
  }

  hideFlueGasModal(calculatedAvailableHeat?: any) {
    if (calculatedAvailableHeat) {
      calculatedAvailableHeat = this.heatCascadingService.roundVal(calculatedAvailableHeat, 1);
      if (this.showPriFlueGasModal) {
        this.form.patchValue({
          priAvailableHeat: calculatedAvailableHeat
        });
      } else if (this.showSecFlueGasModal) {
        this.form.patchValue({
          secAvailableHeat: calculatedAvailableHeat
        });
      }
    }
    this.calculate();
    this.flueGasModal.hide();
    this.showPriFlueGasModal = false;
    this.showSecFlueGasModal = false;
    this.heatCascadingService.modalOpen.next(false);
  }

  closeOperatingHoursModal() {
    this.showPriOpHoursModal = false;
    this.showSecOpHoursModal = false;
  }

  openOpHoursModal(processName: string) {
    if (processName == 'primary') {
      this.showPriOpHoursModal = true;
    } else {
      this.showSecOpHoursModal = true;
    }
  }

  updateOperatingHours(oppHours: OperatingHours) {
    if (this.showPriOpHoursModal) {
      this.form.controls.priOpHours.patchValue(oppHours.hoursPerYear);
    } else if (this.showSecOpHoursModal) {
      this.form.controls.secOpHours.patchValue(oppHours.hoursPerYear);
    }
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  showMaterialModal() {
    this.heatCascadingService.modalOpen.next(true);
    this.gasMaterialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.fuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial: FlueGasMaterial | SolidLiquidFlueGasMaterial = this.fuelOptions.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.form.patchValue({
          materialTypeId: newMaterial.id,
          substance: newMaterial.substance
        });
        this.setMaterialProperties();
      }
    }
    this.gasMaterialModal.hide();
    this.heatCascadingService.modalOpen.next(false);
    this.calculate();
  }
}

