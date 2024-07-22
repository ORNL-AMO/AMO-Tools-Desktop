import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FlowMetric, ProcessUse } from '../../../shared/models/water-assessment';
import { WaterUsingSystemService } from '../water-using-system.service';
import { WaterAssessmentService } from '../../water-assessment.service';
import { Settings } from '../../../shared/models/settings';
import { FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { OperatingHours } from '../../../shared/models/operations';
import { copyObject } from '../../../shared/helperFunctions';
import { waterFlowMetricOptions } from '../../waterConstants';

@Component({
  selector: 'app-process-use',
  templateUrl: './process-use.component.html',
  styleUrl: './process-use.component.css'
})
export class ProcessUseComponent {
  @Input()
  processUse: ProcessUse;
  @Output()
  updateProcessUse = new EventEmitter<ProcessUse>();

  settings: Settings;
  form: FormGroup;
  smallScreenTab: string = 'form';
  waterFlowMetricOptions: {value: number, display: string}[];
  waterRequiredFlowMetricOptions: {value: number, display: string}[];
  
  FlowMetric = FlowMetric;

  // no units needed for fraction
  inputUnitMap: Record<FlowMetric, WaterUseUnit> = {
    [FlowMetric.ANNUAL]: 'gal',
    [FlowMetric.HOURLY]: 'gal/hr',
    [FlowMetric.INTENSITY]: 'gal/unit',
    [FlowMetric.FRACTION_GROSS]: undefined,
    [FlowMetric.FRACTION_INCOMING]: undefined,
  };


  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  formWidth: number;


  constructor(private waterUsingSystemService: WaterUsingSystemService,
    private waterAssessmentService: WaterAssessmentService,
  ) { }


  ngOnInit() {
    this.waterFlowMetricOptions = copyObject(waterFlowMetricOptions);
    let waterRequiredFlowMetricOptions = copyObject(waterFlowMetricOptions);
    this.waterRequiredFlowMetricOptions =  waterRequiredFlowMetricOptions.slice(0, 3);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.setFlowMetricDataUnits();
    this.initForm();
    this.save();
  }
  
  ngOnDestroy() {}
  
  initForm() {
    this.form = this.waterUsingSystemService.getProcessUseForm(this.processUse);
  }
  
  save() {
    let processUse = this.waterUsingSystemService.getProcessUseFromForm(this.form);
    this.updateProcessUse.emit(processUse);
  }
  
  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  setWaterFlowMetric(metric: number) {
    if (metric == FlowMetric.INTENSITY) {
      this.waterUsingSystemService.setAnnualProductionValidators(this.form);
    }
    this.save();
  }

  setFlowMetricDataUnits() {
    if (this.settings.unitsOfMeasure !== 'Imperial') {
      this.inputUnitMap = {
        [FlowMetric.ANNUAL]: 'm<sup>3</sup>',
        [FlowMetric.HOURLY]: 'm<sup>3</sup>/hr',
        [FlowMetric.INTENSITY]: 'm<sup>3</sup>/unit',
        [FlowMetric.FRACTION_GROSS]: undefined,
        [FlowMetric.FRACTION_INCOMING]: undefined,
      };
    } 
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}


type WaterUseUnit = undefined | 'gal' | 'gal/hr' | 'gal/unit' | 'm<sup>3</sup>' | 'm<sup>3</sup>/hr' | 'm<sup>3</sup>/unit' ;


