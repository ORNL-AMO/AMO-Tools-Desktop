import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ChargeMaterialService } from '../charge-material.service';

@Component({
    selector: 'app-charge-material-help',
    templateUrl: './charge-material-help.component.html',
    styleUrls: ['./charge-material-help.component.css'],
    standalone: false
})
export class ChargeMaterialHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  displaySuggestions: boolean = false;
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private chargeMaterialService: ChargeMaterialService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.chargeMaterialService.currentField.subscribe(val => {
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
