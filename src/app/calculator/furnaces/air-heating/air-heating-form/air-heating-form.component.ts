import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { AirHeatingInput } from '../../../../shared/models/phast/airHeating';
import { MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { AirHeatingFormService } from '../air-heating-form.service';
import { AirHeatingService } from '../air-heating.service';

@Component({
  selector: 'app-air-heating-form',
  templateUrl: './air-heating-form.component.html',
  styleUrls: ['./air-heating-form.component.css']
})
export class AirHeatingFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean;
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('gasMaterialModal', { static: false }) public gasMaterialModal: ModalDirective;
  @ViewChild('solidMaterialModal', { static: false }) public solidMaterialModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: FormGroup;
  fuelOptions: Array<FlueGasMaterial | SolidLiquidFlueGasMaterial>;

  resetDataSub: Subscription;
  generateExampleSub: Subscription;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];

  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;
  formWidth: number;

  showOperatingHoursModal: boolean;
  o2Warning: string;

  constructor(
              private airHeatingService: AirHeatingService, 
              private airHeatingFormService: AirHeatingFormService,
              private phastService: PhastService,
              private sqlDbApiService: SqlDbApiService) { }

  ngOnInit() {
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.airHeatingService.resetData.subscribe(value => {
      this.initForm();
    })
    this.generateExampleSub = this.airHeatingService.generateExample.subscribe(value => {
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
    let airHeatingInput: AirHeatingInput = this.airHeatingService.airHeatingInput.getValue();
    this.form = this.airHeatingFormService.getAirHeatingForm(airHeatingInput);
    this.initFormSetup();
  }

  initFormSetup() {
    this.setFuelOptions();
    if (this.form.controls.materialTypeId.value && this.form.controls.materialTypeId.value !== '') {
      if (this.form.controls.CH4.value === '' || !this.form.controls.CH4.value) {
        this.setMaterialProperties();
      }
    }
    this.setCalcMethod();
    this.calcExcessAir();
  }

  changeFuelType() { {}
    let currentInput: AirHeatingInput;
    if (this.form.controls.gasFuelType.value == true) {
      currentInput = this.airHeatingFormService.getAirHeatingInputGasMaterial(this.form);
    } else {
      currentInput = this.airHeatingFormService.getAirHeatingInputSolidMaterial(this.form);
    }
    this.airHeatingService.airHeatingInput.next(currentInput);
    this.initForm();
  }

  setTreasureHuntFuelCost() {
    let energySourceType = this.form.controls.utilityType.value;
    let treasureHuntFuelCost = this.airHeatingService.getTreasureHuntFuelCost(energySourceType, this.settings);
    this.form.patchValue({fuelCost: treasureHuntFuelCost});
    this.calculate();
  }

  setFuelOptions() {
    if (this.form.controls.gasFuelType.value == true) {
      this.fuelOptions = this.sqlDbApiService.selectGasFlueGasMaterials();
    } else {
      this.fuelOptions = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    }
  }

  calcExcessAir() {
    let input: MaterialInputProperties = this.airHeatingFormService.getMaterialInputProperties(this.form);

    if (!this.calcMethodExcessAir) {
      if (this.form.controls.flueGasO2.status === 'VALID') {
        if (this.form.controls.gasFuelType.value == true) {
          this.calculationExcessAir = this.phastService.flueGasCalculateExcessAir(input);
        } else {
          this.calculationExcessAir = this.phastService.flueGasByMassCalculateExcessAir(input);
        }
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
        if (this.form.controls.gasFuelType.value == true) {
          this.calculationFlueGasO2 = this.phastService.flueGasCalculateO2(input);
        } else {
          this.calculationFlueGasO2 = this.phastService.flueGasByMassCalculateO2(input);
        }
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

  changeMethod() {
    this.form.patchValue({
      flueGasO2: 0,
      excessAir: 0
    });
    this.setCalcMethod();
  }

  setMaterialProperties() {
    if (this.form.controls.gasFuelType.value == true) {
      let material = this.sqlDbApiService.selectGasFlueGasMaterialById(this.form.controls.materialTypeId.value);
      this.form.patchValue({
        CH4: this.airHeatingService.roundVal(material.CH4, 4),
        C2H6: this.airHeatingService.roundVal(material.C2H6, 4),
        N2: this.airHeatingService.roundVal(material.N2, 4),
        H2: this.airHeatingService.roundVal(material.H2, 4),
        C3H8: this.airHeatingService.roundVal(material.C3H8, 4),
        C4H10_CnH2n: this.airHeatingService.roundVal(material.C4H10_CnH2n, 4),
        H2O: this.airHeatingService.roundVal(material.H2O, 4),
        CO: this.airHeatingService.roundVal(material.CO, 4),
        CO2: this.airHeatingService.roundVal(material.CO2, 4),
        SO2: this.airHeatingService.roundVal(material.SO2, 4),
        O2: this.airHeatingService.roundVal(material.O2, 4),
        substance: material.substance
      });
    } else {
      let material = this.sqlDbApiService.selectSolidLiquidFlueGasMaterialById(this.form.controls.materialTypeId.value);
      this.form.patchValue({
        carbon: this.airHeatingService.roundVal(material.carbon, 4),
        hydrogen: this.airHeatingService.roundVal(material.hydrogen, 4),
        sulphur: this.airHeatingService.roundVal(material.sulphur, 4),
        inertAsh: this.airHeatingService.roundVal(material.inertAsh, 4),
        o2: this.airHeatingService.roundVal(material.o2, 4),
        moisture: this.airHeatingService.roundVal(material.moisture, 4),
        nitrogen: this.airHeatingService.roundVal(material.nitrogen, 4),
        substance: material.substance
      });
    }
    this.calculate();
  }

  focusField(str: string) {
    if (str === 'materialTypeId' && this.inModal) {
      str = 'materialTypeIdModal';
    }
    this.airHeatingService.currentField.next(str);
  }

  calculate() {
    this.o2Warning = this.airHeatingFormService.checkO2Warning(this.form);
    let updatedInput: AirHeatingInput;
    if (this.form.controls.gasFuelType.value == true) {
      updatedInput = this.airHeatingFormService.getAirHeatingInputGasMaterial(this.form);
    } else {
      updatedInput = this.airHeatingFormService.getAirHeatingInputSolidMaterial(this.form);
    }
    this.airHeatingService.airHeatingInput.next(updatedInput)
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.airHeatingService.operatingHours = oppHours;
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  showMaterialModal() {
    this.airHeatingService.modalOpen.next(true);
    if (this.form.controls.gasFuelType.value == true) {
      this.gasMaterialModal.show();
    } else {
      this.solidMaterialModal.show();
    }
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.setFuelOptions();
      let newMaterial: FlueGasMaterial | SolidLiquidFlueGasMaterial = this.fuelOptions.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.form.patchValue({
          materialTypeId: newMaterial.id,
          substance: newMaterial.substance
        });
        this.setMaterialProperties();
      }
    }
    if (this.form.controls.gasFuelType.value == true) {
      this.gasMaterialModal.hide();
    } else {
      this.solidMaterialModal.hide();
    }
    this.airHeatingService.modalOpen.next(false);
    this.calculate();
  }
}
