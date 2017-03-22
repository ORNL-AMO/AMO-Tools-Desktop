import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Losses } from '../../../shared/models/phast';

@Component({
  selector: 'app-losses-sidebar',
  templateUrl: './losses-sidebar.component.html',
  styleUrls: ['./losses-sidebar.component.css']
})
export class LossesSidebarComponent implements OnInit {
  @Output('changeTab')
  changeTab = new EventEmitter<string>();
  @Input()
  lossesTab: string;
  @Input()
  losses: Losses;
  @Input()
  lossesStates: any;
  constructor() { }

  ngOnInit() {
    console.log(this.lossesStates);
  }

  tabChange(str: string){
    this.changeTab.emit(str);
  }

}
