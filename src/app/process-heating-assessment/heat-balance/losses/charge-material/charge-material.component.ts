import { ChangeDetectionStrategy, Component, inject, OnInit, Signal } from '@angular/core';
import { ChargeMaterialType } from '../../../../shared/models/phast/losses/chargeMaterial';
import { Settings } from '../../../../shared/models/settings';
import { ProcessHeatingAssessmentService } from '../../../services/process-heating-assessment.service';
import { ChargeMaterialService } from './charge-material.service';
import { SolidMaterialFormService } from './solid-form/solid-material-form.service';
import { LiquidMaterialFormService } from './liquid-form/liquid-material-form.service';
import { GasMaterialFormService } from './gas-form/gas-material-form.service';

@Component({
  selector: 'app-charge-material',
  standalone: false,
  templateUrl: './charge-material.component.html',
  styleUrl: './charge-material.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChargeMaterialService, SolidMaterialFormService, LiquidMaterialFormService, GasMaterialFormService],
})
export class ChargeMaterialComponent implements OnInit {
  private readonly assessmentService = inject(ProcessHeatingAssessmentService);
  protected readonly service = inject(ChargeMaterialService);

  protected readonly ChargeMaterialType = ChargeMaterialType;
  readonly settings: Signal<Settings> = this.assessmentService.settingsSignal;

  get resultsUnit(): string {
    const unit = this.settings()?.energyResultUnit;
    return unit === 'kWh' ? 'kW' : `${unit}/hr`;
  }

  ngOnInit(): void {
    const chargeMaterials = this.assessmentService.processHeatingSignal()?.losses?.chargeMaterials ?? [];
    this.service.initialize(chargeMaterials);
  }
}
