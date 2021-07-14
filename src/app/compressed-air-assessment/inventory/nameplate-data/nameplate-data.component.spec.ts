import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameplateDataComponent } from './nameplate-data.component';

describe('NameplateDataComponent', () => {
  let component: NameplateDataComponent;
  let fixture: ComponentFixture<NameplateDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameplateDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameplateDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
