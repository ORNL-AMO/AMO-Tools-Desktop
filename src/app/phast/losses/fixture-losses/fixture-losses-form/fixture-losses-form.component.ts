import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { FixtureLossesCompareService } from "../fixture-losses-compare.service";
@Component({
  selector: 'app-fixture-losses-form',
  templateUrl: './fixture-losses-form.component.html',
  styleUrls: ['./fixture-losses-form.component.css']
})
export class FixtureLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossState: any;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;
  constructor(private windowRefService: WindowRefService, private fixtureLossesCompareService: FixtureLossesCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      if (!this.baselineSelected) {
        this.disableForm();
      } else {
        this.enableForm();
      }
    } else {
      this.firstChange = false;
    }
  }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  disableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }

  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }

  checkForm() {
    this.lossState.saved = false;
    if (this.lossesForm.status == 'VALID') {
      this.calculate.emit(true);
    }
  }


  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
  }

  initDifferenceMonitor() {
    if (this.fixtureLossesCompareService.baselineFixtureLosses && this.fixtureLossesCompareService.modifiedFixtureLosses && this.fixtureLossesCompareService.differentArray.length != 0) {
      let doc = this.windowRefService.getDoc();
      //materialName
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.materialName.subscribe((val) => {
        let materialNameElements = doc.getElementsByName('materialName_' + this.lossIndex);
        materialNameElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //specificHeat
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.specificHeat.subscribe((val) => {
        let specificHeatElements = doc.getElementsByName('specificHeat_' + this.lossIndex);
        specificHeatElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //feedRate
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.feedRate.subscribe((val) => {
        let feedRateElements = doc.getElementsByName('feedRate_' + this.lossIndex);
        feedRateElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //initialTemp
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.initialTemperature.subscribe((val) => {
        let initialTempElements = doc.getElementsByName('initialTemp_' + this.lossIndex);
        initialTempElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //finalTemp
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.finalTemperature.subscribe((val) => {
        let finalTempElements = doc.getElementsByName('finalTemp_' + this.lossIndex);
        finalTempElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
      //correctionFactor
      this.fixtureLossesCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
        let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
        correctionFactorElements.forEach(element => {
          element.classList.toggle('indicate-different', val);
        });
      })
    }
  }
}
