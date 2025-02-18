import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { PhastService } from '../../../../phast/phast.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { OperatingHours } from '../../../../shared/models/operations';
import { FlueGasHeatingValue, MaterialInputProperties } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { FeedwaterEconomizerInput } from '../../../../shared/models/steam/feedwaterEconomizer';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';
import { FeedwaterEconomizerFormService, FeedwaterEconomizerWarnings } from '../feedwater-economizer-form.service';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';

@Component({
  selector: 'app-feedwater-economizer-form',
  templateUrl: './feedwater-economizer-form.component.html',
  styleUrls: ['./feedwater-economizer-form.component.css']
})
export class FeedwaterEconomizerFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inTreasureHunt: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @ViewChild('gasMaterialModal', { static: false }) public gasMaterialModal: ModalDirective;
  @ViewChild('moistureModal', { static: false }) public moistureModal: ModalDirective;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  form: UntypedFormGroup;
  
  resetDataSub: Subscription;
  generateExampleSub: Subscription;
  outputSub: Subscription;
  warnings: FeedwaterEconomizerWarnings;
  formWidth: number;
  showOperatingHoursModal: boolean;
  showMoisture: boolean;

  calculationMethods: Array<string> = [
    'Excess Air',
    'Oxygen in Flue Gas'
  ];
  calculationExcessAir: number = 0.0;
  calculationFlueGasO2: number = 0.0;
  calcMethodExcessAir: boolean;

  fuelOptions: Array<FlueGasMaterial>;

  constructor(private feedwaterEconomizerService: FeedwaterEconomizerService, 
    private sqlDbApiService: SqlDbApiService,
    private phastService: PhastService,
    private feedwaterEconomizerFormService: FeedwaterEconomizerFormService) { }

  ngOnInit() {
    this.warnings = this.feedwaterEconomizerFormService.checkWarnings(this.form, this.settings);
    this.initSubscriptions();
  }

  initSubscriptions() {
    this.resetDataSub = this.feedwaterEconomizerService.resetData.subscribe(value => {
      this.initForm();
    });
    this.generateExampleSub = this.feedwaterEconomizerService.generateExample.subscribe(value => {
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
    let feedwaterEconomizerInput: FeedwaterEconomizerInput = this.feedwaterEconomizerService.feedwaterEconomizerInput.getValue();
    this.form = this.feedwaterEconomizerFormService.getFeedwaterEconomizerForm(feedwaterEconomizerInput, this.settings);
    this.fuelOptions = this.sqlDbApiService.selectGasFlueGasMaterials();
    this.setMaterialProperties();
    this.setCalcMethod();
    this.calcExcessAir();
  }

  calcExcessAir() {
    let input: MaterialInputProperties = this.feedwaterEconomizerFormService.getMaterialInputProperties(this.form);

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
    let material = this.sqlDbApiService.selectGasFlueGasMaterialById(this.form.controls.materialTypeId.value);

    let flueGasMaterialHeatingValue: FlueGasHeatingValue = this.phastService.flueGasByVolumeCalculateHeatingValue(material);
    this.form.controls.higherHeatingVal.patchValue(this.feedwaterEconomizerService.roundVal(flueGasMaterialHeatingValue.heatingValueVolume, 2));

    this.form.patchValue({
      CH4: this.feedwaterEconomizerService.roundVal(material.CH4, 4),
      C2H6: this.feedwaterEconomizerService.roundVal(material.C2H6, 4),
      N2: this.feedwaterEconomizerService.roundVal(material.N2, 4),
      H2: this.feedwaterEconomizerService.roundVal(material.H2, 4),
      C3H8: this.feedwaterEconomizerService.roundVal(material.C3H8, 4),
      C4H10_CnH2n: this.feedwaterEconomizerService.roundVal(material.C4H10_CnH2n, 4),
      H2O: this.feedwaterEconomizerService.roundVal(material.H2O, 4),
      CO: this.feedwaterEconomizerService.roundVal(material.CO, 4),
      CO2: this.feedwaterEconomizerService.roundVal(material.CO2, 4),
      SO2: this.feedwaterEconomizerService.roundVal(material.SO2, 4),
      O2: this.feedwaterEconomizerService.roundVal(material.O2, 4),
      substance: material.substance
    });
    this.calculate();
  }

  focusField(str: string) {
    this.feedwaterEconomizerService.currentField.next(str);
  }

  calculate() {
    this.warnings = this.feedwaterEconomizerFormService.checkWarnings(this.form, this.settings);
    let updatedInput: FeedwaterEconomizerInput = this.feedwaterEconomizerFormService.getFeedwaterEconomizerInput(this.form);
    this.feedwaterEconomizerService.feedwaterEconomizerInput.next(updatedInput);
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

  setTreasureHuntFuelCost(energySourceType: string) {
    let treasureHuntFuelCost = this.feedwaterEconomizerService.getTreasureHuntFuelCost(energySourceType, this.settings);
    this.form.patchValue({fuelCost: treasureHuntFuelCost});
    this.form.patchValue({fuelCostBoiler: treasureHuntFuelCost});
    this.calculate();
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

  showMoistureModal() {
    this.feedwaterEconomizerService.modalOpen.next(true);
    this.showMoisture = true;
    this.moistureModal.show();
  }

  hideMoistureModal(moistureInAirCombustion?: number) {
    if (moistureInAirCombustion) {
      moistureInAirCombustion = Number(moistureInAirCombustion.toFixed(2));
      this.form.controls.moistureInCombustionAir.patchValue(moistureInAirCombustion);
    }
    this.moistureModal.hide();
    this.showMoisture = false;
    this.feedwaterEconomizerService.modalOpen.next(false);
    this.calculate();
  }
  

  showMaterialModal() {
    this.feedwaterEconomizerService.modalOpen.next(true);
    this.gasMaterialModal.show();
  }

  hideMaterialModal(event?: any) {
    if (event) {
      this.fuelOptions = this.sqlDbApiService.selectGasFlueGasMaterials();
      let newMaterial: FlueGasMaterial = this.fuelOptions.find(material => { return material.substance === event.substance; });
      if (newMaterial) {
        this.form.patchValue({
          materialTypeId: newMaterial.id,
          substance: newMaterial.substance
        });
        this.setMaterialProperties();
      }
    }
    this.gasMaterialModal.hide();
    this.feedwaterEconomizerService.modalOpen.next(false);
    this.calculate();
  }

  setQuality(){
    let temperatureValidators: Array<ValidatorFn> = this.feedwaterEconomizerFormService.getSteamTemperatureValidators(this.form.controls.steamCondition.value, this.settings);
    this.form.controls.steamTemperature.setValidators(temperatureValidators);
    this.form.controls.steamTemperature.updateValueAndValidity();
    this.calculate();
  }
}
