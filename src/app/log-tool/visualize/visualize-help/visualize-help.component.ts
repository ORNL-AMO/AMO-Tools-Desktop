import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../visualize.service';

@Component({
  selector: 'app-visualize-help',
  templateUrl: './visualize-help.component.html',
  styleUrls: ['./visualize-help.component.css']
})
export class VisualizeHelpComponent implements OnInit {

  focusedPanel: string;
  focusedPanelSub: Subscription;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit(): void {
    this.focusedPanelSub = this.visualizeService.focusedPanel.subscribe(val => {
      this.focusedPanel = val;
    });
  }

  ngOnDestroy() {
    this.focusedPanelSub.unsubscribe();
  }

}
