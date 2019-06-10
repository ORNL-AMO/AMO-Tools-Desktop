import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankResultsComponent } from './flash-tank-results.component';

describe('FlashTankResultsComponent', () => {
  let component: FlashTankResultsComponent;
  let fixture: ComponentFixture<FlashTankResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
