import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyConditionsComponent } from './modify-conditions.component';

describe('ModifyConditionsComponent', () => {
  let component: ModifyConditionsComponent;
  let fixture: ComponentFixture<ModifyConditionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyConditionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
