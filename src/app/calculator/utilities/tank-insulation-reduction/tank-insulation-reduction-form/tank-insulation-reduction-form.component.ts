import { Component, OnInit, EventEmitter, Output, Input, ViewChild, HostListener, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { TankInsulationReductionService } from '../tank-insulation-reduction.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-tank-insulation-reduction-form',
  templateUrl: './tank-insulation-reduction-form.component.html',
  styleUrls: ['./tank-insulation-reduction-form.component.css']
})
export class TankInsulationReductionFormComponent implements OnInit {
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
  form: FormGroup;

  formWidth: number;
  showOperatingHoursModal: boolean;
  tankThicknessWarning: string = null;
  insulationThicknessWarning: string = null;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  utilityOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Natural Gas' },
    { value: 1, name: 'Other' }
  ];

  tankMaterials: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Aluminum Oxide' },
    { value: 1, name: 'Aluminum, new, bright' },
    { value: 2, name: 'Carbon Steel, max 0.5% C' },
    { value: 3, name: 'Carbon Steel, max 1.5% C' },
    { value: 4, name: 'Iron' },
    { value: 5, name: 'Iron, cast' },
    { value: 6, name: 'Stainless Steel' },
    { value: 7, name: 'Steel, Carbon 1%' },
  ];

  insulationMaterials: Array<{ value: number, name: string }> = [
    { value: 0, name: 'None' },
    { value: 1, name: 'Custom Input' },
    { value: 2, name: '1000F Mineral Fiber Blanket, Type V' },
    { value: 3, name: '1000F Mineral Fiber Board, Type III' },
    { value: 4, name: '1000F Min.Fiber Pipe and Tank, Type IV' },
    { value: 5, name: '1200F Mineral Fiber Blanket, Type VII' },
    { value: 6, name: '1200F Mineral Fiber  Board, Type IVB' },
    { value: 7, name: '1800F Mineral Fiber  Board, Type V' },
    { value: 8, name: '450F Mineral Fiber  Blanket, Type II' },
    { value: 9, name: '450F Mineral Fiber  Board, Type IB' },
    { value: 10, name: '850F Mineral Fiber  Blanket, Type IV' },
    { value: 11, name: '850F MF Board, Type II' },
    { value: 12, name: 'Air, athmosphere (gas)' },
    { value: 13, name: 'Asbestos-cement' },
    { value: 14, name: 'Asbestos-cement board' },
    { value: 15, name: 'Asbestos-cement sheets' },
    { value: 16, name: 'Asphalt' },
    { value: 17, name: 'Cellular Glass,Type II, PIPE and TUBE' },
    { value: 18, name: 'Cement plaster, sand aggregate' },
    { value: 19, name: 'Concrete, dense' },
    { value: 20, name: 'Concrete, lightweight' },
    { value: 21, name: 'Concrete, medium' },
    { value: 22, name: 'Fibreglass' },
    { value: 23, name: 'Finish CEMENT, C449-07' },
    { value: 24, name: 'Flexible Aerogel,Type III, Gr 1 Blanket' },
    { value: 25, name: 'Foam glass' },
    { value: 26, name: 'Glass Fiber Felt' },
    { value: 27, name: 'Gypsum plaster, sand aggregate' },
    { value: 28, name: 'Gypsum plaster, vericulite aggregate' },
    { value: 29, name: 'High Temp Fiber BLANKET, Gr 6' },
    { value: 30, name: 'MF Insulating CEMENT' },
    { value: 31, name: 'MF Metal Mesh BLANKET, Type II' },
    { value: 32, name: 'Polystyrene BOARD, Type IV, C578-11b' },
    { value: 33, name: 'PVC' },
    { value: 34, name: 'Straw slab insulation, compressed' },
    { value: 35, name: 'Styrofoam' },
    { value: 36, name: 'Vinyl ester' }
  ];

  jacketMaterials: Array<{ value: number, name: string }> = [
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

  idString: string;
  isEditingName: boolean = false;

  constructor(private tankInsulationReductionService: TankInsulationReductionService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline';
    }
    else {
      this.idString = 'modification';
    }
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
  }

  changeUtilityType() {
    let tmpCost;
    if (this.form.controls.utilityType.value == 0) {
      if (this.isBaseline == true) {
        tmpCost = this.tankInsulationReductionService.baselineData.naturalGasUtilityCost;
      } else {
        tmpCost = this.tankInsulationReductionService.modificationData.naturalGasUtilityCost;
      }
    }
    else {
      if (this.isBaseline == true) {
        tmpCost = this.tankInsulationReductionService.baselineData.otherUtilityCost;
      } else {
        tmpCost = this.tankInsulationReductionService.modificationData.otherUtilityCost;
      }
    }
    this.form.controls.utilityCost.setValue(tmpCost);
    this.calculate();
  }

  changeInsulationMaterial() {
    if (this.form.controls.insulationMaterialSelection.value == 0) {
      this.form.controls.jacketMaterialSelection.patchValue(0);
      this.form.controls.jacketMaterialSelection.disable();
    } else {
      this.form.controls.jacketMaterialSelection.enable();
    }
    this.calculate();
  }

  calculate() {
    this.checkWarnings();
    if (this.form.valid) {
      if (this.isBaseline == true) {
        this.tankInsulationReductionService.baselineData = this.tankInsulationReductionService.getObjFromForm(this.form, this.tankInsulationReductionService.baselineData, this.settings);
        this.emitCalculate.emit(true);
      } else {
        this.tankInsulationReductionService.modificationData = this.tankInsulationReductionService.getObjFromForm(this.form, this.tankInsulationReductionService.modificationData, this.settings);
        this.emitCalculate.emit(true);
      }
    }
  }

  convertConductivity(val: number): number {
    return this.convertUnitsService.value(val).from('Btu/hr-ft-R').to('W/mK');
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
    this.tankInsulationReductionService.operatingHours = oppHours;
    this.form.controls.operatingHours.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  checkWarnings() {
    this.tankThicknessWarning = this.tankInsulationReductionService.checkTankThickness(this.form.controls.tankThickness.value, this.settings);
    this.insulationThicknessWarning = this.tankInsulationReductionService.checkInsulationThickness(this.form.controls.insulationThickness.value, this.settings);
  }
}
