import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { FeedwaterEconomizerService } from '../feedwater-economizer.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-feedwater-economizer-help',
    templateUrl: './feedwater-economizer-help.component.html',
    styleUrls: ['./feedwater-economizer-help.component.css'],
    standalone: false
})
export class FeedwaterEconomizerHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  docsLink: string = environment.measurDocsUrl;
  constructor(private feedWaterEconomizerService: FeedwaterEconomizerService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.feedWaterEconomizerService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
