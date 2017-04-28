import { Component, OnInit, Output, EventEmitter, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { ModalDirective } from 'ng2-bootstrap';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
@Component({
  selector: 'app-assessment-menu',
  templateUrl: './assessment-menu.component.html',
  styleUrls: ['./assessment-menu.component.css']
})
export class AssessmentMenuComponent implements OnInit {
  @Input()
  allDirectories: Directory;
  @Input()
  directory: Directory;
  @Input()
  view: string;
  @Output('viewChange')
  viewChange = new EventEmitter();
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Output('deleteItems')
  deleteItems = new EventEmitter<boolean>();

  breadCrumbs: Array<Directory>;

  firstChange: boolean = true;
  constructor(private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    this.breadCrumbs = new Array();
    this.getBreadcrumbs(this.directory.id);
    //   this.breadCrumbs = this.getBreadcrumbs(this.directory.name, this.allDirectories);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.directory) && !this.firstChange) {
      if (changes.directory.currentValue.id != changes.directory.previousValue.id) {
        this.breadCrumbs = new Array();
        this.getBreadcrumbs(this.directory.id);
      }
    } else {
      this.firstChange = false;
    }
  }
  setView(view: string) {
    this.viewChange.emit(view);
  }

  goToDirectory(dir) {
    this.directoryChange.emit(dir)
  }

  getBreadcrumbs(dirId: number) {
    this.indexedDbService.getDirectory(dirId).then(
      resultDir => {
        this.breadCrumbs.unshift(resultDir);
        if (resultDir.parentDirectoryId) {
          this.getBreadcrumbs(resultDir.parentDirectoryId);
        }
      }
    )
  }

  deletedb() {
    this.indexedDbService.deleteDb().then((result) => {
      console.log(result);
    });
  }

  signalDeleteItems() {
    this.deleteItems.emit(true);
  }
}
