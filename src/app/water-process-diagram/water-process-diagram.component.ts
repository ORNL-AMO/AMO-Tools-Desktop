import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AnalyticsService } from '../shared/analytics/analytics.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { WaterProcessDiagramService } from './water-process-diagram.service';
import { ProcessFlowDiagramService } from '../shared/process-flow-diagram-wrapper/process-flow-diagram.service';
import { WaterDiagram, WaterDiagramOption } from '../../process-flow-types/process-flow-types';
import * as _ from 'lodash';

@Component({
  selector: 'app-water-process-diagram',
  templateUrl: './water-process-diagram.component.html',
  styleUrl: './water-process-diagram.component.css'
})
export class WaterProcessDiagramComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  @ViewChild('header', { static: false }) header: ElementRef;
  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('footer', { static: false }) footer: ElementRef;
  containerHeight: number;
  mainTabSub: Subscription;
  modalOpenSub: Subscription;
  waterDiagramSub: Subscription;
  waterDiagramOptions: Array<WaterDiagramOption>;
  
  mainTab: string;
  waterDiagram: WaterDiagram;
  isModalOpen: boolean;
  
  constructor( 
    private waterProcessDiagramService: WaterProcessDiagramService,
    private settingsDbService: SettingsDbService, 
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.analyticsService.sendEvent('view-water-diagram');
    this.waterProcessDiagramService.setWaterDiagrams();
    this.waterDiagramSub = this.waterProcessDiagramService.selectedWaterDiagram.subscribe(selectedWaterDiagram => {
        this.waterDiagram = selectedWaterDiagram;
    });
    // let settings: Settings = this.settingsDbService.getByWaterId();
    // this.waterProcessService.settings.next(settings);

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


  getContainerHeight() {
    if (this.content) {
      setTimeout(() => {
        let contentHeight = this.content.nativeElement.clientHeight;
        let headerHeight = this.header.nativeElement.clientHeight;
        let footerHeight = 0;
        if (this.footer) {
          footerHeight = this.footer.nativeElement.clientHeight;
        }
        this.containerHeight = contentHeight - headerHeight - footerHeight;
        this.waterProcessDiagramService.parentContainer.next({
          height: contentHeight,
          headerHeight: headerHeight,
          footerHeight: footerHeight
        })
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

}
