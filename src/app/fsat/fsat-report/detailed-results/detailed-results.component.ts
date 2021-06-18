import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { Subscription } from 'rxjs';
import { ConvertFanAnalysisService } from '../../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FanAnalysisService } from '../../../calculator/fans/fan-analysis/fan-analysis.service';
import { FsatReportRollupService } from '../../../report-rollup/fsat-report-rollup.service';
import { Assessment } from '../../../shared/models/assessment';
import { Fan203Inputs, FieldData, FSAT, PlaneResults, PsychrometricResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-detailed-results',
  templateUrl: './detailed-results.component.html',
  styleUrls: ['./detailed-results.component.css']
})
export class DetailedResultsComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  selectedModificationIndex: number;
  fsat: FSAT;
  psychrometricResults: PsychrometricResults;

  @ViewChild('modalBody', { static: false }) public modalBody: ElementRef;
  @ViewChild('amcaModal', { static: false }) public amcaModal: ModalDirective;
  @ViewChild('pressureModal', { static: false }) public pressureModal: ModalDirective;
  @HostListener('window:resize', ['$event'])
  pressureCalcType: string;
  modalFsatCopy: FSAT;
  pressureModalSub: Subscription;
  bodyHeight: number;
  disableApplyData: boolean = true;

  showFull: boolean = false;
  planeResults: PlaneResults;
  inputs: Fan203Inputs;

  constructor(private fsatReportRollupService: FsatReportRollupService, private fsatService: FsatService,
    private fanAnalysisService: FanAnalysisService, private convertFanAnalysis: ConvertFanAnalysisService) { }

  ngOnInit(): void {
    this.fsat = this.assessment.fsat;
    if (this.inRollup) {
      this.fsatReportRollupService.selectedFsats.forEach(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }

    // this.inputs = this.fanAnalysisService.getExampleData();

    // this.planeResults = this.getTraverseData(this.inputs); 
    //this.getAmcaModal(this.fsat)



  }
  ngAfterViewInit() {    
    this.pressureModalSub = this.pressureModal.onShown.subscribe(() => {
      this.getBodyHeight();
    });
  }

  ngOnDestroy() {
    //this.hidePressureModal();
    this.pressureModalSub.unsubscribe();
  }

  showAmcaModal(eachFsat: FSAT) {
    this.modalFsatCopy = JSON.parse(JSON.stringify(eachFsat));
    if (eachFsat.modalFieldData) {
      this.modalFsatCopy.fieldData = eachFsat.modalFieldData;
    }
    this.pressureCalcType = 'flow';
    this.fsatService.modalOpen.next(true);
    this.pressureModal.show();
  }
  getAmcaModal(eachFsat: FSAT) {
    this.modalFsatCopy = JSON.parse(JSON.stringify(eachFsat));
    if (eachFsat.modalFieldData) {
      this.modalFsatCopy.fieldData = eachFsat.modalFieldData;
    }
    this.pressureCalcType = 'flow';
    this.fsatService.modalOpen.next(true);
    //this.pressureModal.show();
  }

  setCalcInvalid(isCalcValid: boolean) {
    this.disableApplyData = isCalcValid;
  }

  updateFsatWithModalData(modalFieldData: FieldData) {
    this.fsat.modalFieldData = JSON.parse(JSON.stringify(modalFieldData));
  }

  hidePressureModal() {
    this.pressureCalcType = undefined;
    this.fsatService.modalOpen.next(false);
    this.pressureModal.hide();
  }

  getBodyHeight() {
    if (this.modalBody) {
      this.bodyHeight = this.modalBody.nativeElement.clientHeight;
    } else {
      this.bodyHeight = 0;
    }
  }

  getPsychrometricResults(fsat: FSAT): PsychrometricResults {
    let psychrometricResults: PsychrometricResults;
    if (fsat.baseGasDensity.inputType === 'relativeHumidity') {
      psychrometricResults = this.fsatService.getPsychrometricRelativeHumidity(fsat.baseGasDensity, this.settings);
    } else if (fsat.baseGasDensity.inputType === 'wetBulb') {
      psychrometricResults = this.fsatService.getPsychrometricWetBulb(fsat.baseGasDensity, this.settings);
    } else if (fsat.baseGasDensity.inputType === 'dewPoint') {
      psychrometricResults = this.fsatService.getPsychrometricDewPoint(fsat.baseGasDensity, this.settings);
    }

    if (psychrometricResults) {
      psychrometricResults.dryBulbTemp = fsat.baseGasDensity.dryBulbTemp;
      psychrometricResults.barometricPressure = fsat.baseGasDensity.barometricPressure;
    }


    return psychrometricResults;
  }

  getTraverseData(x: Fan203Inputs): PlaneResults {
    let tempResults: PlaneResults;
    //this.inputs = this.fanAnalysisService.inputData;
    tempResults = this.fsatService.getPlaneResults(x, this.settings);


    return tempResults;

  }

  getInputs(): Fan203Inputs {
    let fan203Inputs: Fan203Inputs;
    fan203Inputs = this.fanAnalysisService.inputData;
    return fan203Inputs;

  }

  setPressureCalcType(str: string) {
    this.fanAnalysisService.pressureCalcResultType = str;
    this.fanAnalysisService.getResults.next(true);
  }



}
