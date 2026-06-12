import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PhastResults } from '../../../shared/models/phast/phast';
import { ProcessHeatingResultsService } from '../../services/process-heating-results.service';

@Component({
  selector: 'app-process-heating-assessment-results',
  standalone: false,
  templateUrl: './assessment-results.component.html',
  styleUrl: './assessment-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssessmentResultsComponent {
  private readonly resultsService = inject(ProcessHeatingResultsService);
  readonly baselineResults$: Observable<PhastResults | undefined> = this.resultsService.baselineResults$;
}
