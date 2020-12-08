import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereFormComponent } from './atmosphere-form.component';

describe('AtmosphereFormComponent', () => {
  let component: AtmosphereFormComponent;
  let fixture: ComponentFixture<AtmosphereFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AtmosphereFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
