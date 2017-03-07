import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
  }

  tabChange(str: string){
    this.changeTab.emit(str);
  }

}
