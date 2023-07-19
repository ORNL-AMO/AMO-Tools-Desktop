import { Component, OnInit, Output, Input, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SsmtService } from '../ssmt.service';
import { SSMT, BoilerInput, HeaderInput, TurbineInput } from '../../shared/models/steam/ssmt';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitSaveAssessment')
  emitSaveAssessment = new EventEmitter<SSMT>();
  @Input()
  containerHeight: number;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  
  modelTab: string;
  modelTabSub: Subscription;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;
  isModalOpen: boolean;
  modalOpenSubscription: Subscription;
  smallScreenTab: string = 'baseline';
  constructor(private ssmtService: SsmtService,  private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.modelTabSub = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    });

    this.modalOpenSubscription = this.ssmtService.modalOpen.subscribe(isOpen => {
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
    this.modelTabSub.unsubscribe();
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
    this.ssmtService.modalOpen.next(true);
    this.ssmtService.openNewModificationModal.next(true);
  }

  saveAssessment() {
    if(this.modificationExists){
      this.ssmt.modifications[this.modificationIndex].exploreOpportunities = false;
    }
    this.emitSaveAssessment.emit(this.ssmt);
  }

  saveBaselineBoiler(newBoiler: BoilerInput) {
    this.ssmt.boilerInput = newBoiler;
    this.saveAssessment();
  }

  saveBaselineHeader(newHeaderInput: HeaderInput) {
    this.ssmt.headerInput = newHeaderInput;
    this.saveAssessment();
  }

  saveBaselineTurbine(newTurbineInput: TurbineInput) {
    this.ssmt.turbineInput = newTurbineInput;
    this.saveAssessment();
  }

  saveBaselineSsmt(newSsmt: SSMT){
    this.ssmt = newSsmt;
    this.saveAssessment();
  }


  saveModBoiler(newBoiler: BoilerInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.boilerInput = newBoiler;
    this.saveAssessment();
  }

  saveModHeader(newHeaderInput: HeaderInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.headerInput = newHeaderInput;
    this.saveAssessment();
  }

  saveModTurbine(newTurbineInput: TurbineInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.turbineInput = newTurbineInput;
    this.saveAssessment();
  }

  saveModSsmt(newSSMT: SSMT){
    this.ssmt.modifications[this.modificationIndex].ssmt = newSSMT;
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
