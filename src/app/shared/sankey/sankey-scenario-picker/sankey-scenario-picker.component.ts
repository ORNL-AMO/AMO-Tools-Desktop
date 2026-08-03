import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface SankeyScenarioOption {
  name: string;
  value: any;
}

@Component({
    selector: 'app-sankey-scenario-picker',
    templateUrl: './sankey-scenario-picker.component.html',
    styleUrls: ['./sankey-scenario-picker.component.css'],
    standalone: false
})
export class SankeyScenarioPickerComponent {
  @Input()
  options: Array<SankeyScenarioOption>;
  @Input()
  selected: boolean;
  @Output()
  selectedChange = new EventEmitter<any>();

  @Input()
  costSavings: number;
  @Input()
  energySavings?: number;
  @Input()
  energySavingsUnit?: string;
  @Input()
  stackVertically?: boolean;

  onSelectionChange(value: any) {
    this.selectedChange.emit(value);
  }
}
