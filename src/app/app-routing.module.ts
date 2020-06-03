import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout
import { LayoutComponent } from './layout/component/layout.component';
import { NotFoundComponent } from './not-found/not-found.component';

// Component Admin
import { MainDashboard } from './dashboard/main/main.component';
import { MainCustomerComponent } from './customer-management/main-customer/main-customer.component';
import { CustomerGroupComponent } from './customer-management/customer-group/customer-group.component';
import { DetailCustomerComponent } from './customer-management/detail-customer/detail-customer.component';
import { MainSettingComponent } from './setting/main-setting/main-setting.component';

// Billing
import { MainBillingComponent } from './billing/main-billing/main-billing.component';
import { TransactionComponent } from './billing/transaction/transaction.component';

// User Management
import { RolePermissionComponent } from './user-management/role-permission/role-permission.component';
import { UserAccountComponent } from './user-management/user-account/user-account.component';

// Component Login
import { MainLoginComponent } from './login/main-login/main-login.component';
import { FormLoginComponent } from './login/form-login/form-login.component';
import { ForgotPassComponent } from './login/forgot-pass/forgot-pass.component';
import { NewPasswordComponent } from './login/new-password/new-password.component';
import { ConfirmationComponent } from './login/confirmation/confirmation.component';

// Order
import { MainOrderComponent } from './order/main-order/main-order.component';
import { OrderHistoryComponent } from './order/order-history/order-history.component';
import { DetailOrderHistoryComponent } from './order/detail-order-history/detail-order-history.component';
import { TimebaseComponent } from './order/timebase/timebase.component';
import { KmbaseComponent } from './order/kmbase/kmbase.component';
import { HourlyComponent } from './order/hourly/hourly.component';

// Info Order
import { MainInfoOrderComponent } from './info-order/main-info-order/main-info-order.component';

// Master
import { MasterCityComponent } from './master/master-city/master-city.component';
import { MasterMenuComponent } from './master/master-menu/master-menu.component';
import { MasterBranchComponent } from './master/master-branch/master-branch.component';
import { MainMasterComponent } from './master/main-master/main-master.component';
import { MasterDateComponent } from './master/master-date/master-date.component';

// Product
import { ProductComponent } from './product-price-management/product/product.component';

// Payment
import { MainPayment } from './payment/main/main.component';
import { FormDokuComponent } from './payment/form-doku/form-doku.component';
import { authGuard } from './lib/service/authGuard.service';

const routes: Routes = [
	{ path: '', redirectTo: 'user', pathMatch: 'full' },
	{ path: 'confirmation', redirectTo: 'user/confirmation', pathMatch: 'full' },
	{
		path: 'user',
		component: MainLoginComponent,
		children: [
			{ path: '', redirectTo: 'login', pathMatch: 'full' },
			{ path: 'login', component: FormLoginComponent },
			{ path: 'forgot-pass', component: ForgotPassComponent },
			{ path: 'new-pass', component: NewPasswordComponent },
			{ path: 'confirmation', component: ConfirmationComponent }
		]
	},
	{
		path: 'p',
		component: LayoutComponent,
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: 'dashboard', component: MainDashboard },
			{ path: 'customer-settings/configuration-customer', redirectTo: 'customer-settings', pathMatch: 'full' },
			{ path: 'customer-settings', component: MainCustomerComponent, canActivate: [authGuard] },
			{ path: 'customer-settings/customer-group', component: CustomerGroupComponent, canActivate: [authGuard] },
			{ path: 'customer-settings/configuration-customer/:id', component: DetailCustomerComponent },
			{ path: 'system-settings', component: MainSettingComponent, canActivate: [authGuard] },
			{ path: 'user-management/role-and-permission', component: RolePermissionComponent, canActivate: [authGuard] },
			{ path: 'user-management/user-account', component: UserAccountComponent, canActivate: [authGuard] },
			{ path: 'user-management', component: UserAccountComponent, canActivate: [authGuard] },
			{ path: 'report/report-billing', component: MainBillingComponent, canActivate: [authGuard] },
			{ path: 'report/transaction', component: TransactionComponent, canActivate: [authGuard] },
			{ path: 'reservation', redirectTo: 'reservation/create-reservation', pathMatch: 'full' },
			{ path: 'reservation/create-reservation', component: MainOrderComponent },
			{ path: 'reservation/create-reservation/time-based', component: TimebaseComponent },
			{ path: 'reservation/create-reservation/rental-time-based', component: TimebaseComponent },
			{ path: 'reservation/create-reservation/rental-km-based', component: KmbaseComponent },
			{ path: 'reservation/create-reservation/tms-km-based', component: KmbaseComponent },
			{ path: 'reservation/create-reservation/tms-hourly', component: HourlyComponent },
			{ path: 'reservation/reservation-history', component: OrderHistoryComponent },
			{ path: 'reservation/reservation-history/:id', component: DetailOrderHistoryComponent },
			{ path: 'product-and-pricing-management', component: ProductComponent, canActivate: [authGuard] },
			{
				path: 'master',
				component: MainMasterComponent,
				children: [
					{ path: '', redirectTo: 'master-menu', pathMatch: 'full' },
					{ path: 'master-menu', component: MasterMenuComponent, canActivate: [authGuard] },
					{ path: 'master-city', component: MasterCityComponent, canActivate: [authGuard] },
					{ path: 'master-branch', component: MasterBranchComponent, canActivate: [authGuard] },
					{ path: 'master-date', component: MasterDateComponent }
				]
			}
		]
	},
	{ path: 'payment', component: MainPayment },
	{ path: 'form-doku', component: FormDokuComponent },
	{ path: 'info-order', component: MainInfoOrderComponent },
	{ path: '404', component: NotFoundComponent },
	{ path: '**', redirectTo: '/404' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}
