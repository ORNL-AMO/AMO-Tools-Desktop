import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ExtendedSurfaceService } from './extended-surface.service';
import { ExtendedSurfaceFormService } from './extended-surface-form.service';

@Component({
  selector: 'app-extended-surface',
  standalone: false,
  templateUrl: './extended-surface.component.html',
  styleUrl: './extended-surface.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ExtendedSurfaceService, ExtendedSurfaceFormService],
})
export class ExtendedSurfaceComponent implements OnInit {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(ExtendedSurfaceService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  ngOnInit(): void {
    const extendedSurfaces = this.assessmentService.processHeatingSignal()?.losses?.extendedSurfaces ?? [];
    this.service.initialize(extendedSurfaces);
  }
}
