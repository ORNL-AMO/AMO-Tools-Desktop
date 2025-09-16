import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../treasure-hunt.service';


@Component({
    selector: 'app-help-panel',
    templateUrl: './help-panel.component.html',
    styleUrls: ['./help-panel.component.css'],
    standalone: false
})
export class HelpPanelComponent implements OnInit {
  @Input()
  currentTab: string;

  currentField: string;

  currentFieldSub: Subscription;

  constructor(private treasureHuntService: TreasureHuntService) { }

  ngOnInit() {
    this.currentFieldSub = this.treasureHuntService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }

}
