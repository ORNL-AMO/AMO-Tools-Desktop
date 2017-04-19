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
  breadCrumbs: Array<string>;

  firstChange: boolean = true;
  constructor(private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    //   this.breadCrumbs = this.getBreadcrumbs(this.directory.name, this.allDirectories);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory && !this.firstChange) {
      this.breadCrumbs = this.getBreadcrumbs(this.directory.name, this.allDirectories);
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

  getBreadcrumbs(targetDirName: string, allDirs: Directory) {
    if (this.breadCrumbs) {
      if (this.breadCrumbs[this.breadCrumbs.length - 1] == targetDirName) {
        return this.breadCrumbs;
      }
    }
    let breadCrumbs = new Array();
    breadCrumbs.push(allDirs);
    if (breadCrumbs[breadCrumbs.length - 1].name == targetDirName) {
      return breadCrumbs;
    } else {
      if (allDirs.subDirectory) {
        let newArr;
        let index = 0;
        for (index; index < allDirs.subDirectory.length; index++) {
          let directory = allDirs.subDirectory[index];
          let test = this.getBreadcrumbs(targetDirName, directory);
          newArr = breadCrumbs.concat(test);
          if (newArr[newArr.length - 1].name == targetDirName) {
            return newArr;
          }
        }
      } else {
        return [];
      }
    }
  }

  test() {
    //this.indexedDbService.addAssessment();
  }

  export() {
    this.indexedDbService.getAssessment(1).then((result) => {
      console.log(result);
    });
  }

  deletedb() {
    this.indexedDbService.deleteDb().then((result) => {
      console.log(result);
    });
  }

}
