import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrls: ['./steam.component.css']
})
export class SteamComponent implements OnInit {
  @Input()
  selectedTool: string;
  @Input()
  goCalcHome: boolean;

  constructor() { }

  ngOnInit() {
  }

  showTool(str: string) {
    this.selectedTool = str;
  }


  getSelectedTool() {
    if (this.selectedTool !== undefined) {
      return this.selectedTool;
    }
  }

}
