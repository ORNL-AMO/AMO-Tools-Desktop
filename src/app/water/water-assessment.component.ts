import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { Assessment } from '../shared/models/assessment';
import { WaterAssessmentService } from './water-assessment.service';
import { ConvertWaterAssessmentService } from './convert-water-assessment.service';
import { Settings } from '../shared/models/settings';
import { IntegratedAssessmentDiagram } from '../shared/models/diagram';
import { UpdateAssessmentFromDiagramService } from './update-assessment-from-diagram.service';
import { WaterSystemComponentService } from './water-system-component.service';
import { ParentContainerDimensions, WasteWaterTreatment, WaterAssessment } from 'process-flow-lib';

@Component({
  selector: 'app-water-assessment',
  standalone: false,
  templateUrl: './water-assessment.component.html',
  styleUrl: './water-assessment.component.css'
})
export class WaterAssessmentComponent {
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContainerHeight();
  }

  
  diagramId: number;
  diagramContainerDimensions: ParentContainerDimensions;
  integratedDiagram: IntegratedAssessmentDiagram;
  assessment: Assessment;
  settings: Settings;
  showUpdateUnitsModal: boolean = false;
  oldSettings: Settings;
  mainTab: string;
  mainTabSub: Subscription;
  setupTab: string;
  setupTabSub: Subscription;
  waterAssessmentSub: Subscription;
  disableNext: boolean = false;
  showModificationListSub: Subscription;
  showModificationList: boolean = false;
  showAddModificationSub: Subscription;
  showAddModification: boolean = false;
  isModalOpen: boolean;
  modalOpenSub: Subscription;
  assessmentTab: string;
  assessmentTabSub: Subscription;
  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showExportModal: boolean = false;
  showExportModalSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private convertWaterAssessmentService: ConvertWaterAssessmentService, 
    private updateAssessmentFromDiagramService: UpdateAssessmentFromDiagramService,
    private assessmentDbService: AssessmentDbService, 
    private waterSystemComponentService: WaterSystemComponentService,
    private cd: ChangeDetectorRef, 
    private settingsDbService: SettingsDbService, 
    private waterAssessmentService: WaterAssessmentService,
    private assessmentService: AssessmentService,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-water-assessment', undefined);
    this.activatedRoute.params.subscribe(params => {
      let assessmentId = parseInt(params['id']);
      this.initAssessment(assessmentId);
    });

    this.waterAssessmentSub = this.waterAssessmentService.waterAssessment.subscribe(val => {
      if (val && this.assessment) {
        this.save(val);
        this.setDisableNext();
      }
    })

    let startingTab: string = this.assessmentService.getStartingTab();
    if (startingTab) {
      this.waterAssessmentService.mainTab.next(startingTab);
    }

    this.mainTabSub = this.waterAssessmentService.mainTab.subscribe(newMainTab => {
      if (this.mainTab === 'diagram') {
        this.updateAssessmentFromDiagram();
      }
      this.mainTab = newMainTab;
      this.setContainerHeight();
    });

    this.setupTabSub = this.waterAssessmentService.setupTab.subscribe(val => {
      this.setupTab = val;
      this.setDisableNext();
      this.setContainerHeight();
    });

    this.showAddModificationSub = this.waterAssessmentService.showAddModificationModal.subscribe(val => {
      this.showAddModification = val;
      this.cd.detectChanges();
    });


    this.showModificationListSub = this.waterAssessmentService.showModificationListModal.subscribe(val => {
      this.showModificationList = val;
      this.cd.detectChanges();
    });

    this.modalOpenSub = this.waterAssessmentService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

    this.assessmentTabSub = this.waterAssessmentService.assessmentTab.subscribe(val => {
      this.assessmentTab = val;
    });

    this.showExportModalSub = this.waterAssessmentService.showExportModal.subscribe(val => {
      this.showExportModal = val;
    });

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {    
    this.mainTabSub.unsubscribe();
    this.setupTabSub.unsubscribe();
    this.waterAssessmentSub.unsubscribe();
    this.modalOpenSub.unsubscribe();
    this.assessmentTabSub.unsubscribe();
    this.showAddModificationSub.unsubscribe();
    this.showModificationListSub.unsubscribe();
    this.showExportModalSub.unsubscribe();
    this.waterAssessmentService.mainTab.next('system-setup');
    this.waterAssessmentService.setupTab.next('system-basics');
    this.waterAssessmentService.waterAssessment.next(undefined);
    this.waterSystemComponentService.selectedComponent.next(undefined);
    this.waterSystemComponentService.selectedViewComponents.next(undefined);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setContainerHeight();
    }, 100);
  }

  async initAssessment(assessmentId: number) {
    this.assessment = this.assessmentDbService.findById(assessmentId);
    this.waterAssessmentService.assessmentId = assessmentId;
    let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    if (!settings) {
      settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
      await this.addSettings(settings);
    } else {
      this.settings = settings;
      this.waterAssessmentService.settings.next(settings);
    }
    this.setDiagram();
    this.waterAssessmentService.updateWaterAssessment(this.assessment.water);
  }

 async addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.assessmentId = this.assessment.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    
    if (this.settings.unitsOfMeasure == 'Metric') {
      let oldSettings: Settings = JSON.parse(JSON.stringify(this.settings));
      oldSettings.unitsOfMeasure = 'Imperial';
      this.assessment.water = this.convertWaterAssessmentService.convertWaterAssessment(this.assessment.water, oldSettings, this.settings);
    }
    this.waterAssessmentService.settings.next(this.settings);
  }

  async setDiagram() {
    if (this.assessment.diagramId) {
      await this.updateAssessmentFromDiagramService.syncAssessmentToDiagram(this.assessment, this.settings);
    } else {
      await this.updateAssessmentFromDiagramService.createAssesmentDiagram(this.assessment, this.settings);
      this.save(this.assessment.water);
    }

    this.integratedDiagram = {
      diagramId: this.assessment.diagramId,
      assessment: this.assessment,
      parentDimensions: undefined
    }
  }

  async save(waterAssessment: WaterAssessment) {
    this.assessment.water = waterAssessment;
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
  }

  async updateAssessmentFromDiagram() {
    await this.updateAssessmentFromDiagramService.syncAssessmentToDiagram(this.assessment, this.settings);
    this.save(this.assessment.water);
  }

  setDisableNext() {
    
  }

  next() {
    if (this.setupTab == 'system-basics') {
      this.waterAssessmentService.setupTab.next('water-intake');
    } else if (this.setupTab == 'water-intake') {
      this.waterAssessmentService.setupTab.next('water-using-system');
    } 
  }

  back() {
    if (this.setupTab == 'water-using-system') {
      this.waterAssessmentService.setupTab.next('water-intake');
    } else if (this.setupTab == 'water-intake') {
      this.waterAssessmentService.setupTab.next('system-basics');
    } 
  }

  setContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.offsetHeight;
        let headerHeight = this.header.nativeElement.offsetHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.offsetHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
        if (this.integratedDiagram) {

          this.integratedDiagram.parentDimensions = {
            height: contentHeight,
            headerHeight: headerHeight,
            footerHeight: footerHeight
          }
        }
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }, 100);
    }
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.waterAssessmentService.mainTab.next('system-setup');
      this.waterAssessmentService.setupTab.next('system-basics');
    }
    this.showUpdateUnitsModal = false;
    this.cd.detectChanges();
  }

  selectUpdateAction(shouldUpdateData: boolean) {
    if (shouldUpdateData == true) {
      this.updateData();
    }
    this.closeUpdateUnitsModal(shouldUpdateData);
  }

  updateData() {
    let currentSettings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
    this.assessment.water = this.convertWaterAssessmentService.convertWaterAssessment(this.assessment.water, this.oldSettings, currentSettings);
    this.assessment.water.existingDataUnits = currentSettings.unitsOfMeasure;
    this.save(this.assessment.water);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableWaterTutorial) {
      this.showWelcomeScreen = true;
      this.waterAssessmentService.modalOpen.next(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableWaterTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.waterAssessmentService.modalOpen.next(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean){
    this.waterAssessmentService.showExportModal.next(input);
  }
}
