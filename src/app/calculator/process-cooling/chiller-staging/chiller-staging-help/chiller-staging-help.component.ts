import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { ChillerStagingService } from '../chiller-staging.service';

@Component({
  selector: 'app-chiller-staging-help',
  templateUrl: './chiller-staging-help.component.html',
  styleUrls: ['./chiller-staging-help.component.css']
})
export class ChillerStagingHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private chillerStagingService: ChillerStagingService) { }

  ngOnInit(): void {
    this.currentFieldSub = this.chillerStagingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
