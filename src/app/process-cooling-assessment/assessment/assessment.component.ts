import { Component, inject, Signal } from '@angular/core';
import { ASSESSMENT_VIEW_LINKS, ProcessCoolingUiService } from '../services/process-cooling-ui.service';
import { Modification } from '../../shared/models/process-cooling-assessment';
import { ROUTE_TOKENS } from '../process-cooling-assessment.module';

@Component({
  selector: 'app-assessment',
  standalone: false,
  templateUrl: './assessment.component.html',
  styleUrl: './assessment.component.css'
})
export class AssessmentComponent {
  private readonly processCoolingUiService = inject(ProcessCoolingUiService);
  readonly ROUTE_TOKENS = ROUTE_TOKENS;
  smallScreenPanelTab: string = 'help';
  isModalOpen: boolean = false;
  selectedModification: Modification;

  ASSESSMENT_VIEW_LINKS = ASSESSMENT_VIEW_LINKS;
  assessmentView: Signal<string> = this.processCoolingUiService.childView;


  selectModification() {

  }

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
