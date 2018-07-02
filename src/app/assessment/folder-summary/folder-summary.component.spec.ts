import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderSummaryComponent } from './folder-summary.component';

describe('FolderSummaryComponent', () => {
  let component: FolderSummaryComponent;
  let fixture: ComponentFixture<FolderSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
