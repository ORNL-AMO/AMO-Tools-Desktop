import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeaeratorDiagramComponent } from './deaerator-diagram.component';

describe('DeaeratorDiagramComponent', () => {
  let component: DeaeratorDiagramComponent;
  let fixture: ComponentFixture<DeaeratorDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeaeratorDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeaeratorDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
