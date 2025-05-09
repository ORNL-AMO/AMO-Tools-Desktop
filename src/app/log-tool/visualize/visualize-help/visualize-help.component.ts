import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { combineLatestWith, debounce, debounceTime, Observable, Subscription } from 'rxjs';
import { GraphInteractivity, GraphObj } from '../../log-tool-models';
import { VisualizeService } from '../visualize.service';

@Component({
    selector: 'app-visualize-help',
    templateUrl: './visualize-help.component.html',
    styleUrls: ['./visualize-help.component.css'],
    animations: [
        trigger('focusedPanelState', [
            state('*', style({
                backgroundColor: '#fff3cd'
            })),
            transition('* => highlight-performance-info', animate('1000ms linear', keyframes([
                style({ backgroundColor: '#fcc71e',
                    offset: 0 }),
                style({ backgroundColor: '#fff3cd',
                    offset: 1.0 }),
            ]))),
            transition('* => highlight-timeseries-info', animate('1000ms linear', keyframes([
                style({ backgroundColor: '#fcc71e',
                    offset: 0 }),
                style({ backgroundColor: '#fff3cd',
                    offset: 1.0 }),
            ]))),
        ])
    ],
    standalone: false
})
export class VisualizeHelpComponent implements OnInit {
  @Input()
  containerHeight: number;
  focusedPanel: string;
  focusedPanelSub: Subscription;
  onUpdateGraphEventsSubscription: Subscription
  graphInteractivity: GraphInteractivity;
  annotationHelpStrings: string[] = ['annotations','large-dataset-annotation','highlight-performance-info']
  constructor(private visualizeService: VisualizeService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.onUpdateGraphEventsSubscription = this.visualizeService.selectedGraphObj
    .pipe(
      combineLatestWith(this.visualizeService.focusedPanel),
      debounceTime(25)
      ).subscribe(([selectedGraphObj, focusedPanel]: any) => {
      if (focusedPanel) {
        this.focusedPanel = focusedPanel;
      }
      // todo what?
      selectedGraphObj = selectedGraphObj? selectedGraphObj : this.visualizeService.selectedGraphObj.getValue();
      this.updateHelpInformation(selectedGraphObj);
    });
  }

  updateHelpInformation(selectedGraphObj: GraphObj) {
    this.graphInteractivity = selectedGraphObj.graphInteractivity;
    this.cd.detectChanges();
  }

  ngOnDestroy() {
    this.onUpdateGraphEventsSubscription.unsubscribe();
  }

}
