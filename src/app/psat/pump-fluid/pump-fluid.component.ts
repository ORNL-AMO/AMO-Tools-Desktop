import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { PsatService } from '../psat.service';
import { PSAT, PsatInputs } from '../../shared/models/psat';
import { Settings } from '../../shared/models/settings';
import { CompareService } from '../compare.service';
import { WindowRefService } from '../../indexedDb/window-ref.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
@Component({
  selector: 'app-pump-fluid',
  templateUrl: './pump-fluid.component.html',
  styleUrls: ['./pump-fluid.component.css']
})
export class PumpFluidComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  saveClicked: boolean;
  @Output('saved')
  saved = new EventEmitter<boolean>();
  @Output('isValid')
  isValid = new EventEmitter<boolean>();
  @Output('isInvalid')
  isInvalid = new EventEmitter<boolean>();
  @Input()
  selected: boolean;
  @Input()
  settings: Settings;
  @Input()
  baseline: boolean;

  @ViewChild('formRef') formRef: ElementRef;
  elements: any;

  counter: any;

  formValid: boolean;
  pumpTypes: Array<string> = [
    'End Suction Slurry',
    'End Suction Sewage',
    'End Suction Stock',
    'End Suction Submersible Sewage',
    'API Double Suction',
    'Multistage Boiler Feed',
    'End Suction ANSI/API',
    'Axial Flow',
    'Double Suction',
    'Vertical Turbine',
    'Large End Suction',
    // When user selects below they need a way to provide the optimal efficiency
    'Specified Optimal Efficiency'
  ];

  drives: Array<string> = [
    'Direct Drive',
    'Belt Drive'
  ];
  psatForm: any;
  isFirstChange: boolean = true;
  rpmError: string = null;
  different: any = {
    pumpRPM: null
  }
  constructor(private psatService: PsatService, private compareService: CompareService, private windowRefService: WindowRefService, private helpPanelService: HelpPanelService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isFirstChange) {
      if (changes.saveClicked) {
        this.savePsat(this.psatForm);
      }
      if (!this.selected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
      this.setCompareVals();
    }
    else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.psatForm = this.psatService.getFormFromPsat(this.psat.inputs);
    this.checkForm(this.psatForm);
    if (this.selected) {
      this.formRef.nativeElement.pumpType.focus();
    }
  }

  ngAfterViewInit() {
    if (!this.selected) {
      this.disableForm();
    }
    this.setCompareVals();
    this.initDifferenceMonitor();
  }

  disableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.formRef.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  addNum(str: string) {
    if (str == 'stages') {
      this.psatForm.value.stages++;
    }
    this.checkForm(this.psatForm);
  }

  subtractNum(str: string) {
    if (str == 'stages') {
      if (this.psatForm.value.stages != 0) {
        this.psatForm.value.stages--;
      }
    }
    this.checkForm(this.psatForm);
  }

  focusField(str: string) {
    // if (str == 'fixedSpecificSpeed') {
    //   this.startSavePolling();
    // }
    this.helpPanelService.currentField.next(str);
    this.checkForm(this.psatForm);
  }

  checkForm(form: any) {
    this.formValid = this.psatService.isPumpFluidFormValid(form);
    if (this.formValid) {
      this.isValid.emit(true)
    } else {
      this.isInvalid.emit(true)
    }
  }

  savePsat(form: any) {
    this.psat.inputs = this.psatService.getPsatInputsFromForm(form);
    this.setCompareVals();
    this.saved.emit(this.selected);
  }

  setCompareVals() {
    if (this.baseline) {
      this.compareService.baselinePSAT = this.psat;
    } else {
      this.compareService.modifiedPSAT = this.psat;
    }
    this.compareService.checkPumpDifferent();
  }

  checkPumpRpm(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    let min = 0;
    let max = 0;
    if (this.psatForm.value.drive == 'Direct Drive') {
      min = 540;
      max = 3960;
    } else if (this.psatForm.value.drive == 'Belt Drive') {
      //TODO UPDATE WITH BELT DRIVE VALS
      min = 1;
      max = Infinity;
    }
    if (this.psatForm.value.pumpRPM < min) {
      this.rpmError = 'Value is too small';
      return false;
    } else if (this.psatForm.value.pumpRPM > max) {
      this.rpmError = 'Value is too large';
      return false;
    } else if (this.psatForm.value.pumpRPM >= min && this.psatForm.value.pumpRPM <= max) {
      this.rpmError = null;
      return true;
    } else {
      this.rpmError = null;
      return null;
    }
  }


  startSavePolling() {
    this.checkForm(this.psatForm);
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.savePsat(this.psatForm)
    }, 3000)
  }

  //used to add classes to inputs with different baseline vs modification values
  initDifferenceMonitor() {
    let doc = this.windowRefService.getDoc();
    //pump style
    this.compareService.pump_style_different.subscribe((val) => {
      let pumpStyleElements = doc.getElementsByName('pumpType');
      pumpStyleElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //pump specified
    this.compareService.pump_specified_different.subscribe((val) => {
      let specifiedPumpTypeElements = doc.getElementsByName('specifiedPumpType');
      specifiedPumpTypeElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    })
    //pump rated speed
    this.compareService.pump_rated_speed_different.subscribe((val) => {
      let pumpRpmElements = doc.getElementsByName('pumpRPM');
      pumpRpmElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });

    //drive
    this.compareService.drive_different.subscribe((val) => {
      let driveElements = doc.getElementsByName('drive');
      driveElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //kinematic viscosity
    // this.compareService.kinematic_viscosity_different.subscribe((val) => {
    //   let viscosityElements = doc.getElementsByName('viscosity');
    //   viscosityElements.forEach(element => {
    //     element.classList.toggle('indicate-different', val);
    //   });
    // });
    //specific gravity
    this.compareService.specific_gravity_different.subscribe((val) => {
      let gravityElements = doc.getElementsByName('gravity');
      gravityElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //stages
    this.compareService.stages_different.subscribe((val) => {
      let stagesElements = doc.getElementsByName('stages');
      stagesElements.forEach(element => {
        element.classList.toggle('indicate-different', val);
      });
    });
    //fixed speed
    // this.compareService.fixed_speed_different.subscribe((val) => {
    //   let fixedSpeedElements = doc.getElementsByName('fixedSpeed');
    //   fixedSpeedElements.forEach(element => {
    //     element.classList.toggle('indicate-different', val);
    //   });
    // });
  }


}


