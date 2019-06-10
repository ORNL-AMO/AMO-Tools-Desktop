import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtDiagramComponent } from './ssmt-diagram.component';

describe('SsmtDiagramComponent', () => {
  let component: SsmtDiagramComponent;
  let fixture: ComponentFixture<SsmtDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
