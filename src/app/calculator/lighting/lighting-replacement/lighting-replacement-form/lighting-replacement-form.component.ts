import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, SimpleChanges, HostListener } from '@angular/core';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { FormGroup } from '@angular/forms';
import { LightingReplacementService } from '../lighting-replacement.service';
import { OperatingHours } from '../../../../shared/models/operations';

@Component({
  selector: 'app-lighting-replacement-form',
  templateUrl: './lighting-replacement-form.component.html',
  styleUrls: ['./lighting-replacement-form.component.css']
})
export class LightingReplacementFormComponent implements OnInit {
  @Input()
  data: LightingReplacementData;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<LightingReplacementData>();
  @Output('emitRemoveFixture')
  emitRemoveFixture = new EventEmitter<number>();
  @Input()
  index: number;
  @Output('emitFocusField')
  emitFocusField = new EventEmitter<string>();
  @Input()
  isBaseline: boolean;
  @Input()
  selected: boolean;

  @ViewChild('formElement') formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;

  idString: string;
  isEditingName: boolean = false;
  form: FormGroup;

  showOperatingHoursModal: boolean;

  constructor(private lightingReplacementService: LightingReplacementService) { }

  ngOnInit() {
    if (this.isBaseline) {
      this.idString = 'baseline_' + this.index;
    }
    else {
      this.idString = 'modification_' + this.index;
    }
    this.form = this.lightingReplacementService.getFormFromObj(this.data);
    if (this.selected == false) {
      this.form.disable();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selected && !changes.selected.firstChange) {
      if (this.selected == false) {
        this.form.disable();
      } else {
        this.form.enable();
      }
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  calculate() {
    let tmpObj: LightingReplacementData = this.lightingReplacementService.getObjFromForm(this.form);
    this.emitCalculate.emit(tmpObj);
  }

  focusField(str: string) {
    this.emitFocusField.emit(str);
  }

  removeFixture() {
    this.emitRemoveFixture.emit(this.index);
  }

  editFixtureName() {
    this.isEditingName = true;
  }

  doneEditingName() {
    this.isEditingName = false;
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
    this.lightingReplacementService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.calculate();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
