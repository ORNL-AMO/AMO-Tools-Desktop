import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndUsesComponent } from './end-uses.component';

describe('EndUsesComponent', () => {
  let component: EndUsesComponent;
  let fixture: ComponentFixture<EndUsesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndUsesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
