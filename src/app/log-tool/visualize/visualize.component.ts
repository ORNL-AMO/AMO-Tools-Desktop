import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../log-tool-data.service';
import { LogToolDbService } from '../log-tool-db.service';
import { GraphObj, LoadingSpinner } from '../log-tool-models';
import { VisualizeMenuService } from './visualize-menu/visualize-menu.service';
import { VisualizeService } from './visualize.service';

@Component({
  selector: 'app-visualize',
  templateUrl: './visualize.component.html',
  styleUrls: ['./visualize.component.css']
})
export class VisualizeComponent implements OnInit {

  tabSelect: string = 'results';
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  @ViewChild('tabHeaders', { static: false }) tabHeaders: ElementRef;
  resultsHelpTabHeight: number;
  graphContainerHeight: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    setTimeout(() => {
      this.setResultsTabheight();
    }, 50);
  }

  constructor(private logToolDataService: LogToolDataService,
    private visualizeMenuService: VisualizeMenuService,
    private logToolDbService: LogToolDbService,
    private cd: ChangeDetectorRef,
    private visualizeService: VisualizeService) { }
  loadingSpinnerSub: Subscription;
  tabSelectSubscription: Subscription;
  loadingSpinner: LoadingSpinner;

  ngOnInit() {
    this.loadingSpinnerSub = this.logToolDataService.loadingSpinner.subscribe(loadingSpinner => {
      this.loadingSpinner = loadingSpinner;
      this.cd.detectChanges();
    });

    this.tabSelectSubscription = this.visualizeService.tabSelect.subscribe(tabSelect => {
      if (tabSelect) {
        this.tabSelect = tabSelect
      }
    });
    this.visualizeService.buildGraphData();
    this.setInitialGraphData();
  }

  ngOnDestroy() {
    this.visualizeService.saveUserOptionsChanges();
    this.logToolDbService.saveData();
    this.loadingSpinnerSub.unsubscribe();
    this.tabSelectSubscription.unsubscribe();
  }

  setInitialGraphData() {
    let initialGraphObj: GraphObj = this.visualizeService.selectedGraphObj.getValue();
    if (initialGraphObj.data[0].type == 'bar') {
      if (initialGraphObj.binnedField == undefined || initialGraphObj.binnedField.fieldName != initialGraphObj.selectedXAxisDataOption.dataField.fieldName || initialGraphObj.bins == undefined) {
        initialGraphObj = this.visualizeMenuService.initializeBinData(initialGraphObj);
      }
    }
    this.visualizeMenuService.setGraphType(initialGraphObj);
  }

  setGraphHeight(graphHeight: number) {
    this.graphContainerHeight = graphHeight;
    this.setResultsTabheight();
  }

  setResultsTabheight() {
    if (this.graphContainerHeight !== undefined && this.contentContainer && this.tabHeaders) {
      this.resultsHelpTabHeight = this.contentContainer.nativeElement.offsetHeight - this.graphContainerHeight - this.tabHeaders.nativeElement.offsetHeight - 50;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }
}
