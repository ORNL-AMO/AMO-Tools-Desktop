import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-process-heating-diagram',
  standalone: false,
  templateUrl: './process-heating-diagram.component.html',
  styleUrl: './process-heating-diagram.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProcessHeatingDiagramComponent {}
