import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtmosphereLossesFormComponent } from './atmosphere-losses-form.component';

describe('AtmosphereLossesFormComponent', () => {
  let component: AtmosphereLossesFormComponent;
  let fixture: ComponentFixture<AtmosphereLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtmosphereLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtmosphereLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
