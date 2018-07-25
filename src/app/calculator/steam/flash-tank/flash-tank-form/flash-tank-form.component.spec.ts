import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashTankFormComponent } from './flash-tank-form.component';

describe('FlashTankFormComponent', () => {
  let component: FlashTankFormComponent;
  let fixture: ComponentFixture<FlashTankFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlashTankFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlashTankFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
