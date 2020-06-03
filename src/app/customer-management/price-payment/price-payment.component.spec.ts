import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PricePaymentComponent } from './price-payment.component';

describe('PricePaymentComponent', () => {
  let component: PricePaymentComponent;
  let fixture: ComponentFixture<PricePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PricePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PricePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
