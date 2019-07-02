import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FanDiagramImageComponent } from './fan-diagram-image.component';

describe('FanDiagramImageComponent', () => {
  let component: FanDiagramImageComponent;
  let fixture: ComponentFixture<FanDiagramImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FanDiagramImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FanDiagramImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
