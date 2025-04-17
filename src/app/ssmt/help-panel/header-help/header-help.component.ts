import { Component, OnInit, Input } from '@angular/core';
import { SsmtService } from '../../ssmt.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header-help',
    templateUrl: './header-help.component.html',
    styleUrls: ['./header-help.component.css'],
    standalone: false
})
export class HeaderHelpComponent implements OnInit {
  @Input()
  currentField: string;

  numberOfHeaders: number;
  numberOfHeadersSubscription: Subscription;
  pressureLevel: string;
  pressureLevelSubscription: Subscription;
  isBaselineFocused: boolean;
  isBaselineFocusedSub: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.numberOfHeadersSubscription = this.ssmtService.numberOfHeadersHelp.subscribe(val => {
      this.numberOfHeaders = val;
    });
    this.pressureLevelSubscription = this.ssmtService.headerPressureLevelHelp.subscribe(val => {
      this.pressureLevel = val;
    });
    this.isBaselineFocusedSub = this.ssmtService.isBaselineFocused.subscribe(val => {
      this.isBaselineFocused = val;
    })
  }

  ngOnDestroy() {
    this.numberOfHeadersSubscription.unsubscribe();
    this.pressureLevelSubscription.unsubscribe();
    this.isBaselineFocusedSub.unsubscribe();
  }

}
