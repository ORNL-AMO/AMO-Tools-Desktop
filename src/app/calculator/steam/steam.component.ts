import {Component, Input, OnInit, SimpleChanges} from '@angular/core';

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

  firstChange: boolean = true;

  constructor() { }

  ngOnInit() {
    if (!this.selectedTool) {
      this.selectedTool = 'none';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.firstChange) {
      this.selectedTool = 'none';
    } else {
      this.firstChange = false;
    }
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
