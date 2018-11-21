import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header-help',
  templateUrl: './header-help.component.html',
  styleUrls: ['./header-help.component.css']
})
export class HeaderHelpComponent implements OnInit {
  @Input()
  currentField: string;

  numberOfHeaders: number;
  numberOfHeadersSubscription: Subscription;
  pressureLevel: string;
  pressureLevelSubscription: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.numberOfHeadersSubscription = this.ssmtService.numberOfHeadersHelp.subscribe(val => {
      this.numberOfHeaders = val;
    })
    this.pressureLevelSubscription = this.ssmtService.headerPressureLevelHelp.subscribe(val => {
      this.pressureLevel = val;
    })
  }

  ngOnDestroy(){
    this.numberOfHeadersSubscription.unsubscribe();
    this.pressureLevelSubscription.unsubscribe();
  }

}
