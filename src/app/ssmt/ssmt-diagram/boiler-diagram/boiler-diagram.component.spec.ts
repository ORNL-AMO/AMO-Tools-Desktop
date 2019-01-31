import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BoilerDiagramComponent } from './boiler-diagram.component';

describe('BoilerDiagramComponent', () => {
  let component: BoilerDiagramComponent;
  let fixture: ComponentFixture<BoilerDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoilerDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BoilerDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
