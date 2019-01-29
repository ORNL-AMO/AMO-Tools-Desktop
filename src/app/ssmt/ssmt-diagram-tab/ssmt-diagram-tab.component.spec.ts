import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtDiagramTabComponent } from './ssmt-diagram-tab.component';

describe('SsmtDiagramTabComponent', () => {
  let component: SsmtDiagramTabComponent;
  let fixture: ComponentFixture<SsmtDiagramTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtDiagramTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtDiagramTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
