import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-steam',
  templateUrl: './steam.component.html',
  styleUrls: ['./steam.component.css']
})
export class SteamComponent implements OnInit {

  selectedTool: string;
  firstChange: boolean = true;
  constructor() { }

  ngOnInit() {
    if (!this.selectedTool) {
      this.selectedTool = 'none';
    }
  }

}
