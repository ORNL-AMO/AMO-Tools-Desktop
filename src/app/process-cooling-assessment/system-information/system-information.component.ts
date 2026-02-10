import { Component, DestroyRef, inject, Signal } from '@angular/core';
import { ProcessCoolingUiService, SYSTEM_INFORMATION_VIEW_LINKS, ViewLink } from '../services/process-cooling-ui.service';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';
import { ProcessCoolingAssessmentService } from '../services/process-cooling-asessment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-system-information',
  standalone: false,
  templateUrl: './system-information.component.html',
  styleUrl: './system-information.component.css'
})
export class SystemInformationComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  private readonly processCoolingService = inject(ProcessCoolingAssessmentService);
  private readonly destroyRef = inject(DestroyRef);
  isSystemInformationValid: boolean = false;
  smallScreenPanelTab: string = 'help';

  isModalOpen: boolean = false;
  setupSubView: Signal<string> = this.processCoolingUiService.setupSubView;

  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  SYSTEM_INFORMATION_VIEW_LINKS = SYSTEM_INFORMATION_VIEW_LINKS;

  isPumpValid: boolean = false;
  isCondenserValid: boolean = false;
  isTowerValid: boolean = false;

  // todo this component needs to track validity of all sub-forms and only enable next when all are valid
  ngOnInit(): void {
    this.processCoolingService.isSystemInformationValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isSystemInformationValid = val;
    });

    this.processCoolingService.isPumpValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isPumpValid = val;
    });

    this.processCoolingService.isCondenserValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isCondenserValid = val;
    });

    this.processCoolingService.isTowerValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isTowerValid = val;
    });
  }

  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

  isLinkDisabled(link: ViewLink): boolean {
    return !this.processCoolingUiService.canVisitView(link.view);
  }

  isTabInvalid(link: ViewLink): boolean {
    switch (link.view) {
      case ROUTE_TOKENS.weather:
        return !this.processCoolingService.isWeatherDataValid;
      case ROUTE_TOKENS.waterPump:
        return !this.isPumpValid;
      case ROUTE_TOKENS.condenserCoolingSystem:
        return !this.isCondenserValid;
      case ROUTE_TOKENS.tower:
        return !this.isTowerValid;
      default:
        return false;
    }
  }

  handleSystemInformationNavigation(event: Event, link: ViewLink): void {
    this.processCoolingUiService.navigateSystemInformationTab(link);
  }
}
