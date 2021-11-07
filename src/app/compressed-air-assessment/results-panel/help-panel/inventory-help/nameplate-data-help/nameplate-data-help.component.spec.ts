import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDataHelpComponent } from './nameplate-data-help.component';

describe('NameplateDataHelpComponent', () => {
  let component: NameplateDataHelpComponent;
  let fixture: ComponentFixture<NameplateDataHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameplateDataHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameplateDataHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
