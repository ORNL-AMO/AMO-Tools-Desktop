import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeupWaterDiagramComponent } from './makeup-water-diagram.component';

describe('MakeupWaterDiagramComponent', () => {
  let component: MakeupWaterDiagramComponent;
  let fixture: ComponentFixture<MakeupWaterDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeupWaterDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeupWaterDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
