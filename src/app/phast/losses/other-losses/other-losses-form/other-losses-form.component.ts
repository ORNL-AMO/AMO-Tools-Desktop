import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { OtherLossesCompareService } from '../other-losses-compare.service';
import { WindowRefService } from '../../../../indexedDb/window-ref.service';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-other-losses-form',
  templateUrl: './other-losses-form.component.html',
  styleUrls: ['./other-losses-form.component.css']
})
export class OtherLossesFormComponent implements OnInit {
  @Input()
  lossesForm: FormGroup;
  @Output('calculate')
  calculate = new EventEmitter<boolean>();
  @Input()
  lossIndex: number;
  @Input()
  baselineSelected: boolean;
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Output('saveEmit')
  saveEmit = new EventEmitter<boolean>();
  @Input()
  settings: Settings;

  counter: any;

  firstChange: boolean = true;
  resultsUnit: string;
  constructor(private windowRefService: WindowRefService, private otherLossesCompareService: OtherLossesCompareService) { }

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
    if (this.settings.energyResultUnit != 'kWh') {
      this.resultsUnit = this.settings.energyResultUnit + '/hr';
    } else {
      this.resultsUnit = 'kW';
    }
  }

  ngAfterViewInit() {
    if (!this.baselineSelected) {
      this.disableForm();
    }
    this.initDifferenceMonitor();
  }

  disableForm() {
    this.lossesForm.disable();
  }

  enableForm() {
    this.lossesForm.enable();
  }

  checkForm() {
    this.calculate.emit(true);
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  emitSave() {
    this.saveEmit.emit(true);
  }

  startSavePolling() {
    this.checkForm();
    this.emitSave();
  }

  initDifferenceMonitor() {
    if (this.otherLossesCompareService.baselineOtherLoss && this.otherLossesCompareService.modifiedOtherLoss && this.otherLossesCompareService.differentArray.length != 0) {
      if (this.otherLossesCompareService.differentArray[this.lossIndex]) {
        let doc = this.windowRefService.getDoc();

        //description
        this.otherLossesCompareService.differentArray[this.lossIndex].different.description.subscribe((val) => {
          let descriptionElements = doc.getElementsByName('description_' + this.lossIndex);
          descriptionElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
        //heatLoss
        this.otherLossesCompareService.differentArray[this.lossIndex].different.heatLoss.subscribe((val) => {
          let heatLossElements = doc.getElementsByName('heatLoss_' + this.lossIndex);
          heatLossElements.forEach(element => {
            element.classList.toggle('indicate-different', val);
          });
        })
      }
    }
  }
}
