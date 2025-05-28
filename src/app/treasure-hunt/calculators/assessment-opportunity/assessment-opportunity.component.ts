import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { AssessmentOpportunity, OpportunitySheetResults } from '../../../shared/models/treasure-hunt';
import { AssessmentOpportunityService } from '../../treasure-hunt-calculator-services/assessment-opportunity.service';
import { AssessmentEnergyOption, IntegratedAssessment, ModificationEnergyOption } from '../../../shared/assessment-integration/assessment-integration.service';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { copyObject } from '../../../shared/helperFunctions';

@Component({
    selector: 'app-assessment-opportunity',
    templateUrl: './assessment-opportunity.component.html',
    styleUrls: ['./assessment-opportunity.component.css'],
    standalone: false
})
export class AssessmentOpportunityComponent {
  @Output('emitCancel')
  emitCancel = new EventEmitter<boolean>();
  @Output('emitSave')
  emitSave = new EventEmitter<AssessmentOpportunity>();
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  smallScreenTab: string = 'form';
  containerHeight: number;
  tabSelect: string = 'help';
  assessmentOpportunityResults: OpportunitySheetResults;
  currentField: string = 'default';
  assessmentOpportunity: AssessmentOpportunity;
  integratedAssessment: IntegratedAssessment;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  allowCreateModifiedEnergy: boolean = false;
  constructor(private assessmentOpportunityService: AssessmentOpportunityService, private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    if (this.assessmentOpportunityService.assessmentOpportunity) {
      this.assessmentOpportunity = copyObject(this.assessmentOpportunityService.assessmentOpportunity);
    } else {
      this.assessmentOpportunity = this.assessmentOpportunityService.initAssessmentOpportunity();
    }

    this.modalOpenSub = this.treasureHuntService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.getResults();
  }

  ngOnDestroy() {
    this.modalOpenSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.containerHeight = this.contentContainer.nativeElement.clientHeight - this.leftPanelHeader.nativeElement.clientHeight;
      if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
        this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      }
    }
  }

  addModification() {
    this.assessmentOpportunity.modificationEnergyUseItems = JSON.parse(JSON.stringify(this.assessmentOpportunity.baselineEnergyUseItems));
    this.allowCreateModifiedEnergy = true;
  }

  save() {
    if (this.integratedAssessment && !this.assessmentOpportunity.existingIntegrationData) {
      this.updatedIntegratedAssessment();
    }
    this.emitSave.emit(this.assessmentOpportunity);
  }

  cancel() {
    this.assessmentOpportunity = this.assessmentOpportunityService.assessmentOpportunity;
    this.emitCancel.emit(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  saveBaseline(baselineData: Array<{ type: string, amount: number }>) {
    this.assessmentOpportunity.baselineEnergyUseItems = baselineData;
    this.getResults();
  }

  saveModification(modificationData: Array<{ type: string, amount: number }>) {
    this.assessmentOpportunity.modificationEnergyUseItems = modificationData;
    this.getResults();
  }

  getResults() {
    this.assessmentOpportunityResults = this.assessmentOpportunityService.getResults(this.assessmentOpportunity, this.settings);
  }

  setIntegratedAssessment(integratedAssessment: IntegratedAssessment) {
    this.integratedAssessment = integratedAssessment;
    this.assessmentOpportunity.baselineEnergyUseItems = integratedAssessment.baselineEnergyUseItems;
    if (this.integratedAssessment.hasModifications) {
      let selectedModification: ModificationEnergyOption = integratedAssessment.modificationEnergyUseItems.find(item => item.modificationId === integratedAssessment.selectedModificationId);
      this.assessmentOpportunity.modificationEnergyUseItems = selectedModification.energies;
    }
    this.assessmentOpportunity.equipment = integratedAssessment.thEquipmentType;
    this.assessmentOpportunity.name = integratedAssessment.assessment.name;
    this.getResults();
  }

  updatedIntegratedAssessment() {
    this.assessmentOpportunity.existingIntegrationData = {
      assessmentId: this.integratedAssessment.assessment.id,
      assessmentType: this.integratedAssessment.assessmentType,
      assessmentName: this.integratedAssessment.assessment.name,
      energyOptions: this.integratedAssessment.energyOptions,
      selectedModificationId: this.integratedAssessment.selectedModificationId
    }

    if (this.integratedAssessment.hasModifications) {
      let selectedModificationEnergyOptions: AssessmentEnergyOption[] = this.integratedAssessment.energyOptions.modifications.filter(option => {
        return option.modificationId == this.integratedAssessment.selectedModificationId 
      });
      this.assessmentOpportunity.existingIntegrationData.energyOptions.modifications = selectedModificationEnergyOptions;
    }
  }
  
  changeField(str: string) {
    this.currentField = str;
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}
