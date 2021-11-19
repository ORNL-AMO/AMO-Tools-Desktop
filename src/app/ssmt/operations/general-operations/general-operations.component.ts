import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { CompareService } from '../../compare.service';
import { SsmtService } from '../../ssmt.service';
import { FormGroup } from '@angular/forms';
import { SSMT } from '../../../shared/models/steam/ssmt';
import { OperatingHours } from '../../../shared/models/operations';
import { OperationsService } from '../operations.service';

@Component({
  selector: 'app-general-operations',
  templateUrl: './general-operations.component.html',
  styleUrls: ['./general-operations.component.css']
})
export class GeneralOperationsComponent implements OnInit {
  @Input()
  form: FormGroup;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  idString: string;
  @Input()
  ssmt: SSMT;
  @Input()
  isBaseline: boolean;

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  formWidth: number;
  showOperatingHoursModal: boolean = false;
  constructor(private operationsService: OperationsService, private ssmtService: SsmtService, private compareService: CompareService) { }

  ngOnInit() {
    console.log(this.form);
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.setOpHoursModalWidth();
    }, 100)
  }

  save() {
    this.form = this.operationsService.setMakeUpTempValidators(this.form, this.ssmt)
    this.emitSave.emit(true);
  }

  canCompare() {
    if (this.compareService.baselineSSMT && this.compareService.modifiedSSMT && !this.inSetup) {
      return true;
    } else {
      return false;
    }
  }

  //unused site power import is calculated for modifications
  // isSitePowerImportDifferent() {
  //   if (this.canCompare()) {
  //     return this.compareService.isSitePowerImportDifferent();
  //   } else {
  //     return false;
  //   }
  // }
  isMakeUpWaterTemperatureDifferent() {
    if (this.canCompare()) {
      return this.compareService.isMakeUpWaterTemperatureDifferent();
    } else {
      return false;
    }
  }

  isHoursPerYearDifferent() {
    if (this.canCompare()) {
      return this.compareService.isHoursPerYearDifferent();
    } else {
      return false;
    }
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }
  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
    this.ssmtService.modalOpen.next(false);
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
    this.ssmtService.modalOpen.next(true);
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.ssmt.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setOpHoursModalWidth() {
    if (this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }
}
