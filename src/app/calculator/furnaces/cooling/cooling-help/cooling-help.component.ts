import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { CoolingService } from '../cooling.service';

@Component({
    selector: 'app-cooling-help',
    templateUrl: './cooling-help.component.html',
    styleUrls: ['./cooling-help.component.css'],
    standalone: false
})
export class CoolingHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displaySuggestions: boolean;

  constructor(private coolingService: CoolingService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.coolingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }
}