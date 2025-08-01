import { Component, ElementRef, HostListener, inject, Input, Signal, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../shared/analytics/analytics.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { EGridService } from '../../shared/helper-services/e-grid.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, map, tap } from 'rxjs';
import { MAIN_VIEW_LINKS, ProcessCoolingUiService, SETUP_VIEW_LINKS, ViewLink } from '../services/process-cooling-ui.service';

@Component({
  selector: 'app-process-cooling-assessment',
  standalone: false,
  templateUrl: './process-cooling-assessment.component.html',
  styleUrl: './process-cooling-assessment.component.css'
})
export class ProcessCoolingAssessmentComponent {
  // @ViewChild('header', { static: false }) header: ElementRef;
  // @ViewChild('footer', { static: false }) footer: ElementRef;
  // @ViewChild('content', { static: false }) content: ElementRef;
  // containerHeight: number;
  // @HostListener('window:resize', ['$event'])
  // onResize(event) {
  //   this.setContainerHeight();
  // }

  // todo could this be moved to a service and shared to parent component
  mainView: Signal<string>;
  setupView: Signal<string>;

  showWelcomeScreen: boolean = false;
  smallScreenTab: string = 'form';
  showUpdateUnitsModal: boolean = false;

  readonly MAIN_VIEW_LINKS: ViewLink[] = MAIN_VIEW_LINKS;
  readonly SETUP_VIEW_LINKS: ViewLink[] = SETUP_VIEW_LINKS;

  constructor(private assessmentDbService: AssessmentDbService,
    private route: ActivatedRoute,
    private processCoolingAssessmentService: ProcessCoolingAssessmentService,
    private egridService: EGridService,
    private processCoolingUiService: ProcessCoolingUiService,
    private analyticsService: AnalyticsService) {
    this.mainView = this.processCoolingUiService.mainView;
    this.setupView = this.processCoolingUiService.childView;

    this.route.params.pipe(
      map(params => params['assessmentId']),
      distinctUntilChanged(),
      takeUntilDestroyed(),
      tap(id => {
        let assessment = this.assessmentDbService.findById(Number(id));
        this.processCoolingAssessmentService.setAssessment(assessment);
        this.processCoolingAssessmentService.setProcessCooling(assessment.processCooling);

        this.analyticsService.sendEvent('view-process-cooling-assessment', undefined);
        // todo handle concurrently 
        this.egridService.getAllSubRegions();
        this.processCoolingAssessmentService.initAssessmentSettings(assessment);

        // todo move to child set default chiller
        // if (!this.inventoryService.selectedChiller.getValue()) {
        //   this.inventoryService.setDefaultSelectedChiller(assessment.processCooling.inventory);
        // }
      }),
    ).subscribe();

  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.setContainerHeight();
  //   }, 100);
  // }

  // // todo do we need
  // setContainerHeight() {
  //   if (this.content) {
  //     setTimeout(() => {
  //       let contentHeight = this.content.nativeElement.offsetHeight;
  //       let headerHeight = this.header.nativeElement.offsetHeight;
  //       let footerHeight = 0;
  //       if (this.footer) {
  //         footerHeight = this.footer.nativeElement.offsetHeight;
  //       }
  //       this.containerHeight = contentHeight - headerHeight - footerHeight;
  //       if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
  //         this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
  //       }
  //       console.log('container height', this.containerHeight)
  //     }, 100);
  //   }
  // }


  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  get canContinue(): boolean {
    return this.processCoolingUiService.canContinue();
  }

  get canGoBack(): boolean {
    return this.processCoolingUiService.canGoBack();
  }

}