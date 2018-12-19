import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankDiagramComponent } from './flash-tank-diagram.component';

describe('FlashTankDiagramComponent', () => {
  let component: FlashTankDiagramComponent;
  let fixture: ComponentFixture<FlashTankDiagramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankDiagramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
