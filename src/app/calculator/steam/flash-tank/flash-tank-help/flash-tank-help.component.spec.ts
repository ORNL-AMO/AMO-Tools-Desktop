import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankHelpComponent } from './flash-tank-help.component';

describe('FlashTankHelpComponent', () => {
  let component: FlashTankHelpComponent;
  let fixture: ComponentFixture<FlashTankHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
