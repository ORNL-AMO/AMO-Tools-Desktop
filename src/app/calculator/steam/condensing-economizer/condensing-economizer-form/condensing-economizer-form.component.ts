import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { CondensingEconomizerInput } from '../../../../shared/models/steam/condensingEconomizer';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { CondensingEconomizerFormService, CondensingEconomizerWarnings } from '../condensing-economizer-form.service';
import { CondensingEconomizerService } from '../condensing-economizer.service';

@Component({
  selector: 'app-condensing-economizer-form',
  templateUrl: './condensing-economizer-form.component.html',
  styleUrls: ['./condensing-economizer-form.component.css']
})
export class CondensingEconomizerFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: FormGroup;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSub: Subscription;
  warnings: CondensingEconomizerWarnings;
  formWidth: number;
  showOperatingHoursModal: boolean;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;

  fuelOptions: Array<FlueGasMaterial>;

  constructor(private condensingEconomizerService: CondensingEconomizerService, 
    private suiteDbService: SuiteDbService,
    private phastService: PhastService,
    private condensingEconomizerFormService: CondensingEconomizerFormService) { }

  ngOnInit() {
    this.warnings = this.condensingEconomizerFormService.checkWarnings(this.form, this.settings);
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.condensingEconomizerService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.condensingEconomizerService.generateExample.subscribe(value => {
      this.initForm();
    });
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
    let condensingEconomizerInput: CondensingEconomizerInput = this.condensingEconomizerService.condensingEconomizerInput.getValue();
    this.form = this.condensingEconomizerFormService.getCondensingEconomizerForm(condensingEconomizerInput, this.settings);
    this.form.controls.oxygenCalculationMethod.disable();
    this.fuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.setMaterialProperties();
    this.setCalcMethod();
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input: MaterialInputProperties = this.condensingEconomizerFormService.getMaterialInputProperties(this.form);

    if (!this.calcMethodExcessAir) {
      if (this.form.controls.flueGasO2.status === 'VALID') {
          this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
        this.form.patchValue({
          excessAir: this.calculationExcessAir,
        });
      } else {
        this.calculationExcessAir = 0;
        this.form.patchValue({
          excessAir: this.calculationExcessAir,
        });
      }
    }

    if (this.calcMethodExcessAir) {
      if (this.form.controls.excessAir.status === 'VALID') {
        this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
        this.form.patchValue({
          flueGasO2: this.calculationFlueGasO2,
        });
      } else {
        this.calculationFlueGasO2 = 0;
        this.form.patchValue({
          flueGasO2: this.calculationFlueGasO2,
        });
      }
    }
    this.calculate();
  }

  setCalcMethod() {
    if (this.form.controls.oxygenCalculationMethod.value === 'Excess Air') {
      this.calcMethodExcessAir = true;
    } else {
      this.calcMethodExcessAir = false;
    }
  }

  setMaterialProperties() {
    let material = this.suiteDbService.selectGasFlueGasMaterialById(this.form.controls.materialTypeId.value);
    this.form.patchValue({
      CH4: this.condensingEconomizerService.roundVal(material.CH4, 4),
      C2H6: this.condensingEconomizerService.roundVal(material.C2H6, 4),
      N2: this.condensingEconomizerService.roundVal(material.N2, 4),
      H2: this.condensingEconomizerService.roundVal(material.H2, 4),
      C3H8: this.condensingEconomizerService.roundVal(material.C3H8, 4),
      C4H10_CnH2n: this.condensingEconomizerService.roundVal(material.C4H10_CnH2n, 4),
      H2O: this.condensingEconomizerService.roundVal(material.H2O, 4),
      CO: this.condensingEconomizerService.roundVal(material.CO, 4),
      CO2: this.condensingEconomizerService.roundVal(material.CO2, 4),
      SO2: this.condensingEconomizerService.roundVal(material.SO2, 4),
      O2: this.condensingEconomizerService.roundVal(material.O2, 4),
      substance: material.substance
    });
    this.calculate();
  }

  focusField(str: string) {
    this.condensingEconomizerService.currentField.next(str);
  }

  calculate() {
    this.warnings = this.condensingEconomizerFormService.checkWarnings(this.form, this.settings);
    let updatedInput: CondensingEconomizerInput = this.condensingEconomizerFormService.getCondensingEconomizerInput(this.form);
    this.condensingEconomizerService.condensingEconomizerInput.next(updatedInput);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  changeMethod() {
    this.form.patchValue({
      o2InFlueGas: 0,
      excessAirPercentage: 0
    });
    this.setCalcMethod();
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.form.controls.operatingHours.updateValueAndValidity();
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  showMaterialModal() {
    this.materialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.fuelOptions = this.suiteDbService.selectGasFlueGasMaterials();
      let newMaterial = this.fuelOptions.filter(material => { return material.substance === event.substance; });
      if (newMaterial.length !== 0) {
        this.form.patchValue({
          gasTypeId: newMaterial[0].id
        });
        this.setMaterialProperties();
      }
    }
    this.materialModal.hide();
    this.calculate();
  }

}