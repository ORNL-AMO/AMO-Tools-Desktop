import { Component, Input } from '@angular/core';
import { DRYER_TYPE_OPTIONS, getDryerTypeApplicability } from '../compressed-air-dryer-type-config';

@Component({
  selector: 'app-compressed-air-dryer-help',
  templateUrl: './compressed-air-dryer-help.component.html',
  styleUrl: './compressed-air-dryer-help.component.css',
  standalone: false,
})
export class CompressedAirDryerHelpComponent {
  @Input() currentField: string;

  readonly dryerTypeHelp = DRYER_TYPE_OPTIONS.map(option => ({
    label: option.label,
    applicability: getDryerTypeApplicability(option.value),
  }));
}
