import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhastDiagramComponent } from './phast-diagram.component';

describe('PhastDiagramComponent', () => {
  let component: PhastDiagramComponent;
  let fixture: ComponentFixture<PhastDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhastDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhastDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
