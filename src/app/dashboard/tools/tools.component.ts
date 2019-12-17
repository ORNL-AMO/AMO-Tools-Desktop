import { Component, OnInit } from '@angular/core';
import { ToolsService } from './tools.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  showAddDataSet: boolean;
  showAddDataSetSub: Subscription;
  constructor(private toolsService: ToolsService) { }

  ngOnInit() {
    this.showAddDataSetSub = this.toolsService.showAddDataSet.subscribe(val => {
      this.showAddDataSet = val;
    })
  }

  ngOnDestroy(){
    this.showAddDataSetSub.unsubscribe();
  }

}
