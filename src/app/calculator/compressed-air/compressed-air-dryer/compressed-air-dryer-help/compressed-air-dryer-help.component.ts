import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-compressed-air-dryer-help',
  templateUrl: './compressed-air-dryer-help.component.html',
  styleUrl: './compressed-air-dryer-help.component.css',
  standalone: false,
})
export class CompressedAirDryerHelpComponent {
  @Input() currentField: string;
}
