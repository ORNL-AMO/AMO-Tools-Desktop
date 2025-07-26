import { ChangeDetectorRef, Component, computed, effect, ElementRef, HostListener, Input, Signal, ViewChild } from '@angular/core';
import { Modification, ProcessCoolingAssessment } from '../shared/models/process-cooling-assessment';
import { firstValueFrom, Subscription } from 'rxjs';
import { Assessment } from '../shared/models/assessment';
import { ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../dashboard/assessment.service';
import { AssessmentDbService } from '../indexedDb/assessment-db.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { EGridService } from '../shared/helper-services/e-grid.service';
import { Settings } from '../shared/models/settings';
import { ChillerInventoryService } from './chiller-inventory/chiller-inventory.service';
import { signal, WritableSignal } from '@angular/core';
import { ProcessCoolingMainTabString, ProcessCoolingSetupTabString, ProcessCoolingUiService } from './process-cooling-ui.service';
import { ProcessCoolingAssessmentService } from './process-cooling-assessment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-process-cooling',
  standalone: false,
  templateUrl: './process-cooling.component.html',
  styleUrl: './process-cooling.component.css'
})
export class ProcessCoolingComponent {
 @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setContainerHeight();
  }

  assessment: Assessment;
  settings: Settings;
  oldSettings: Settings;
  
  mainTab: WritableSignal<string>;
  setupTab: WritableSignal<ProcessCoolingSetupTabString>;
  isModalOpen: WritableSignal<boolean>;
  showExportModal: WritableSignal<boolean>;
  assessmentTab: WritableSignal<string> ;
  
  // todo similar logic in banner/setup tabs.. breakout validity logic
  disableNext: Signal<boolean> = computed(() => {
    let processCooling: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    let hasValidInventory: boolean = true;
    let hasValidSystemInformation: boolean = true;

    if (this.setupTab() == 'system-information' && !hasValidSystemInformation) {
      return true;
    } else if (this.setupTab() != 'assessment-settings' && this.setupTab() != 'system-information') {
      return true;
    } else {
      return false;
    }
  });

  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showUpdateUnitsModal: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
    private assessmentDbService: AssessmentDbService, 
    private cd: ChangeDetectorRef, 
    private settingsDbService: SettingsDbService, 
    private processCoolingUiService: ProcessCoolingUiService,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService,
    private egridService: EGridService,
    // private defaultChillerDbService: DefaultChillerDbService, 
    private inventoryService: ChillerInventoryService,
    private assessmentService: AssessmentService,
    private analyticsService: AnalyticsService) {

    effect(() => {
      const mainTab = this.mainTab();
      const setupTab = this.setupTab();
      this.setContainerHeight();
    });

    this.processCoolingAssessmentService.processCooling
      .pipe(takeUntilDestroyed())
      .subscribe(val => {
        if (val && this.assessment) {
          this.save(val);
          this.disableNext();
        }
      });
  }

  ngOnInit() {
    this.mainTab = this.processCoolingUiService.mainTabSignal;
    this.setupTab = this.processCoolingUiService.setupTabSignal;

    this.isModalOpen = this.processCoolingUiService.modalOpenSignal;
    this.showExportModal = this.processCoolingUiService.showExportModalSignal;

    this.analyticsService.sendEvent('view-process-cooling-assessment', undefined);
    this.egridService.getAllSubRegions();

    this.activatedRoute.params.subscribe(params => {
      this.assessment = this.assessmentDbService.findById(parseInt(params['id']));
      let settings: Settings = this.settingsDbService.getByAssessmentId(this.assessment, true);
      if (!settings) {
        settings = this.settingsDbService.getByAssessmentId(this.assessment, false);
        this.addSettings(settings);
      } else {
        this.settings = settings;
        this.processCoolingAssessmentService.settings.next(settings);
        // this.defaultChillerDbService.getAllCompressors(this.settings);
      }
      this.processCoolingAssessmentService.updateProcessCooling(this.assessment.processCooling, false);

      if (!this.inventoryService.selectedChiller.getValue()) {
        this.inventoryService.setDefaultSelectedChiller(this.assessment.processCooling.inventory);
      }
    });

    let recentTab: ProcessCoolingMainTabString = this.assessmentService.getStartingTab() as ProcessCoolingMainTabString;
    if (recentTab) {
      this.mainTab.set(recentTab);
    }

    this.checkShowWelcomeScreen();
  }

  ngOnDestroy() {    
    this.mainTab.set('baseline');
    this.processCoolingAssessmentService.processCooling.next(undefined);
    this.inventoryService.selectedChiller.next(undefined); 
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setContainerHeight();
    }, 100);
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
      // this.assessment.processCooling = this.convertCompressedAirService.convertCompressedAir(this.assessment.processCooling, oldSettings, this.settings);
    }
    // this.defaultChillerDbService.getAllCompressors(this.settings);
    this.processCoolingAssessmentService.settings.next(this.settings);
  }

  getDisableNext() {
    let processCooling: ProcessCoolingAssessment = this.processCoolingAssessmentService.processCooling.getValue();
    let hasValidInventory: boolean = true;
    let hasValidSystemInformation: boolean = true;

    if (this.setupTab() == 'system-information' && !hasValidSystemInformation) {
      return true;
    } else if (this.setupTab() != 'assessment-settings' && this.setupTab() != 'system-information') {
      return true;
    } else {
      return false;
    }
  }

  next() {
    if (this.setupTab() == 'assessment-settings') {
      this.setupTab.set('system-information');
    } else if (this.setupTab() == 'system-information') {
      this.setupTab.set('inventory');
    } else if (this.setupTab() == 'inventory') {
      this.mainTab.set('assessment');
    }
  }

  back() {
    if (this.setupTab() == 'system-information') {
      this.setupTab.set('assessment-settings');
    } else if (this.setupTab() == 'inventory') {
      this.setupTab.set('system-information');
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
        if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
          this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
        }
      }, 100);
    }
  }

  async save(processCooling: ProcessCoolingAssessment) {
    this.assessment.processCooling = processCooling;
    await firstValueFrom(this.assessmentDbService.updateWithObservable(this.assessment));
    let assessments: Assessment[] = await firstValueFrom(this.assessmentDbService.getAllAssessments());
    this.assessmentDbService.setAll(assessments);
  }

  initUpdateUnitsModal(oldSettings: Settings) {
    this.oldSettings = oldSettings;
    this.showUpdateUnitsModal = true;
    this.cd.detectChanges();
  }

  closeUpdateUnitsModal(updated?: boolean) {
    if (updated) {
      this.mainTab.set('baseline');
      this.setupTab.set('assessment-settings');
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
    // this.assessment.processCooling = this.convertCompressedAirService.convertCompressedAir(this.assessment.processCooling, this.oldSettings, currentSettings);
    this.assessment.processCooling.existingDataUnits = currentSettings.unitsOfMeasure;
    this.save(this.assessment.processCooling);
  }

  checkShowWelcomeScreen() {
    if (!this.settingsDbService.globalSettings.disableCompressedAirTutorial) {
      this.showWelcomeScreen = true;
      this.isModalOpen.set(true);
    }
  }

  async closeWelcomeScreen() {
    this.settingsDbService.globalSettings.disableProcessCoolingTutorial = true;
    await firstValueFrom(this.settingsDbService.updateWithObservable(this.settingsDbService.globalSettings));
    let updatedSettings: Settings[] = await firstValueFrom(this.settingsDbService.getAllSettings());  
    this.settingsDbService.setAll(updatedSettings);
    this.showWelcomeScreen = false;
    this.isModalOpen.set(false);
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  closeExportModal(input: boolean){
    this.showExportModal.set(input);
  }
}
