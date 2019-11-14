import { Component, OnInit, Input, EventEmitter, Output, ViewChild, HostListener, ElementRef, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { PipeInsulationReductionInput, PipeInsulationReductionResult } from '../../../../shared/models/standalone';
import { FormGroup } from '@angular/forms';
import { PipeInsulationReductionService } from '../pipe-insulation-reduction.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-pipe-insulation-reduction-form',
  templateUrl: './pipe-insulation-reduction-form.component.html',
  styleUrls: ['./pipe-insulation-reduction-form.component.css']
})
export class PipeInsulationReductionFormComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  data: PipeInsulationReductionInput;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<PipeInsulationReductionInput>();
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
  updateForm: boolean;

  formWidth: number;
  showOperatingHoursModal: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  utilityOptions: Array<{ value: number, name: string }> = [
    { value: 0, name: 'Natural Gas' },
    { value: 1, name: 'Other' }
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

  npsList: Array<{ value: number, name: string }>;

  idString: string;
  individualResults: PipeInsulationReductionResult;
  isEditingName: boolean = false;
  form: FormGroup;

  constructor(private pipeInsulationReductionService: PipeInsulationReductionService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline';
    }
    else {
      this.idString = 'modification';
    }
    this.initNpsList();
    this.form = this.pipeInsulationReductionService.getFormFromObj(this.data, this.isBaseline);
    if (this.selected == false) {
      this.form.disable();
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

    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
        if (!this.isBaseline) {
          this.form.controls.utilityType.disable();
          this.form.controls.utilityCost.disable();
        }
      }
    }

    if (changes.updateForm && !changes.updateForm.firstChange) {
      this.form = this.pipeInsulationReductionService.getFormFromObj(this.data, this.isBaseline);
      this.calculate();
    }
  }

  changeUtilityType() {
    let tmpCost;
    if (this.form.controls.utilityType.value == 0) {
      tmpCost = this.data.naturalGasUtilityCost;
    }
    else {
      tmpCost = this.data.otherUtilityCost;
    }
    this.form.controls.utilityCost.setValue(tmpCost);
    this.calculate();
  }

  calculate() {
    if (this.form.valid) {
      let tmpObj = this.pipeInsulationReductionService.getObjFromForm(this.form, this.data);
      this.data = tmpObj;
      this.emitCalculate.emit(tmpObj);
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
