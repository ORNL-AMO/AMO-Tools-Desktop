import { Component, DestroyRef, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { ProcessCoolingUiService, SETUP_VIEW_LINKS, ViewLink } from '../../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../../process-cooling-assessment.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessCoolingAssessmentService } from '../../services/process-cooling-asessment.service';

@Component({
  selector: 'app-baseline-tabs',
  standalone: false,
  templateUrl: './baseline-tabs.component.html',
  styleUrl: './baseline-tabs.component.css'
})
export class BaselineTabsComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly processCoolingService = inject(ProcessCoolingAssessmentService);
  private readonly destroyRef = inject(DestroyRef);

  smallScreenPanelTab: string = 'help';
  canContinue: boolean = true;

  readonly SETUP_VIEW_LINKS = SETUP_VIEW_LINKS;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  containerHeight: number;
  mainView: Signal<string> = this.processCoolingUiService.mainView;
  setupView: Signal<string> = this.processCoolingUiService.childView;

  isChillerInventoryValid: boolean = false;
  isOperatingScheduleValid: boolean = false;
  isSystemInformationValid: boolean = false;

  ngOnInit(): void {

    this.processCoolingService.isSystemInformationValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isSystemInformationValid = val;
    });

  }

  continue() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }


  setSmallScreenPanelTab(tab: string) {
    this.smallScreenPanelTab = tab;
  }

  isTabInvalid(link: ViewLink): boolean {
    switch (link.view) {
      case ROUTE_TOKENS.systemInformation:
        return !this.isSystemInformationValid;
      default:
        return false;
    }
  }

  isLinkDisabled(link: ViewLink): boolean {
    return !this.processCoolingUiService.canVisitView(link.view);
  }

  handleCanNavigate(event: MouseEvent, link: ViewLink) {
    if (this.isLinkDisabled(link)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }


}
