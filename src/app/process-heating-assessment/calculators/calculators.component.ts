import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { EnergyEquivalencyService } from '../../calculator/furnaces/energy-equivalency/energy-equivalency.service';
import { EnergyUseService } from '../../calculator/furnaces/energy-use/energy-use.service';
import { O2EnrichmentFormService } from '../../calculator/furnaces/o2-enrichment/o2-enrichment-form.service';
import { O2EnrichmentService } from '../../calculator/furnaces/o2-enrichment/o2-enrichment.service';
import { UnitConverterService } from '../../calculator/utilities/unit-converter/unit-converter.service';
import { CALCULATORS_VIEW_LINKS, ViewLink } from '../models/views';

@Component({
  selector: 'app-calculators',
  standalone: false,
  templateUrl: './calculators.component.html',
  styleUrl: './calculators.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'height: 100%; display: flex; flex-direction: column; overflow: hidden;' },
  // Per-visit instances: the root- and module-provided calculator services otherwise carry inputs between assessments
  providers: [O2EnrichmentFormService, O2EnrichmentService, EnergyEquivalencyService, EnergyUseService, UnitConverterService],
})
export class CalculatorsComponent {
  readonly CALCULATORS_VIEW_LINKS: ViewLink[] = CALCULATORS_VIEW_LINKS;
  readonly mobileTabsOpen: WritableSignal<boolean> = signal(false);

  toggleMobileTabs(): void {
    this.mobileTabsOpen.update(open => !open);
  }

  closeMobileTabs(): void {
    this.mobileTabsOpen.set(false);
  }
}
