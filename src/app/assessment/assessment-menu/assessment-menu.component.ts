import { Component, OnInit, Output, EventEmitter, Input, ViewChild, SimpleChanges } from '@angular/core';
import { Directory } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { ImportExportService } from '../../shared/import-export/import-export.service';
import { AssessmentService } from '../assessment.service';

@Component({
  selector: 'app-assessment-menu',
  templateUrl: './assessment-menu.component.html',
  styleUrls: ['./assessment-menu.component.css']
})
export class AssessmentMenuComponent implements OnInit {
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
  @Output('selectAll')
  selectAll = new EventEmitter<boolean>();
  @Output('newDir')
  newDir = new EventEmitter<boolean>();
  @Output('genReport')
  genReport = new EventEmitter<boolean>();
  @Output('exportEmit')
  exportEmit = new EventEmitter<boolean>();
  @Output('importEmit')
  importEmit = new EventEmitter<boolean>();
  @Output('emitMove')
  emitMove = new EventEmitter<boolean>();

  breadCrumbs: Array<Directory>;

  firstChange: boolean = true;

  isAllSelected: boolean;
  createAssessment: boolean = false;
  constructor(private indexedDbService: IndexedDbService, private importExportService: ImportExportService, private assessmentService: AssessmentService) { }

  ngOnInit() {
    this.firstChange = true;
    this.breadCrumbs = new Array();
    this.getBreadcrumbs(this.directory.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.directory) && !this.firstChange) {
      if (changes.directory.currentValue.id != changes.directory.previousValue.id || changes.directory.currentValue.name != changes.directory.previousValue.name) {
        this.breadCrumbs = new Array();
        this.getBreadcrumbs(changes.directory.currentValue.id);
      }
    } else {
      this.firstChange = false;
    }
  }

  // hideModal() {
  //   this.createAssessment = false;
  // }

  showCreateAssessment() {
    this.assessmentService.createAssessment.next(true);
  }

  setView(view: string) {
    this.viewChange.emit(view);
  }

  emitNewDir() {
    this.newDir.emit(true);
  }

  emitGenReport() {
    this.genReport.emit(true);
  }

  goToDirectory(dir) {
    this.directoryChange.emit(dir)
  }

  getBreadcrumbs(dirId: number) {
    this.indexedDbService.getDirectory(dirId).then(
      resultDir => {
        if (resultDir.id != this.directory.id) {
          this.breadCrumbs.unshift(resultDir);
        }
        if (resultDir.parentDirectoryId) {
          this.getBreadcrumbs(resultDir.parentDirectoryId);
        }
      }
    )
  }

  signalDeleteItems() {
    this.deleteItems.emit(true);
  }

  signalSelectAll() {
    this.selectAll.emit(this.isAllSelected);
  }

  emitExport() {
    this.exportEmit.emit(true);
  }

  emitImport() {
    this.importEmit.emit(true);
  }

  checkSelected() {
    let tmpArray = new Array();
    let tmpArray2 = new Array();
    if (this.directory.assessments) {
      tmpArray = this.directory.assessments.filter(
        assessment => {
          if (assessment.selected) {
            return assessment;
          }
        }
      )
    }
    if (this.directory.subDirectory) {
      tmpArray2 = this.directory.subDirectory.filter(
        subDir => {
          if (subDir.selected) {
            return subDir;
          }
        }
      )
    }
    if (tmpArray.length != 0 || tmpArray2.length != 0) {
      return true;
    } else {
      return false;
    }
  }
}
