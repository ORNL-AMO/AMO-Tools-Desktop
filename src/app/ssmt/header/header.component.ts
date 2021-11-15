import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure, BoilerInput, SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { HeaderService, HeaderRanges } from './header.service';
import { SsmtService } from '../ssmt.service';
import { GreaterThanValidator } from '../../shared/validators/greater-than';
import { LessThanValidator } from '../../shared/validators/less-than';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input()
  headerInput: HeaderInput;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<HeaderInput>();
  @Input()
  inSetup: boolean;
  @Input()
  selected: boolean;
  @Input()
  modificationExists: boolean;
  @Input()
  isBaseline: boolean;
  @Input()
  modificationIndex: number;
  @Input()
  boilerInput: BoilerInput;
  @Input()
  ssmt: SSMT;

  highPressureForm: FormGroup;
  mediumPressureForm: FormGroup;
  lowPressureForm: FormGroup;
  idString: string = 'baseline_';
  constructor(private headerService: HeaderService, private ssmtService: SsmtService) { }

  ngOnInit() {
    if (!this.isBaseline) {
      this.idString = 'modification_';
    }
    if (!this.headerInput) {
      this.headerInput = this.headerService.initHeaderDataObj();
    }
    this.initForms();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modificationIndex && !changes.modificationIndex.isFirstChange()) {
      this.initForms();
    }
  }

  initForms() {
    let minHighPressure: number;
    if (this.headerInput.numberOfHeaders == 1) {
      minHighPressure = this.boilerInput.deaeratorPressure;
    }
    if (this.headerInput.highPressureHeader) {
      this.highPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.settings, this.boilerInput, minHighPressure);
    }
    else {
      this.highPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.boilerInput, minHighPressure);
    }

    if (this.headerInput.mediumPressureHeader) {
      let min: number;
      let max: number;
      if (this.headerInput.lowPressureHeader) {
        min = this.headerInput.lowPressureHeader.pressure;
      }
      if (this.headerInput.highPressureHeader) {
        max = this.headerInput.highPressureHeader.pressure;
      }
      this.mediumPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.mediumPressureHeader, this.settings, min, max);
    } else {
      this.mediumPressureForm = this.headerService.initHeaderForm(this.settings, this.isBaseline);
    }

    if (this.headerInput.lowPressureHeader) {
      let pressureMax: number;
      if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader) {
        pressureMax = this.headerInput.mediumPressureHeader.pressure;
      } else if (this.headerInput.highPressureHeader) {
        pressureMax = this.headerInput.highPressureHeader.pressure;
      }
      this.lowPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressureHeader, this.settings, this.boilerInput.deaeratorPressure, pressureMax);
    } else {
      this.lowPressureForm = this.headerService.initHeaderForm(this.settings, this.isBaseline, this.boilerInput.deaeratorPressure);
    }
  }

  changeNumberOfHeaders() {
    this.save();
    this.initForms();
  }

  focusField(str: string) {
    this.ssmtService.currentField.next(str);
  }

  focusOut() {
    this.ssmtService.currentField.next('default');
  }

  save() {
    this.emitSave.emit(this.headerInput);
    this.updatePressureMaxMins();
  }

  saveHighPressure(header: HeaderWithHighestPressure) {
    this.headerInput.highPressureHeader = header;
    this.save();
  }

  saveMediumPressure(header: HeaderNotHighestPressure) {
    this.headerInput.mediumPressureHeader = header;
    this.save();
  }

  saveLowPressure(header: HeaderNotHighestPressure) {
    this.headerInput.lowPressureHeader = header;
    this.save();
  }


  updatePressureMaxMins() {
    let pressureMax: number;
    if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader) {
      pressureMax = this.headerInput.mediumPressureHeader.pressure;
    } else if (this.headerInput.numberOfHeaders != 3 && this.headerInput.highPressureHeader) {
      pressureMax = this.headerInput.highPressureHeader.pressure;
    }
    let ranges: HeaderRanges = this.headerService.getRanges(this.settings, undefined, this.boilerInput.deaeratorPressure, pressureMax);
    this.lowPressureForm.controls.pressure.setValidators([Validators.required, LessThanValidator.lessThan(ranges.pressureMax), GreaterThanValidator.greaterThan(ranges.pressureMin)]);
    this.lowPressureForm.controls.pressure.updateValueAndValidity();
    let mediumPressureMin: number;
    let mediumPressureMax: number;
    if (this.headerInput.lowPressureHeader) {
      mediumPressureMin = this.headerInput.lowPressureHeader.pressure;
    }
    if (this.headerInput.highPressureHeader) {
      mediumPressureMax = this.headerInput.highPressureHeader.pressure;
    }
    ranges = this.headerService.getRanges(this.settings, undefined, mediumPressureMin, mediumPressureMax);
    this.mediumPressureForm.controls.pressure.setValidators([Validators.required, LessThanValidator.lessThan(ranges.pressureMax), GreaterThanValidator.greaterThan(ranges.pressureMin)]);
    this.mediumPressureForm.controls.pressure.updateValueAndValidity();

  }
}
