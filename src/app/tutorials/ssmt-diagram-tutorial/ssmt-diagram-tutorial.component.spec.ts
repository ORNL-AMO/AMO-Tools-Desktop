import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SsmtDiagramTutorialComponent } from './ssmt-diagram-tutorial.component';

describe('SsmtDiagramTutorialComponent', () => {
  let component: SsmtDiagramTutorialComponent;
  let fixture: ComponentFixture<SsmtDiagramTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SsmtDiagramTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SsmtDiagramTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
