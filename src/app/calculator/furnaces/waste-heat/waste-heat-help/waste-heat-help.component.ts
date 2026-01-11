import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WasteHeatService } from '../waste-heat.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-waste-heat-help',
    templateUrl: './waste-heat-help.component.html',
    styleUrls: ['./waste-heat-help.component.css'],
    standalone: false
})
export class WasteHeatHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;
  displayDescription: boolean = true;

  docsLink: string = environment.measurDocsUrl;
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
