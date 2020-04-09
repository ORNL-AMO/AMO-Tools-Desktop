import { Component, OnInit } from '@angular/core';
import { VisualizeService } from './visualize.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {

  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    // if(this.visualizeService.visualizeDataInitialized == false){
    //   this.visualizeService.addNewGraphDataObj();
    //   this.visualizeService.visualizeDataInitialized = true;
    // }
  }

}
