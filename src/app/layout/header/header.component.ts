import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import * as moment from 'moment';
import { store } from '../../lib/service/reducer.service';

// Service
import { MainService } from '../../lib/service/main.service';
import { LayoutService } from '../layout.service';

@Component({
	selector: 'app-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	providers: [MessageService]
})
export class HeaderComponent implements OnInit {
	// ============================================================================= //
	// Properties
	// ============================================================================= //
	public toggle: boolean = false;
	public submitButton: boolean = false;
	public display: boolean = false;
	public displayFullscreen: boolean = false;
	public onLogout: boolean = false;
	public RoleIndicatorId = null;
	public RoleId = null;
	private costCenter = null;
	private paymentSchemeObj;
	public fullName = null;
	private totalOrder = 0;
	public displayProfile: boolean = false;
	public dataUser;

	@Input() showBrand: boolean = true;
	@Output() toggleMobile = new EventEmitter();

	// Notification
	// =========================== //
	public msgs: Message[] = [];
	public msgsError: Message[] = [];

	constructor(private router: Router, private layoutService: LayoutService, private mainService: MainService) {}

	// ============================================================================== //
	// Lifecycle
	// ============================================================================== //
	ngOnInit() {
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			this.dataUser = dataUser;
			this.fullName = dataUser.FirstName + ' ' + dataUser.LastName;
			this.RoleIndicatorId = dataUser.UserIndicator[0].RoleIndicatorId;
			this.RoleId = dataUser.RoleId;

			if (dataUser.UserProfileB2B[0] != null) {
				switch (this.RoleIndicatorId) {
					case 'MRI003':
						this.fetchCostcenter(dataUser.UserProfileB2B[0].OrganizationId);
						break;
					case 'MRI004':
						this.fetchCostcenter(dataUser.UserProfileB2B[0].OrganizationId);
						break;
				}
			}
		}

		// if(this.mainService['order'] != null){
		// 	let dataOrder = JSON.parse(this.mainService['order']).timeBased;
		// 	this.totalOrder = dataOrder.ReservationDetail.length;
		// }
	}

	ngOnChanges() {
		this.showBrand = !this.showBrand;
	}

	// ============================================================================== //
	// Layout Toggle Menu
	// ============================================================================== //
	toggleMenu() {
		this.toggle = !this.toggle;
		this.toggleMobile.emit(this.toggle);
	}

	// ============================================================================== //
	// Event Logout
	// ============================================================================== //
	logout() {
		this.onLogout = true;
		this.layoutService.postLogout().subscribe(
			res => {
				store.dispatch({ type: 'SET_LOGOUT' });
				localStorage.removeItem('token');
				localStorage.removeItem('dataUser');
				this.mainService.updateLocalStorage();
				this.router.navigate(['/user/login']);
			},
			err => {
				this.onLogout = false;
				store.dispatch({ type: 'SET_LOGOUT' });
				if (err.status == 401) {
					localStorage.removeItem('token');
					localStorage.removeItem('dataUser');
					this.mainService.updateLocalStorage();
					this.router.navigate(['/user/login']);
				}

				if (err.name == 'TimeoutError') {
					this.logout();
				}
			}
		);
	}

	// Calendar
	// ============================= //
	public minDateValue: Date = moment()['_d'];
	public minMinDate = moment()['_d'];
	public maxDateValue: Date = moment()['_d'];
	private minMaxDate = moment()['_d'];
	private disableMaxDate = true;
	selectMinDate(e) {
		this.disableMaxDate = false;
	}

	// Budget
	public displaySaldo: boolean = false;
	public lastBudget = 1000000;
	public newBudget = 0;
	private calcBudge;
	openSaldo() {
		this.displaySaldo = true;
	}

	// CostCenter
	// ============================= //
	private CostCenterId = null;
	fetchCostcenter(id) {
		this.layoutService.getCostCenter(id).subscribe(
			res => {
				this.CostCenterId = res.Data[0] && res.Data[0].CostCenterId;
				if (res.Data[0] != null && res.Data[0] != undefined) {
					localStorage.setItem('CostCenterId', res.Data[0].CostCenterId);
					localStorage.setItem('CostCenterName', res.Data[0].CostCenterName);
					this.mainService.updateLocalStorage();
					let dataUser = JSON.parse(this.mainService['dataUser']);
					this.fetchBudget(dataUser.UserProfileB2B[0].CustomerId, this.mainService['CostCenterId']);
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostcenter(id);
					});
				}
			}
		);
	}

	// Fetch Budget
	// ============================= //
	public isBudget: String = null;
	fetchBudget(CustomerId, CostCenterId) {
		this.layoutService.getBudgetSingle(CustomerId, CostCenterId).subscribe(
			res => {
				if (res.Data.length != 0) {
					this.isBudget = res.Data[0].PaymentSchemeId;
					if (res.Data[0].details.length != 0) {
						let data = res.Data[0];
						let detail = data.details[0];
						let dataUser = JSON.parse(this.mainService['dataUser']);
						let costCenter = this.mainService['CostCenterId'];
						this.minDateValue = moment(detail.StartDate)['_d'];
						this.maxDateValue = moment(detail.EndDate)['_d'];
						this.lastBudget = Number(detail.CurrentBudget);

						this.paymentSchemeObj = {
							ConfigurationPaymentSchemeDetailId: detail.ConfigurationPaymentSchemeDetailId,
							ConfigurationPaymentSchemeId: detail.ConfigurationPaymentSchemeId,
							CostCenterId: this.mainService['CostCenterId'],
							PIC: dataUser.UserProfileB2B[0].UserId,
							StartDate: detail.StartDate,
							EndDate: detail.EndDate,
							InitialBudget: detail.InitialBudget,
							LimitBudget: detail.LimitBudget,
							Status: 1
						};
					}
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchBudget(CustomerId, CostCenterId);
					});
				}
			}
		);
	}

	// POST Budget
	// ============================= //
	postBudget(e) {
		this.submitButton = true;
		this.paymentSchemeObj.StartDate = moment(this.minDateValue).format('YYYY-MM-DD');
		this.paymentSchemeObj.EndDate = moment(this.maxDateValue).format('YYYY-MM-DD');
		this.paymentSchemeObj.InitialBudget = this.newBudget;
		//this.paymentSchemeObj.LimitBudget = this.newBudget;
		this.layoutService.postBudget(this.paymentSchemeObj).subscribe(
			res => {
				this.submitButton = false;
				this.displaySaldo = false;

				let dataUser = JSON.parse(this.mainService['dataUser']);
				this.fetchBudget(dataUser.UserProfileB2B[0].CustomerId, this.mainService['CostCenterId']);
				this.newBudget = 0;
				this.msgs = [];
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Sucess topup saldo'
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.postBudget(e);
					});
				}
				this.submitButton = false;
				this.msgsError = [];
				this.msgsError.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Failed topup saldo'
				});
			}
		);
	}
}
