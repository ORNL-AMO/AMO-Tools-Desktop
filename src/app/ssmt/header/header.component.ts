import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { HeaderInput, HeaderWithHighestPressure, HeaderNotHighestPressure, BoilerInput, SSMT } from '../../shared/models/steam/ssmt';
import { Settings } from '../../shared/models/settings';
import { HeaderService } from './header.service';
import { SsmtService } from '../ssmt.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
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
  ssmt: SSMT;

  headerInput: HeaderInput;
  boilerInput: BoilerInput;
  highPressureForm: UntypedFormGroup;
  mediumPressureForm: UntypedFormGroup;
  lowPressureForm: UntypedFormGroup;
  idString: string = 'baseline_';
  constructor(private headerService: HeaderService,
    private cd: ChangeDetectorRef, private ssmtService: SsmtService) { }

  ngOnInit() {
    this.boilerInput = this.ssmt.boilerInput;
    this.headerInput = this.ssmt.headerInput;
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
    this.setHighPressureForm();
    this.setMediumPressureForm();
    this.setLowPressureForm();
  }

  setHighPressureForm() {
    let minHighPressure: number;
    if (this.headerInput.numberOfHeaders == 1) {
      minHighPressure = this.boilerInput.deaeratorPressure;
    } else if (this.headerInput.numberOfHeaders == 2 && this.headerInput.lowPressureHeader && this.headerInput.lowPressureHeader.pressure) {
      minHighPressure = this.headerInput.lowPressureHeader.pressure;
    } else if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader && this.headerInput.mediumPressureHeader.pressure) {
      minHighPressure = this.headerInput.mediumPressureHeader.pressure;
    }

    if (this.headerInput.highPressureHeader) {
      this.highPressureForm = this.headerService.getHighestPressureHeaderFormFromObj(this.headerInput.highPressureHeader, this.settings, this.boilerInput, minHighPressure);
    }
    else {
      this.highPressureForm = this.headerService.initHighestPressureHeaderForm(this.settings, this.boilerInput, minHighPressure);
    }
  }

  setMediumPressureForm() {
    if (this.headerInput.mediumPressureHeader) {
      let min: number;
      let max: number;
      if (this.headerInput.lowPressureHeader) {
        min = this.headerInput.lowPressureHeader.pressure;
      }
      if (this.headerInput.highPressureHeader) {
        max = this.headerInput.highPressureHeader.pressure;
      }
      this.mediumPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.mediumPressureHeader, this.settings, min, max, this.ssmt.boilerInput.deaeratorPressure);
    } else {
      this.mediumPressureForm = this.headerService.initHeaderForm(this.settings, this.isBaseline, undefined, undefined, this.ssmt.boilerInput.deaeratorPressure);
    }
  }

  setLowPressureForm() {
    if (this.headerInput.lowPressureHeader) {
      let lowPressureMax: number;
      if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader && this.headerInput.mediumPressureHeader.pressure) {
        lowPressureMax = this.headerInput.mediumPressureHeader.pressure;
      } else if (this.headerInput.numberOfHeaders != 3 && this.headerInput.highPressureHeader && this.headerInput.highPressureHeader.pressure) {
        lowPressureMax = this.headerInput.highPressureHeader.pressure;
      }
      this.lowPressureForm = this.headerService.getHeaderFormFromObj(this.headerInput.lowPressureHeader, this.settings, undefined, lowPressureMax, this.ssmt.boilerInput.deaeratorPressure);
    } else {
      this.lowPressureForm = this.headerService.initHeaderForm(this.settings, this.isBaseline, undefined, undefined, this.ssmt.boilerInput.deaeratorPressure);
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
    // on numberOfHeader changes header-form triggers save overlapping with this emit
    this.cd.detectChanges();
    this.updateLowPressureHeaderValidation();
    this.updateMediumPressureHeaderValidation();
    this.updateHighPressureHeaderValidation();
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

  updateLowPressureHeaderValidation() {
    let lowPressureMax: number;
    if (this.headerInput.lowPressureHeader) {
      if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader && this.headerInput.mediumPressureHeader.pressure) {
        lowPressureMax = this.headerInput.mediumPressureHeader.pressure;
      } else if (this.headerInput.numberOfHeaders != 3 && this.headerInput.highPressureHeader && this.headerInput.highPressureHeader.pressure) {
        lowPressureMax = this.headerInput.highPressureHeader.pressure;
      }
      this.headerService.updateNotHighestPressureHeaderForm(this.lowPressureForm, this.settings, undefined, lowPressureMax, this.ssmt.boilerInput.deaeratorPressure);
    }
  }

  updateMediumPressureHeaderValidation() {
    if (this.headerInput.mediumPressureHeader) {
      let mediumPressureMin: number;
      let mediumPressureMax: number;
      if (this.headerInput.lowPressureHeader && this.headerInput.lowPressureHeader.pressure != undefined) {
        mediumPressureMin = this.headerInput.lowPressureHeader.pressure;
      }
      if (this.headerInput.highPressureHeader && this.headerInput.highPressureHeader.pressure) {
        mediumPressureMax = this.headerInput.highPressureHeader.pressure;
      }
      this.headerService.updateNotHighestPressureHeaderForm(this.mediumPressureForm, this.settings, mediumPressureMin, mediumPressureMax, this.ssmt.boilerInput.deaeratorPressure);
    }
  }

  updateHighPressureHeaderValidation() {
    if (this.headerInput.highPressureHeader) {
      let highPressureMin: number;
      if (this.headerInput.numberOfHeaders == 3 && this.headerInput.mediumPressureHeader && this.headerInput.mediumPressureHeader.pressure) {
        highPressureMin = this.headerInput.mediumPressureHeader.pressure;
      } else if (this.headerInput.numberOfHeaders != 3 && this.headerInput.lowPressureHeader && this.headerInput.lowPressureHeader.pressure) {
        highPressureMin = this.headerInput.lowPressureHeader.pressure;
      }
      this.headerService.updateHighestPressureHeaderFormValidation(this.highPressureForm, this.settings, this.boilerInput, highPressureMin);
    }
  }
}
