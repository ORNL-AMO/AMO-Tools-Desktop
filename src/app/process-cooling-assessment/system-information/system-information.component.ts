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

    ngOnInit(): void {
    this.processCoolingService.isSystemInformationValid$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(val => {
      this.isSystemInformationValid = val;
    });
  }

  next() {
    this.processCoolingUiService.continue();
  }

  back() {
    this.processCoolingUiService.back();
  }

   isLinkDisabled(link: ViewLink): boolean {
      return link.view !== ROUTE_TOKENS.tower && !this.isSystemInformationValid;
    }
  
    handleCanNavigate(event: MouseEvent, link: ViewLink) {
      if (this.isLinkDisabled(link)) {
        event.preventDefault();
      } else {
        return null;
      }
    }
}
