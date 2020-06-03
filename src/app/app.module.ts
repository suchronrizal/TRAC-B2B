import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

// Component
import { AppComponent } from './app.component';
import { NotFoundComponent } from './not-found/not-found.component';

// Module
import { UserManagementModule } from './user-management/user-management.module';
import { CustomerManagementModule } from './customer-management/customer-management.module';
import { SettingModule } from './setting/setting.module';
import { LoginModule } from './login/login.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LayoutModule } from './layout/layout.module';
import { OrderModule } from './order/order.module';
import { BillingModule } from './billing/billing.module';
import { MasterModule } from './master/master.module';
import { ProductPriceManagementModule } from './product-price-management/product-price-management.module';
import { AppRoutingModule } from './app-routing.module';
import { PaymentModule } from './payment/payment.module';
import { InfoOrderModule } from './info-order/info-order.module';

import { authGuard } from './lib/service/authGuard.service';
import { KeyFilterModule } from 'primeng/keyfilter';

@NgModule({
	declarations: [AppComponent, NotFoundComponent],
	imports: [
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		DashboardModule,
		BrowserAnimationsModule,
		LayoutModule,
		OrderModule,
		ProductPriceManagementModule,
		BillingModule,
		MasterModule,

		// Module Component
		CustomerManagementModule,
		LoginModule,
		SettingModule,
		UserManagementModule,
		InfoOrderModule,

		PaymentModule,
		KeyFilterModule
	],
	providers: [authGuard, { provide: LocationStrategy, useClass: HashLocationStrategy }],
	bootstrap: [AppComponent]
})
export class AppModule {}
