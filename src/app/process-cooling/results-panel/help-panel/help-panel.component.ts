import { Component, effect, WritableSignal } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProcessCoolingUiService } from '../../process-cooling-ui.service';

@Component({
  selector: 'app-help-panel',
  standalone: false,
  templateUrl: './help-panel.component.html',
  styleUrl: './help-panel.component.css'
})
export class HelpPanelComponent {
  assessmentTab: WritableSignal<string>;
  mainTab: WritableSignal<string>;
  setupTab: WritableSignal<string>;

  constructor(private processCoolingUiService: ProcessCoolingUiService) {
    this.mainTab = this.processCoolingUiService.mainTabSignal;
    this.setupTab = this.processCoolingUiService.setupTabSignal;
    this.assessmentTab = this.processCoolingUiService.assessmentTabSignal;
   }

  ngOnInit(): void {}

  ngOnDestroy() {}
}