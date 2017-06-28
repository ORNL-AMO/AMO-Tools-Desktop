import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { WallLossCompareService } from '../wall-loss-compare.service';
@Component({
  selector: 'app-wall-losses-form',
  templateUrl: './wall-losses-form.component.html',
  styleUrls: ['./wall-losses-form.component.css']
})
export class WallLossesFormComponent implements OnInit {
  @Input()
  wallLossesForm: any;
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

  @ViewChild('lossForm') lossForm: ElementRef;
  form: any;
  elements: any;

  firstChange: boolean = true;
  counter: any;
  constructor(private windowRefService: WindowRefService, private wallLossCompareService: WallLossCompareService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      //on changes to baseline selected enable/disable form
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
    //wait for view to init to disable form
    if (!this.baselineSelected) {
      this.disableForm();
    }
    //initialize difference monitor
    this.initDifferenceMonitor();
  }
  //iterate through form elements and disable
  disableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = true;
    }
  }
  //iterate through form elements and enable
  enableForm() {
    this.elements = this.lossForm.nativeElement.elements;
    for (var i = 0, len = this.elements.length; i < len; ++i) {
      this.elements[i].disabled = false;
    }
  }
  //utility for checking if form is valid
  //if so tell wall-losses.component to calculate results
  checkForm() {
    if (this.wallLossesForm.status == "VALID") {
      this.calculate.emit(true);
    }
  }
  //emits to wall-losses.component the focused field changed
  focusField(str: string) {
    this.changeField.emit(str);
  }
  //emit to wall-losses.component to begin saving process
  emitSave() {
    this.saveEmit.emit(true);
  }
  //on input/change in form startSavePolling is called, if not called again with 3 seconds save process is triggered
  startSavePolling() {
    this.checkForm();
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave();
    }, 3000)
  }
  //method used to subscribe to service monitoring differences in baseline vs modification forms
  initDifferenceMonitor() {
    if (this.wallLossCompareService.baselineWallLosses && this.wallLossCompareService.modifiedWallLosses && this.wallLossCompareService.differentArray.length != 0) {
      if (this.wallLossCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();
        //avgSurfaceTemp
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceTemperature.subscribe((val) => {
          let avgSurfaceTempElements = doc.getElementsByName('avgSurfaceTemp_' + this.lossIndex);
          avgSurfaceTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //ambientTemp
        this.wallLossCompareService.differentArray[this.lossIndex].different.ambientTemperature.subscribe((val) => {
          let ambientTempElements = doc.getElementsByName('ambientTemp_' + this.lossIndex);
          ambientTempElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //windVelocity
        this.wallLossCompareService.differentArray[this.lossIndex].different.windVelocity.subscribe((val) => {
          let windVelocityElements = doc.getElementsByName('windVelocity_' + this.lossIndex);
          windVelocityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceShape
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceShape.subscribe((val) => {
          let surfaceShapeElements = doc.getElementsByName('surfaceShape_' + this.lossIndex);
          surfaceShapeElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        // //conditionFactor
        // this.wallLossCompareService.differentArray[this.lossIndex].different.conditionFactor.subscribe((val) => {
        //   let conditionFactorElements = doc.getElementsByName('conditionFactor_' + this.lossIndex);
        //   conditionFactorElements.forEach(element => {
        //     element.classList.toggle('indicate-different', val);
        //   });
        // })
        //surfaceEmissivity
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceEmissivity.subscribe((val) => {
          let surfaceEmissivityElements = doc.getElementsByName('surfaceEmissivity_' + this.lossIndex);
          surfaceEmissivityElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //surfaceArea
        this.wallLossCompareService.differentArray[this.lossIndex].different.surfaceArea.subscribe((val) => {
          let surfaceAreaElements = doc.getElementsByName('surfaceArea_' + this.lossIndex);
          surfaceAreaElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //correctionFactor
        this.wallLossCompareService.differentArray[this.lossIndex].different.correctionFactor.subscribe((val) => {
          let correctionFactorElements = doc.getElementsByName('correctionFactor_' + this.lossIndex);
          correctionFactorElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
