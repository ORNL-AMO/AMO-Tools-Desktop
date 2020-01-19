import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { OperationsCompareService } from '../operations-compare.service';
import { FormGroup } from '@angular/forms';
import { OperationsService, OperationsWarnings } from '../operations.service';
import { OperatingHours } from '../../../../shared/models/operations';
import { PHAST } from '../../../../shared/models/phast/phast';
import { LossesService } from '../../losses.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-operations-form',
  templateUrl: './operations-form.component.html',
  styleUrls: ['./operations-form.component.css']
})
export class OperationsFormComponent implements OnInit {
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  operationsForm: FormGroup;
  @Input()
  baselineSelected: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

  @ViewChild('lossForm', { static: false }) lossForm: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;

  warnings: OperationsWarnings;
  idString: string;
  constructor(private operationsCompareService: OperationsCompareService, private operationsService: OperationsService, private lossesService: LossesService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = '_modification';
    }
    else {
      this.idString = '_baseline';
    }
    this.checkWarnings();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  focusOut() {
    this.changeField.emit('default');
  }

  checkWarnings() {
    let tmpHours: OperatingHours = this.operationsService.getOperatingDataFromForm(this.operationsForm).hours;
    this.warnings = this.operationsService.checkWarnings(tmpHours);
  }

  save() {
    this.checkWarnings();
    this.saveEmit.emit(true);
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.lossesService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.lossesService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.phast.operatingHours = oppHours;
    this.operationsForm.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.lossForm.nativeElement.clientWidth) {
      this.formWidth = this.lossForm.nativeElement.clientWidth;
    }
  }

  canCompare() {
    if (this.operationsCompareService.baseline && this.operationsCompareService.modification) {
      return true;
    } else {
      return false;
    }
  }

  compareHoursPerYear(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareHoursPerYear();
    } else {
      return false;
    }
  }
  compareFuelCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareFuelCost();
    } else {
      return false;
    }
  }
  compareSteamCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareSteamCost();
    } else {
      return false;
    }
  }
  compareElectricityCost(): boolean {
    if (this.canCompare()) {
      return this.operationsCompareService.compareElectricityCost();
    } else {
      return false;
    }
  }
}
