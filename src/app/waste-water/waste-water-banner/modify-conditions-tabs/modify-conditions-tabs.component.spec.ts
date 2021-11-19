import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyConditionsTabsComponent } from './modify-conditions-tabs.component';

describe('ModifyConditionsTabsComponent', () => {
  let component: ModifyConditionsTabsComponent;
  let fixture: ComponentFixture<ModifyConditionsTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifyConditionsTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifyConditionsTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
