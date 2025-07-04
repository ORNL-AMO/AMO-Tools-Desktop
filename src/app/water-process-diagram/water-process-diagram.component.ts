import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Subscription, firstValueFrom } from 'rxjs';
import { WaterProcessDiagramService } from './water-process-diagram.service';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { DiagramIdbService } from '../indexedDb/diagram-idb.service';
import { Settings } from '../shared/models/settings';
import { Diagram, IntegratedAssessmentDiagram } from '../shared/models/diagram';
import { UpdateDiagramFromAssessmentService } from './update-diagram-from-assessment.service';
import { WaterDiagram, ParentContainerDimensions } from 'process-flow-lib';

@Component({
  selector: 'app-water-process-diagram',
  standalone: false,
  templateUrl: './water-process-diagram.component.html',
  styleUrl: './water-process-diagram.component.css'
})
export class WaterProcessDiagramComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }

  @Input()
  integratedDiagram: IntegratedAssessmentDiagram;

  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;
  mainTabSub: Subscription;
  modalOpenSub: Subscription;
  waterDiagramSub: Subscription;
  settings: Settings;
  
  mainTab: string;
  diagram: Diagram;
  isModalOpen: boolean;
  displayCreateAssessmentModal: boolean;
  
  constructor( 
    private waterProcessDiagramService: WaterProcessDiagramService,
    private updateDiagramFromAssessmentService: UpdateDiagramFromAssessmentService,
    private diagramIdbService: DiagramIdbService,
    private settingsDbService: SettingsDbService, 
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-water-diagram');
    if (this.integratedDiagram) {
      this.initDiagram(this.integratedDiagram.diagramId)
    } else {
      this.activatedRoute.params.subscribe(params => {
        this.initDiagram(parseInt(params['id']));
      });
    }
    this.waterDiagramSub = this.waterProcessDiagramService.waterDiagram.subscribe(waterDiagram => {
      if (waterDiagram && this.diagram) {
        this.save(waterDiagram);
      }
    });
    this.mainTabSub = this.waterProcessDiagramService.mainTab.subscribe(val => {
      this.mainTab = val;
      this.getContainerHeight();
    });
    this.modalOpenSub = this.waterProcessDiagramService.modalOpen.subscribe(val => {
      this.isModalOpen = val;
    });

  }

  ngOnDestroy() {
    this.mainTabSub.unsubscribe();
    this.waterDiagramSub.unsubscribe();
    this.modalOpenSub.unsubscribe();   
  }

  ngAfterViewInit() {
    this.getContainerHeight();
  }

  async initDiagram(id: number) {
    this.diagram = this.diagramIdbService.findById(id);
    if (!this.diagram) {
      this.createAssessmentDiagram()
    } else {
      this.diagram.waterDiagram.assessmentId = this.diagram.assessmentId;
      this.updateDiagramFromAssessmentService.syncDiagramToAssessment(this.diagram, this.integratedDiagram)
      this.setSettings();
      this.waterProcessDiagramService.updateWaterDiagram(this.diagram.waterDiagram);
    }
  }

  createAssessmentDiagram() {
    // todo implement fallback and messaging for disconnected/lost diagrams
    // await this.updateAssessmentFromDiagramService.createAssesmentDiagram(this.integratedDiagram.assessment, assessment settings);
    // todo save assessment
    // todo this.save
  }

  async save(waterDiagram: WaterDiagram) {
    this.diagram.waterDiagram = waterDiagram;
    await firstValueFrom(this.diagramIdbService.updateWithObservable(this.diagram));
    let diagrams: Diagram[] = await firstValueFrom(this.diagramIdbService.getAllDiagrams());
    this.diagramIdbService.setAll(diagrams);
  }

  // * 6893 Settings object - is unused, does not currently get updated by diagram operations
  setSettings() {
    let settings: Settings = this.settingsDbService.getByDiagramId(this.diagram, true);
    if (!settings) {
      settings = this.settingsDbService.getByDiagramId(this.diagram, false);
      this.addSettings(settings);
    } else {
      this.settings = settings;
      this.waterProcessDiagramService.settings.next(settings);
    }
  }

  async addSettings(settings: Settings) {
    delete settings.id;
    delete settings.directoryId;
    settings.diagramId = this.diagram.id;
    await firstValueFrom(this.settingsDbService.addWithObservable(settings));
    let updatedSettings = await firstValueFrom(this.settingsDbService.getAllSettings());
    this.settingsDbService.setAll(updatedSettings);
    this.settings = this.settingsDbService.getByDiagramId(this.diagram, true);
    
    // todo 6770 double check pattern 
    if (this.settings.unitsOfMeasure == 'Metric') {
      // let oldSettings: Settings = JSON.parse(JSON.stringify(this.settings));
      // oldSettings.unitsOfMeasure = 'Imperial';
      // this.waterDiagram.water = this.conver.convertWaterAssessment(this.assessment.water, oldSettings, this.settings);
    }
    this.waterProcessDiagramService.settings.next(this.settings);
  }


  createAssessment() {
    this.showCreateAssessmentModal();
  }

  showCreateAssessmentModal() {
    this.isModalOpen = true;
    this.displayCreateAssessmentModal = true;
  }

  hideCreateAssessmentModal() {
    this.isModalOpen = false;
    this.displayCreateAssessmentModal = false;
  }

  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let parentContainerDimensions: ParentContainerDimensions;
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = 0;
        let footerHeight = 0;
        if (this.header) {
          headerHeight = this.header.nativeElement.clientHeight;
        }
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
        parentContainerDimensions = {
          height: contentHeight,
          headerHeight: headerHeight,
          footerHeight: footerHeight
        }
        if (this.integratedDiagram) {
          parentContainerDimensions = {
            height: this.integratedDiagram.parentDimensions.height,
            headerHeight: this.integratedDiagram.parentDimensions.headerHeight,
            footerHeight: this.integratedDiagram.parentDimensions.footerHeight
          }
        }
        this.waterProcessDiagramService.parentContainer.next(parentContainerDimensions)
      }, 100);
    }
  }

  continue() {
    if (this.mainTab == 'setup') {
      this.waterProcessDiagramService.mainTab.next('diagram');
    }
  }

  back(){
    if (this.mainTab == 'diagram') {
      this.waterProcessDiagramService.mainTab.next('setup');
    }
  }


  goToAssessment() {
      let url: string = `/water/${this.diagram.assessmentId}`;
      this.router.navigate([url]);
  }


}
