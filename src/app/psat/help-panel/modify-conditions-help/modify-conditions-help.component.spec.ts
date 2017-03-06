import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyConditionsHelpComponent } from './modify-conditions-help.component';

describe('ModifyConditionsHelpComponent', () => {
  let component: ModifyConditionsHelpComponent;
  let fixture: ComponentFixture<ModifyConditionsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModifyConditionsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyConditionsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
