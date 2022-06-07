import { Component, OnInit, HostListener, ViewChild, ElementRef, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { ReceiverTankInputs, ReceiverTankService } from './receiver-tank.service';
import { Subscription } from 'rxjs';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Router } from '@angular/router';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';

@Component({
  selector: 'app-receiver-tank',
  templateUrl: './receiver-tank.component.html',
  styleUrls: ['./receiver-tank.component.css']
})
export class ReceiverTankComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  calcType: string;
  @Input()
  assessment: Assessment;

  saving: boolean;
  assessmentCalculator: Calculator;
  receiverTankInputsSub: Subscription;
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  methods: Array<{ name: string, value: number }> = [
    {
      name: 'General',
      value: 0
    },
    {
      name: 'Dedicated Storage',
      value: 1
    },
    {
      name: 'Metered Storage',
      value: 2
    },
    {
      name: 'Bridging Compressor Reaction Delay',
      value: 3
    }
  ];
  currentField: string;
  currentFieldSub: Subscription;
  constructor(public receiverTankService: ReceiverTankService, 
    private calculatorDbService: CalculatorDbService,
    private settingsDbService: SettingsDbService, private router: Router) {
  }

  ngOnInit() {
    this.calculatorDbService.isSaving = false;
    if (this.calcType == undefined) {
      this.setCalcType();
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.currentFieldSub = this.receiverTankService.currentField.subscribe(val => {
      this.currentField = val;
    });

    if (this.assessment) {
      this.getCalculatorForAssessment();
      this.receiverTankService.setAssessmentCalculatorSubject();
      this.receiverTankInputsSub = this.receiverTankService.inputs.subscribe(inputs=> {
        if (this.assessmentCalculator.id) {
          this.updateAssessmentCalculator(inputs);
        }
      });
    }
      
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
    if (this.assessment) {
      this.receiverTankInputsSub.unsubscribe();
    }
  }

  setCalcType() {
    if (this.router.url.indexOf('usable-air') != -1) {
      this.calcType = 'usable-air';
    } else {
      this.calcType = 'size-calculations';
    }
  }

  async updateAssessmentCalculator(updatedInputs: ReceiverTankInputs) {
    if (updatedInputs.airCapacityInputs) {
      this.assessmentCalculator.receiverTankInput.airCapacityInputs = updatedInputs.airCapacityInputs;
    }
    if (updatedInputs.bridgeCompressorInputs) {
      this.assessmentCalculator.receiverTankInput.bridgeCompressorInputs = updatedInputs.bridgeCompressorInputs;
    }
    if (updatedInputs.generalMethodInputs) {
      this.assessmentCalculator.receiverTankInput.generalMethodInputs = updatedInputs.generalMethodInputs;
    }
    if (updatedInputs.dedicatedStorageInputs) {
      this.assessmentCalculator.receiverTankInput.dedicatedStorageInputs = updatedInputs.dedicatedStorageInputs;
    }
    if (updatedInputs.airCapacityInputs) {
      this.assessmentCalculator.receiverTankInput.meteredStorageInputs = updatedInputs.meteredStorageInputs;
    }
    await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
  }

  async getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if (this.assessmentCalculator) {
      if (this.assessmentCalculator.receiverTankInput) {

        if (this.assessmentCalculator.receiverTankInput.dedicatedStorageInputs) {
          this.receiverTankService.dedicatedStorageInputs = this.assessmentCalculator.receiverTankInput.dedicatedStorageInputs;
        }
        if (this.assessmentCalculator.receiverTankInput.meteredStorageInputs) {
          this.receiverTankService.meteredStorageInputs = this.assessmentCalculator.receiverTankInput.meteredStorageInputs;
        }
        if (this.assessmentCalculator.receiverTankInput.generalMethodInputs) {
          this.receiverTankService.generalMethodInputs = this.assessmentCalculator.receiverTankInput.generalMethodInputs;
        }
        if (this.assessmentCalculator.receiverTankInput.bridgeCompressorInputs) {
          this.receiverTankService.bridgeCompressorInputs = this.assessmentCalculator.receiverTankInput.bridgeCompressorInputs;
        }
        if (this.assessmentCalculator.receiverTankInput.airCapacityInputs) {
          this.receiverTankService.airCapacityInputs = this.assessmentCalculator.receiverTankInput.airCapacityInputs;
        }
      } else {
        this.assessmentCalculator.receiverTankInput = this.getCurrentInputs();
      }
    } else {
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      await this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let receiverTankInput = this.getCurrentInputs();
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      receiverTankInput: receiverTankInput
    };
    return tmpCalculator;
  }

  getCurrentInputs() {
    let dedicatedStorageInputs = this.receiverTankService.dedicatedStorageInputs;
    let airCapacityInputs = this.receiverTankService.airCapacityInputs;
    let generalMethodInputs = this.receiverTankService.generalMethodInputs;
    let meteredStorageInputs = this.receiverTankService.meteredStorageInputs;
    let bridgeCompressorInputs = this.receiverTankService.bridgeCompressorInputs;
    return {
      dedicatedStorageInputs: dedicatedStorageInputs,
      airCapacityInputs: airCapacityInputs,
      generalMethodInputs: generalMethodInputs,
      meteredStorageInputs: meteredStorageInputs,
      bridgeCompressorInputs: bridgeCompressorInputs,
    }
  }


  btnResetData() {
    if (this.calcType == 'size-calculations') {
      this.receiverTankService.setDefaults();
    } else if (this.calcType == 'usable-air') {
      this.receiverTankService.setAirCapacityDefault();
    }
    this.receiverTankService.setForm.next(true);
  }

  btnGenerateExample() {
    if (this.calcType == 'size-calculations') {
      this.receiverTankService.setExampleData(this.settings);
    } else if (this.calcType == 'usable-air') {
      this.receiverTankService.setAirCapacityExample(this.settings);
    }
    this.receiverTankService.setForm.next(true);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }
}
