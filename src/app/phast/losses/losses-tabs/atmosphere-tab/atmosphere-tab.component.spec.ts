import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereTabComponent } from './atmosphere-tab.component';

describe('AtmosphereTabComponent', () => {
  let component: AtmosphereTabComponent;
  let fixture: ComponentFixture<AtmosphereTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
