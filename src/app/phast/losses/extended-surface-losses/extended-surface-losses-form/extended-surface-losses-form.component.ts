import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { ExtendedSurfaceCompareService } from '../extended-surface-compare.service';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-extended-surface-losses-form',
  templateUrl: './extended-surface-losses-form.component.html',
  styleUrls: ['./extended-surface-losses-form.component.css']
})
export class ExtendedSurfaceLossesFormComponent implements OnInit {
  @Input()
  lossesForm: any;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  settings: Settings;

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;
  temperatureError: string = null;
  emissivityError: string = null;
  constructor(private extendedSurfaceCompareService: ExtendedSurfaceCompareService, private windowRefService: WindowRefService) { }

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

  ngOnInit() {
    this.checkEmissivity(true);
    this.checkTemperature(true);
  }

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
    this.calculate.emit(true);
  }

  checkEmissivity(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.value.surfaceEmissivity >> 1) {
      this.emissivityError = 'Surface emissivity cannot be greater than 1';
    } else {
      this.emissivityError = null;
    }
  }

  checkTemperature(bool?: boolean) {
    if (!bool) {
      this.startSavePolling();
    }
    if (this.lossesForm.value.ambientTemp > this.lossesForm.value.avgSurfaceTemp) {
      this.temperatureError = 'Ambient Temperature is greater than Surface Temperature';
    } else {
      this.temperatureError = null;
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
    if (this.extendedSurfaceCompareService.baselineSurface && this.extendedSurfaceCompareService.modifiedSurface && this.extendedSurfaceCompareService.differentArray.length != 0) {
      if (this.extendedSurfaceCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //surfaceArea
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceArea.subscribe((val) => {
          let surfaceAreaElements = doc.getElementsByName('surfaceArea_' + this.lossIndex);
          surfaceAreaElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //avgSurfaceTemp
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceTemperature.subscribe((val) => {
          let avgSurfaceTempElements = doc.getElementsByName('avgSurfaceTemp_' + this.lossIndex);
          avgSurfaceTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemp
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTempElements = doc.getElementsByName('ambientTemp_' + this.lossIndex);
          ambientTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceEmissivity
        this.extendedSurfaceCompareService.differentArray[this.lossIndex].different.surfaceEmissivity.subscribe((val) => {
          let surfaceEmissivityElements = doc.getElementsByName('surfaceEmissivity_' + this.lossIndex);
          surfaceEmissivityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
