import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-utilities',
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.css']
})
export class UtilitiesComponent implements OnInit {
  @Input()
  selectedTool: string;
  constructor() { }

  ngOnInit() {
    if(!this.selectedTool){
      this.selectedTool = 'none';
    }
  }
  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none'
  }

}
