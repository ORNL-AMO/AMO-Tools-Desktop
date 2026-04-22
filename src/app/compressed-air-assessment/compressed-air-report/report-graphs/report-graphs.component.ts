import { Component, Input } from '@angular/core';
import { BaselineResults, DayTypeModificationResult } from '../../calculations/caCalculationModels';
import { CompressedAirAssessment, Modification } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentModificationResults } from '../../calculations/modifications/CompressedAirAssessmentModificationResults';
import { CompressedAirModificationValid } from '../../compressed-air-assessment-validation/CompressedAirAssessmentValidation';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-report-graphs',
  templateUrl: './report-graphs.component.html',
  styleUrls: ['./report-graphs.component.css'],
  standalone: false
})
export class ReportGraphsComponent {
  @Input()
  assessmentResults: Array<CompressedAirAssessmentModificationResults>;
  @Input()
  combinedDayTypeResults: Array<{ modification: Modification, combinedResults: DayTypeModificationResult, validation: CompressedAirModificationValid }>;
  @Input()
  compressedAirAssessment: CompressedAirAssessment;
  @Input()
  printView: boolean;
  @Input()
  baselineResults: BaselineResults;
  @Input()
  settings: Settings;

  selectedGraph: 'cost' | 'airflow' | 'energy' = 'cost';

  setSelectedGraph(selectedGraph: 'cost' | 'airflow' | 'energy') {
    this.selectedGraph = selectedGraph;
  }
}
