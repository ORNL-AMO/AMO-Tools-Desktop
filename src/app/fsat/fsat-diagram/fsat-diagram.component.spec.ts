import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FsatDiagramComponent } from './fsat-diagram.component';

describe('FsatDiagramComponent', () => {
  let component: FsatDiagramComponent;
  let fixture: ComponentFixture<FsatDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FsatDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FsatDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
