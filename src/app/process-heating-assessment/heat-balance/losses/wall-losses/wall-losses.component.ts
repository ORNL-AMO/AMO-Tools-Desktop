import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { WallLossesService } from './wall-losses.service';
import { WallLossesFormService } from './wall-losses-form.service';

@Component({
  selector: 'app-wall-losses',
  standalone: false,
  templateUrl: './wall-losses.component.html',
  styleUrl: './wall-losses.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WallLossesService, WallLossesFormService],
})
export class WallLossesComponent implements OnInit {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(WallLossesService);

  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  ngOnInit(): void {
    const wallLosses = this.assessmentService.processHeatingSignal()?.losses?.wallLosses ?? [];
    this.service.initialize(wallLosses);
  }
}
