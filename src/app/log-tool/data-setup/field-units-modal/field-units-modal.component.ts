import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { LogToolField } from '../../log-tool-models';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { measurementOptions } from './field-unit-options';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';

@Component({
    selector: 'app-field-units-modal',
    templateUrl: './field-units-modal.component.html',
    styleUrls: ['./field-units-modal.component.css'],
    standalone: false
})
export class FieldUnitsModalComponent implements OnInit {
  @Input()
  editField: LogToolField;
  @Output('emitClose')
  emitClose = new EventEmitter<boolean>();

  @ViewChild('editModal', { static: false }) public editModal: ModalDirective;

  measurementOptions: Array<{ measure: string, display: string }>;
  selectedMeasure: string;
  unitOptions: Array<{ unit: any, display: string, displayUnit: string }>;
  editFieldUnit: string;
  constructor(private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.measurementOptions = measurementOptions;
    if (this.editField.unit) {
      this.editFieldUnit = this.editField.unit;
      let selectedUnit = this.convertUnitsService.getUnit(this.editField.unit);
      if (selectedUnit.measure) {
        this.selectedMeasure = selectedUnit.measure;
        this.setUnitOptions();
      }
    }
  }

  ngAfterViewInit() {
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
    this.editModal.onHidden.subscribe(val => {
      this.emitClose.emit(true);
    })
  }

  setUnitOptions() {
    if (this.selectedMeasure) {
      this.unitOptions = new Array();
      let tmpList = this.convertUnitsService.possibilities(this.selectedMeasure);
      tmpList.forEach(unit => {
        let tmpPossibility = {
          unit: unit,
          display: this.getUnitName(unit),
          displayUnit: this.getUnitDisplay(unit)
        };
        this.unitOptions.push(tmpPossibility);
      });
      this.editFieldUnit = this.unitOptions[0].unit;
    }
  }

  setUnit() {
    this.editField.unit = this.editFieldUnit;
    this.hideEditModal();
  }
  
  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }
  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }
}
