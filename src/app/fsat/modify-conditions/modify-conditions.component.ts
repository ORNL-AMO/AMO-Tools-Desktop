import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { ModifyConditionsService } from './modify-conditions.service';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { Assessment } from '../../shared/models/assessment';
import { FsatService } from '../fsat.service';
import { BaseGasDensity, FanSetup, FanMotor, FieldData, FSAT, FsatOperations } from '../../shared/models/fans';

@Component({
    selector: 'app-modify-conditions',
    templateUrl: './modify-conditions.component.html',
    styleUrls: ['./modify-conditions.component.css'],
    standalone: false
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  assessment: Assessment;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitSaveAssessment')
  emitSaveAssessment = new EventEmitter<FSAT>();
  @Input()
  containerHeight: number;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  
  
  modifyConditionsTab: string;
  modifyConditionsTabSub: Subscription;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;
  isModalOpen: boolean = false;
  modalOpenSubscription: Subscription;  
  smallScreenTab: string = 'baseline';
  constructor(private modifyConditionsService: ModifyConditionsService, private fsatService: FsatService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.modifyConditionsTabSub = this.modifyConditionsService.modifyConditionsTab.subscribe(val => {
      this.modifyConditionsTab = val;
    });

    this.modalOpenSubscription = this.fsatService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    });
  }

  getContainerHeight() {
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      this.cd.detectChanges();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  ngOnDestroy() {
    this.modifyConditionsTabSub.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
  }

  togglePanel(bool: boolean) {
    if (bool === this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool === this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  addModification() {
    this.fsatService.openNewModal.next(true);
  }

  saveAssessment() {
    if(this.modificationExists){
      this.assessment.fsat.modifications[this.modificationIndex].exploreOpportunities = false;
    }
    this.emitSaveAssessment.emit(this.assessment.fsat);
  }

  saveBaselineGasDensity(newGasDensity: BaseGasDensity) {
    this.assessment.fsat.baseGasDensity = newGasDensity;
    this.saveAssessment();
  }

  saveBaselineFanSetup(newSetup: FanSetup) {
    this.assessment.fsat.fanSetup = newSetup;
    this.saveAssessment();
  }

  saveBaselineFanOperations(newFsatOperations: FsatOperations) {
    this.assessment.fsat.fsatOperations = newFsatOperations;
    this.saveAssessment();
  }

  saveBaselineFanMotor(newFanMotor: FanMotor) {
    this.assessment.fsat.fanMotor = newFanMotor;
    this.saveAssessment();
  }

  saveBaselineFieldData(newFieldData: FieldData) {
    this.assessment.fsat.fieldData = newFieldData;
    this.saveAssessment();
  }

  saveModGasDensity(newGasDensity: BaseGasDensity) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat.baseGasDensity = newGasDensity;
    this.saveAssessment();
  }

  saveModFanSetup(newSetup: FanSetup) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat.fanSetup = newSetup;
    this.saveAssessment();
  }

  saveModFanMotor(newFanMotor: FanMotor) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat.fanMotor = newFanMotor;
    this.saveAssessment();
  }

  saveModFieldData(newFieldData: FieldData) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat.fieldData = newFieldData;
    this.saveAssessment();
  }

  saveModFanOperations(newFsatOperations: FsatOperations) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat.fsatOperations = newFsatOperations;
    this.saveAssessment();
  }

  saveModExtra(newFsat: FSAT) {
    this.assessment.fsat.modifications[this.modificationIndex].fsat = newFsat;
    this.saveAssessment();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
    if (selectedTab === 'baseline') {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (selectedTab === 'modification') {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }
}
