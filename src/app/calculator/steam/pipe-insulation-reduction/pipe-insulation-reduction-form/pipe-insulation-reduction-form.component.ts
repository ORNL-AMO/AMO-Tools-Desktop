import { Component, OnInit, Input, EventEmitter, Output, ViewChild, HostListener, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PipeInsulationReductionInput, PipeInsulationReductionResult } from '../../../../shared/models/standalone';
import { UntypedFormGroup, ValidatorFn } from '@angular/forms';
import { PipeInsulationReductionService } from '../pipe-insulation-reduction.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-pipe-insulation-reduction-form',
  templateUrl: './pipe-insulation-reduction-form.component.html',
  styleUrls: ['./pipe-insulation-reduction-form.component.css'],
  standalone: false
})
export class PipeInsulationReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;
  @Input()
  utilityType: number;
  @Input()
  utilityCost: number;
  @Input()
  heatedOrChilled: number;
  @Input()
  form: UntypedFormGroup;

  formWidth: number;
  showOperatingHoursModal: boolean;
  energyUnit: string;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  utilityOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Natural Gas' },
    { value: 1, name: 'Other Fuel' },
    { value: 2, name: 'Electricity' },
    { value: 3, name: 'Steam' }
  ];

  pipeBaseMaterials: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Carbon Steel' },
    { value: 1, name: 'Copper' },
    { value: 2, name: 'Stainless Steel' }
  ];

  pipeJacketMaterials: Array<{ value: number, name: string }> = [
    { value: 0, name: 'None' },
    { value: 1, name: 'All Service Jacket' },
    { value: 2, name: 'Aluminum Paint' },
    { value: 3, name: 'Aluminum, new, bright' },
    { value: 4, name: 'Aluminum, oxidized' },
    { value: 5, name: 'Canvas' },
    { value: 6, name: 'Colored Mastics' },
    { value: 7, name: 'Copper, pure' },
    { value: 8, name: 'Galvanized Steel' },
    { value: 9, name: 'Iron' },
    { value: 10, name: 'Painted Metal' },
    { value: 11, name: 'PVC Jacketing' },
    { value: 12, name: 'Roofing felt and black mastics' },
    { value: 13, name: 'Stainless Steel, dull' },
    { value: 14, name: 'Stainless Steel, new' },
    { value: 15, name: 'Steel' }
  ];

  insulationMaterials: Array<{ value: number, name: string }> = [
    { value: 0, name: 'None' },
    { value: 1, name: 'Calcium Silicate' },
    { value: 2, name: 'Fiber Glass' },
    { value: 3, name: 'Mineral Fiber' },
    { value: 4, name: 'Glass and Resin' },
    { value: 5, name: 'Cellular Glass' },
    { value: 6, name: 'Polystyrene' },
    { value: 7, name: 'Polyolefin' },
    { value: 8, name: 'Flexible Aerogel' }
  ];

  heatedOrChilledOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Heated' },
    { value: 1, name: 'Chilled' }
  ];

  npsList: Array<{ value: number, name: string }>;

  idString: string;
  isEditingName: boolean = false;

  constructor(private pipeInsulationReductionService: PipeInsulationReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline';
    }
    else {
      this.idString = 'modification';
    }
    this.initNpsList();
    this.energyUnit = this.pipeInsulationReductionService.getEnergyUnit(this.form.controls.utilityType.value, this.settings);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.utilityType && !changes.utilityType.firstChange) {
      this.form.patchValue({ utilityType: this.utilityType });
      this.changeUtilityType();
    }
    if (changes.utilityCost && !changes.utilityCost.firstChange) {
      this.form.patchValue({ utilityCost: this.utilityCost });
    }
    if (changes.heatedOrChilled && !changes.heatedOrChilled.firstChange) {
      this.form.patchValue({ heatedOrChilled: this.heatedOrChilled });
      this.updateHeatedOrChill();
    }
  }

  changeUtilityType() {
    let tmpCost;
    if (this.form.controls.utilityType.value == 0) {
      if (this.isBaseline == true) {
        tmpCost = this.pipeInsulationReductionService.baselineData.naturalGasUtilityCost;
      } else {
        tmpCost = this.pipeInsulationReductionService.modificationData.naturalGasUtilityCost;
      }
    } else if (this.form.controls.utilityType.value == 2) {
      tmpCost = this.settings.electricityCost;
    } else {
      if (this.isBaseline == true) {
        tmpCost = this.pipeInsulationReductionService.baselineData.otherUtilityCost;
      } else {
        tmpCost = this.pipeInsulationReductionService.modificationData.otherUtilityCost;
      }
    }
    this.energyUnit = this.pipeInsulationReductionService.getEnergyUnit(this.form.controls.utilityType.value, this.settings);
    this.form.controls.utilityCost.setValue(tmpCost);
    this.calculate();
  }

  updateHeatedOrChill() {
    this.form = this.pipeInsulationReductionService.updateFormValidators(this.form.controls.heatedOrChilled.value, this.form);
    this.calculate();
  }

  changeInsulationMaterial() {
    if (this.form.controls.insulationMaterialSelection.value == 0) {
      this.form.controls.pipeJacketMaterialSelection.patchValue(0);
      this.form.controls.pipeJacketMaterialSelection.disable();
    } else {
      this.form.controls.pipeJacketMaterialSelection.enable();
    }
    this.updateAverageTempValidation();
  }

  updateAverageTempValidation() {
    let obj: PipeInsulationReductionInput;
    if (this.isBaseline) {
      obj = this.pipeInsulationReductionService.getObjFromForm(this.form, this.pipeInsulationReductionService.baselineData);
    } else {
      obj = this.pipeInsulationReductionService.getObjFromForm(this.form, this.pipeInsulationReductionService.modificationData);
    }
    this.pipeInsulationReductionService.setAverageTemperatureValidation(this.form, obj, this.settings);
    this.calculate();
  }

  calculate() {
    if (this.form.valid) {
      if (this.isBaseline == true) {
        this.pipeInsulationReductionService.baselineData = this.pipeInsulationReductionService.getObjFromForm(this.form, this.pipeInsulationReductionService.baselineData);
        this.emitCalculate.emit(true);
      } else {
        this.pipeInsulationReductionService.modificationData = this.pipeInsulationReductionService.getObjFromForm(this.form, this.pipeInsulationReductionService.modificationData);
        this.emitCalculate.emit(true);
      }
    }
  }

  initNpsList() {
    if (this.settings.unitsOfMeasure == 'Imperial') {
      this.npsList = [
        { value: 0, name: '0.25 in' },
        { value: 1, name: '0.5 in' },
        { value: 2, name: '0.75 in' },
        { value: 3, name: '1 in' },
        { value: 4, name: '1.25 in' },
        { value: 5, name: '1.5 in' },
        { value: 6, name: '2 in' },
        { value: 7, name: '2.5 in' },
        { value: 8, name: '3 in' },
        { value: 9, name: '3.5 in' },
        { value: 10, name: '4 in' },
        { value: 11, name: '5 in' },
        { value: 12, name: '6 in' },
        { value: 13, name: '8 in' },
        { value: 14, name: '10 in' },
        { value: 15, name: '12 in' },
        { value: 16, name: '14 in' },
        { value: 17, name: '16 in' },
        { value: 18, name: '18 in' },
        { value: 19, name: '20 in' },
        { value: 20, name: '22 in' },
        { value: 21, name: '24 in' },
        { value: 22, name: '30 in' },
        { value: 23, name: '32 in' },
        { value: 24, name: '34 in' },
        { value: 25, name: '36 in' },
        { value: 26, name: '42 in' }
      ];
    } else {
      this.npsList = [
        { value: 0, name: '8 mm' },
        { value: 1, name: '15 mm' },
        { value: 2, name: '20 mm' },
        { value: 3, name: '25 mm' },
        { value: 4, name: '32 mm' },
        { value: 5, name: '40 mm' },
        { value: 6, name: '50 mm' },
        { value: 7, name: '65 mm' },
        { value: 8, name: '80 mm' },
        { value: 9, name: '90 mm' },
        { value: 10, name: '100 mm' },
        { value: 11, name: '125 mm' },
        { value: 12, name: '150 mm' },
        { value: 13, name: '200 mm' },
        { value: 14, name: '250 mm' },
        { value: 15, name: '300 mm' },
        { value: 16, name: '350 mm' },
        { value: 17, name: '400 mm' },
        { value: 18, name: '450 mm' },
        { value: 19, name: '500 mm' },
        { value: 20, name: '550 mm' },
        { value: 21, name: '600 mm' },
        { value: 22, name: '750 mm' },
        { value: 23, name: '800 mm' },
        { value: 24, name: '850 mm' },
        { value: 25, name: '900 mm' },
        { value: 26, name: '1050 mm' }
      ];
    }
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }

  focusOut() {
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.pipeInsulationReductionService.operatingHours = oppHours;
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
