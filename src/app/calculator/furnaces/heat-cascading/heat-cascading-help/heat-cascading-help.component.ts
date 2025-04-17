import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { HeatCascadingService } from '../heat-cascading.service';

@Component({
    selector: 'app-heat-cascading-help',
    templateUrl: './heat-cascading-help.component.html',
    styleUrls: ['./heat-cascading-help.component.css'],
    standalone: false
})
export class HeatCascadingHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displayDescription: boolean = true;
  
  constructor(private heatCascadingService: HeatCascadingService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.heatCascadingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  toggleDescription() {
    this.displayDescription = !this.displayDescription;
  }
}
