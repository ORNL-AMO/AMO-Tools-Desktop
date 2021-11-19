import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WasteWaterService } from '../../../waste-water.service';
import { concentrationRows } from './concentrationHelp';

@Component({
  selector: 'app-activated-sludge-help',
  templateUrl: './activated-sludge-help.component.html',
  styleUrls: ['./activated-sludge-help.component.css']
})
export class ActivatedSludgeHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;
  concentrationRows: Array<{ influent: number, inert: number, inertInorg: number }>
  displaySuggestions: boolean = false;
  constructor(private wasteWaterService: WasteWaterService) { }

  ngOnInit(): void {
    this.concentrationRows = concentrationRows;
    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

  toggleSuggestions(){
    this.displaySuggestions = !this.displaySuggestions;
  }
}
