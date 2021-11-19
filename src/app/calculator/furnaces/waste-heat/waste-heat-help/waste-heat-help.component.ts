import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WasteHeatService } from '../waste-heat.service';

@Component({
  selector: 'app-waste-heat-help',
  templateUrl: './waste-heat-help.component.html',
  styleUrls: ['./waste-heat-help.component.css']
})
export class WasteHeatHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displayDescription: boolean = true;

  constructor(private wasteHeatService: WasteHeatService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.wasteHeatService.currentField.subscribe(val => {
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
