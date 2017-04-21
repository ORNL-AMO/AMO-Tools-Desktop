import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-utilities',
  templateUrl: './utilities.component.html',
  styleUrls: ['./utilities.component.css']
})
export class UtilitiesComponent implements OnInit {
  selectedTool: string = 'none';
  constructor() { }

  ngOnInit() {
  }
  showTool(str: string) {
    this.selectedTool = str;
  }

  hideTool() {
    this.selectedTool = 'none'
  }

}
