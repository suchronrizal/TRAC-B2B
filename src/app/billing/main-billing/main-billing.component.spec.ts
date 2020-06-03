import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainBillingComponent } from './main-billing.component';

describe('MainBillingComponent', () => {
  let component: MainBillingComponent;
  let fixture: ComponentFixture<MainBillingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainBillingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
