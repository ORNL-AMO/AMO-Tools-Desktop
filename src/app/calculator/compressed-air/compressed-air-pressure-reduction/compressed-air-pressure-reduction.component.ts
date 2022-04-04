import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { CompressedAirPressureReductionService } from './compressed-air-pressure-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CompressedAirPressureReductionResults, CompressedAirPressureReductionData } from '../../../shared/models/standalone';
import { CompressedAirPressureReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

@Component({
  selector: 'app-compressed-air-pressure-reduction',
  templateUrl: './compressed-air-pressure-reduction.component.html',
  styleUrls: ['./compressed-air-pressure-reduction.component.css']
})
export class CompressedAirPressureReductionComponent implements OnInit {
  @Input()
  inTreasureHunt: boolean;
  @Output('emitSave')
  emitSave = new EventEmitter<CompressedAirPressureReductionTreasureHunt>();
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Input()
  operatingHours: OperatingHours;
  @Input()
  assessment: Assessment;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  headerHeight: number;
  containerHeight: number;
  currentField: string;
  tabSelect: string = 'results';
  baselineSelected: boolean = true;
  modifiedSelected: boolean = false;

  modificationExists = false;

  compressedAirPressureReductionResults: CompressedAirPressureReductionResults;
  baselineData: Array<CompressedAirPressureReductionData>;
  modificationData: Array<CompressedAirPressureReductionData>;

  saving: boolean;
  assessmentCalculator: Calculator;

  constructor(private settingsDbService: SettingsDbService, private calculatorDbService: CalculatorDbService, private indexedDbService: IndexedDbService,
    private compressedAirPressureReductionService: CompressedAirPressureReductionService) { }

  ngOnInit() {
    this.calculatorDbService.isSaving = false;
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if(this.assessment) {
      this.getCalculatorForAssessment();
    } else{
      this.initData();
      this.getResults();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy() {
    if (!this.inTreasureHunt) {
      this.compressedAirPressureReductionService.baselineData = this.baselineData;
      this.compressedAirPressureReductionService.modificationData = this.modificationData;
    } else {
      this.compressedAirPressureReductionService.baselineData = undefined;
      this.compressedAirPressureReductionService.modificationData = undefined;
    }
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.containerHeight = this.contentContainer.nativeElement.offsetHeight - this.leftPanelHeader.nativeElement.offsetHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  initData() {
    if (this.compressedAirPressureReductionService.baselineData) {
      this.baselineData = this.compressedAirPressureReductionService.baselineData;
    } else {
      let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, this.settings, true, this.operatingHours);
      this.baselineData = [tmpObj];
    }
    if (this.compressedAirPressureReductionService.modificationData) {
      this.modificationData = this.compressedAirPressureReductionService.modificationData;
      if (this.modificationData.length != 0) {
        this.modificationExists = true;
      }
    }
  }

  addBaselineEquipment() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(this.baselineData.length, this.settings, true, this.operatingHours);
    this.baselineData.push(tmpObj);
    if (this.modificationExists) {
      tmpObj.isBaseline = false;
      this.modificationData.push(tmpObj);
    }
    this.getResults();
  }

  removeBaselineEquipment(i: number) {
    this.baselineData.splice(i, 1);
    if (this.modificationExists) {
      this.modificationData.splice(i, 1);
      if (this.modificationData.length === 0) {
        this.modificationExists = false;
      }
    }
    this.getResults();
  }

  createModification() {
    this.modificationData = JSON.parse(JSON.stringify(this.baselineData));
    this.modificationData.forEach(modification => {
      modification.isBaseline = false;
    });
    this.getResults();
    this.modificationExists = true;
    this.setModificationSelected();
  }

  updateBaselineData(data: CompressedAirPressureReductionData, index: number) {
    this.updateDataArray(this.baselineData, data, index);
    this.getResults();
  }

  updateModificationData(data: CompressedAirPressureReductionData, index: number) {
    this.updateDataArray(this.modificationData, data, index);
    this.getResults();
  }

  updateDataArray(dataArray: Array<CompressedAirPressureReductionData>, data: CompressedAirPressureReductionData, index: number) {
    dataArray[index].name = data.name;
    dataArray[index].isBaseline = data.isBaseline;
    dataArray[index].hoursPerYear = data.hoursPerYear;
    dataArray[index].electricityCost = data.electricityCost;
    dataArray[index].compressorPower = data.compressorPower;
    dataArray[index].pressure = data.pressure;
    dataArray[index].powerType = data.powerType;
    dataArray[index].proposedPressure = data.proposedPressure;
    dataArray[index].atmosphericPressure = data.atmosphericPressure;
    dataArray[index].pressureRated = data.pressureRated;
    if (data.isBaseline && this.modificationExists) {
      this.modificationData[index].compressorPower = data.compressorPower;
      this.modificationData[index].pressure = data.pressure;
      this.modificationData[index].powerType = data.powerType;
      this.modificationData[index].pressureRated = data.pressureRated;
      this.modificationData[index].atmosphericPressure = data.atmosphericPressure;
    }
  }

  getResults() {
    this.compressedAirPressureReductionResults = this.compressedAirPressureReductionService.getResults(this.settings, this.baselineData, this.modificationData);
    if (this.assessmentCalculator) {
      this.setAssessmentCalculatorData();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  getCalculatorForAssessment() {
    this.assessmentCalculator = this.calculatorDbService.getByAssessmentId(this.assessment.id);
    if(this.assessmentCalculator) {
      if (this.assessmentCalculator.compressedAirPressureReduction) {
        if (this.assessmentCalculator.compressedAirPressureReduction.baselineData) {
          this.compressedAirPressureReductionService.baselineData = this.assessmentCalculator.compressedAirPressureReduction.baselineData;
          if (this.assessmentCalculator.compressedAirPressureReduction.modificationData) {
            this.compressedAirPressureReductionService.modificationData = this.assessmentCalculator.compressedAirPressureReduction.modificationData;
          }
        }
        this.initData();
      } else {
        this.setAssessmentCalculatorData();
      }
      this.getResults();
    }else{
      this.assessmentCalculator = this.initNewAssessmentCalculator();
      this.calculatorDbService.saveAssessmentCalculator(this.assessment, this.assessmentCalculator);
    }
  }

  setAssessmentCalculatorData() {
    this.initData();
    this.assessmentCalculator.compressedAirPressureReduction = {
      baselineData: this.baselineData
    };
    if (this.modificationData) {
      this.assessmentCalculator.compressedAirPressureReduction.modificationData = this.modificationData;
    }
  }

  initNewAssessmentCalculator(): Calculator {
    let tmpCalculator: Calculator = {
      assessmentId: this.assessment.id,
      compressedAirPressureReduction: {
        baselineData: this.baselineData,
        modificationData: this.modificationData,
      }
    };
    return tmpCalculator;
  }

  btnResetData() {
    let tmpObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.initObject(0, this.settings, true, this.operatingHours);
    this.baselineData = [tmpObj];
    this.modificationData = new Array<CompressedAirPressureReductionData>();
    this.modificationExists = false;
    this.getResults();

  }

  generateExample() {
    let tmpBaselineObj: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(this.settings, true);
    this.baselineData = [tmpBaselineObj];
    this.compressedAirPressureReductionService.baselineData = this.baselineData;
    let tmpModificationData: CompressedAirPressureReductionData = this.compressedAirPressureReductionService.generateExample(this.settings, false);
    this.modificationData = [tmpModificationData];
    this.compressedAirPressureReductionService.modificationData = this.modificationData;
    this.modificationExists = true;
    this.baselineSelected = true;
    this.modifiedSelected = false;
  }

  btnGenerateExample() {
    this.generateExample();
    this.getResults();
  }
  
  save() {
    this.emitSave.emit({ baseline: this.baselineData, modification: this.modificationData, opportunityType: Treasure.compressedAirPressure });
  }

  cancel() {
    this.emitCancel.emit(true);
  }

  setBaselineSelected() {
    if (this.baselineSelected == false) {
      this.baselineSelected = true;
    }
  }

  setModificationSelected() {
    if (this.baselineSelected == true) {
      this.baselineSelected = false;
    }
  }
}
