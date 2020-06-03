import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Message } from 'primeng/components/common/api';
import { CustomerManagementService } from '../customer-management.service';
import { MainService } from '../../lib/service/main.service';
import { OrderService } from '../../order/order.service';
import { store } from '../../lib/service/reducer.service';
import * as _ from 'lodash';

@Component({
	selector: 'app-detail-customer',
	templateUrl: './detail-customer.component.html',
	styleUrls: ['./detail-customer.component.scss']
})
export class DetailCustomerComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public msgsConfig: Message[] = [];
	private CustomerId: String = null;
	public CustomerName;
	public Email;
	public Phone;
	public index: number = 0;
	private schemeObject;

	constructor(
		private mainService: MainService,
		private customerManagementService: CustomerManagementService,
		private activatedRoute: ActivatedRoute,
		private orderService: OrderService,
		private router: Router
	) {}

	ngOnInit() {
		this.activatedRoute.queryParams.subscribe(params => {
			this.customerManagementService.updateBusinessUnitId(params['businessUnitId']);
			this.CustomerId = params['CustomerId'];
		});

		this.fetchData();
		this.fetchConfigurationStep();
		this.fetchServiceType();
		this.fetchCustGroup();
		this.fetchIdSection();

		store.subscribe(() => {
			let config = store.getState().config;
			this.schemeObject = config;
		});
	}

	// ============================================================================== //
	// Validation ID
	// ============================================================================== //
	public finisConfiguration = false;
	fetchData() {
		this.customerManagementService.getCustomerDetail(this.CustomerId).subscribe(
			res => {
				if (res.Data == '') {
					this.router.navigate(['/p/customer-management']);
				} else {
					let data = res.Data[0];
					this.CustomerName = data.CustomerName;
					this.Email = data.Email;
					this.Phone = data.Phone;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
			}
		);

		this.customerManagementService.getDetailCustomer(this.CustomerId).subscribe(
			res => {
				if (!_.isEmpty(res.Data)) {
					this.finisConfiguration = true;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchData();
				}
			}
		);
	}

	// Create Configuratio Step
	// ============================= //
	private isNull: boolean = true;
	private objStep = [
		{
			ConfigName: 'Organization',
			ConfigIndex: '0',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'Eligibity',
			ConfigIndex: '1',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'Account',
			ConfigIndex: '2',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'Approval',
			ConfigIndex: '3',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'City Coverage',
			ConfigIndex: '4',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'Price and Payment',
			ConfigIndex: '5',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		},
		{
			ConfigName: 'Finish Configuration',
			ConfigIndex: '6',
			ConfigStatus: '0',
			ConfigCustomerId: this.CustomerId
		}
	];
	createConfigStep() {
		if (this.isNull) {
			_.map(this.objStep, x => {
				x['ConfigCustomerId'] = this.CustomerId;
				this.customerManagementService.postStepConfiguration(x).subscribe(res => {
					this.doneOrg = null;
					this.doneElg = null;
					this.doneAccount = null;
					this.doneApproval = null;
					this.doneCity = null;
					this.donePrice = null;
				});
			});
		}
	}

	// Update Configuratio Step
	// ============================= //
	updateConfigStep(index) {
		let find = _.find(this.objStep, { ConfigIndex: index });
		let findId = _.find(this.originConfigSteps, { ConfigIndex: index }).Id;
		find['ConfigStatus'] = '1';
		find['ConfigCustomerId'] = this.CustomerId;
		this.customerManagementService.putStepConfiguration(find, findId).subscribe(
			res => {
				this.fetchConfigurationStep();
				this.openTabEvent(Number(index) + 1);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.updateConfigStep(index);
					});
				}
			}
		);
	}
	// Fetch Configuratio Step
	// ============================= //
	private originConfigSteps = [];
	private configSteps = [];
	private isComplete: boolean = false;
	fetchConfigurationStep() {
		this.customerManagementService.getStepConfiguration(this.CustomerId).subscribe(
			res => {
				this.configSteps = [];
				this.originConfigSteps = res.Data;
				if (res.Data.length == 0) {
					this.createConfigStep();
				} else {
					this.isNull = false;
				}

				// Read State Step Configuration
				_.map(res.Data, x => {
					if (x.ConfigStatus == 0) {
						this.configSteps.push(x);
					} else {
						// Disable Position
						let index = Number(x.ConfigIndex);
						switch (index) {
							case 0:
								this.doneOrg = 'done';
								break;
							case 1:
								this.doneElg = 'done';
								this.disableElg = false;
								break;
							case 2:
								this.doneAccount = 'done';
								this.disableAccount = false;
								break;
							case 3:
								this.doneApproval = 'done';
								this.disableApproval = false;
								break;
							case 4:
								this.doneCity = 'done';
								this.disableCity = false;
								break;
							case 5:
								this.donePrice = 'done';
								this.disablePrice = false;
								break;
							case 6:
								this.doneConfiguration = 'done';
								this.disableConfiguration = false;
								break;
							default:
								this.disableConfiguration = false;
						}
					}
				});

				let data = _.orderBy(this.configSteps, 'ConfigIndex');
				_.map(data, x => {
					let index = Number(x.ConfigIndex);
					let openPosition = Number(_.head(data).ConfigIndex);
					this.index = openPosition;

					// Done Position
					switch (index) {
						case 0:
							this.doneOrg = null;
							break;
						case 1:
							this.doneElg = null;
							break;
						case 2:
							this.doneAccount = null;
							break;
						case 3:
							this.doneApproval = null;
							break;
						case 4:
							this.doneCity = null;
							break;
						case 5:
							this.donePrice = null;
							break;
						case 6:
							this.doneConfiguration = null;
							break;
					}

					// Open Disable
					switch (openPosition) {
						case 1:
							this.disableElg = false;
							break;
						case 2:
							this.disableAccount = false;
							break;
						case 3:
							this.disableApproval = false;
							break;
						case 4:
							this.disableCity = false;
							break;
						case 5:
							this.disablePrice = false;
							break;
						case 6:
							this.disableConfiguration = false;
							break;
					}
					this.openTabEvent(openPosition);
				});

				let findStatusZero = _.find(res.Data, { ConfigStatus: '0' });
				if (findStatusZero == undefined) {
					this.isComplete = true;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchConfigurationStep();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchConfigurationStep();
				}
			}
		);
	}

	// Tab Save Organization
	// ============================= //
	public doneOrg = 'loading';
	saveOrg(e) {
		if (this.disableElg) {
			this.disableElg = false;
			this.OpenElg = true;
			this.doneOrg = 'done';
		}

		this.index = 1;
	}

	// Tab Save Eligibility
	// ============================= //
	public disableElg: boolean = true;
	public OpenElg: boolean = false;
	public doneElg = 'loading';
	saveElg(e) {
		if (this.disableAccount) {
			this.disableAccount = false;
			this.OpenAccount = true;
			this.doneElg = 'done';
		}
		this.index = 2;
	}
	// Tab Save Account
	// ============================= //
	public disableAccount: boolean = true;
	public OpenAccount: boolean = false;
	public doneAccount = 'loading';
	saveAccount() {
		if (this.disableApproval) {
			this.disableApproval = false;
			this.OpenApproval = true;
			this.doneAccount = 'done';
		}
		this.index = 3;
	}

	// Tab Save Approval
	// ============================= //
	public disableApproval: boolean = true;
	public OpenApproval: boolean = false;
	public doneApproval = 'loading';
	saveApproval() {
		if (this.disableCity) {
			this.disableCity = false;
			this.OpenCity = true;
			this.doneApproval = 'done';
		}
		this.index = 4;
	}

	// Tab Save City
	// ============================= //
	public disableCity: boolean = true;
	public OpenCity: boolean = false;
	public doneCity = 'loading';
	saveCity() {
		if (this.disablePrice) {
			this.disablePrice = false;
			this.OpenPrice = true;
			this.doneCity = 'done';
		}
		this.index = 5;
	}

	// Tab Save Price & Payment
	// ============================= //
	public disablePrice: boolean = true;
	public disablePackage: boolean = false;
	public OpenPrice: boolean = false;
	public donePrice = 'loading';
	savePayment() {
		if (this.disableConfiguration) {
			this.disablePrice = false;
			this.disableConfiguration = false;
			this.doneConfiguration = 'done';
		}
		this.index = 6;
	}

	// Save Finish Cinfiguration
	// ============================= //
	public submitButton: boolean = false;
	public disableConfiguration: boolean = true;
	public doneConfiguration = null;
	savefinishConfiguration() {
		this.schemeObject['CustomerId'] = this.CustomerId;

		this.submitButton = true;
		this.customerManagementService.postConfiguration(this.schemeObject).subscribe(
			res => {
				this.submitButton = false;
				this.updateConfigStep('6');
				this.finisConfiguration = true;
				this.msgsConfig = [];
				this.msgsConfig.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success Configuration'
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.savefinishConfiguration();
					});
				}
				this.submitButton = false;
				this.msgsConfig = [];
				this.msgsConfig.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Error Configuration'
				});
			}
		);
	}
	fetchIdSection() {
		this.customerManagementService.getDetailByCustomer(this.CustomerId).subscribe(res => {
			if (res.Data != '') {
				store.dispatch({
					type: 'SET_APPROVAL_CONFID_ID',
					value: res.Data.ConfigurationApprovalId
				});
			}
		});
		this.customerManagementService.getPayment(this.CustomerId).subscribe(res => {
			store.dispatch({
				type: 'SET_BILLING_CONFIG_ID',
				value: res.Data.ConfigurationPaymentSchemeId
			});
		});
		this.customerManagementService.getCityByCustomer(this.CustomerId).subscribe(res => {
			if (res.Data.length != 0) {
				store.dispatch({
					type: 'SET_CONFIG_CITY_COVERAGE_ID',
					value: res.Data[0].ConfigurationCityCoverageId
				});
			}
		});
		this.customerManagementService.getDetailELigibility(this.CustomerId).subscribe(res => {
			if (res.Data != '') {
				store.dispatch({
					type: 'SET_ELIGIBILITY_CONFIG_ID',
					value: res.Data.ConfigurationEligibilityId
				});
			}
		});
		this.customerManagementService.getNotifByCustomer(this.CustomerId).subscribe(res => {
			if (res.Data.length != 0) {
				store.dispatch({
					type: 'SET_NOTIFICATION_CONFIG_ID',
					value: res.Data[0].ConfigurationNotificationId
				});
			}
		});
		this.customerManagementService.getPrice(this.CustomerId).subscribe(res => {
			if (res.Data.length != 0) {
				store.dispatch({
					type: 'SET_PRICE_CONFIG_ID',
					value: res.Data[0].ConfigurationPriceAdjustmentId
				});
			}
		});
	}

	// Change Event Tab
	// =========================== //
	onChageTab(e) {
		this.openTabEvent(e.index);
	}
	// Open Tab Event detail
	// =========================== //
	openTabEvent(index) {
		this.OpenElg = false;
		this.OpenAccount = false;
		this.OpenAccount = false;
		this.OpenApproval = false;
		this.OpenCity = false;
		this.OpenPrice = false;

		// Open Disable
		switch (index) {
			case 1:
				this.OpenElg = true;
				break;
			case 2:
				this.OpenAccount = true;
				break;
			case 3:
				this.OpenApproval = true;
				break;
			case 4:
				this.OpenCity = true;
				break;
			case 5:
				this.OpenPrice = true;
				break;
		}
	}
	// Fetch Customer Group Name
	// =========================== //
	public groupconfigs = [];
	fetchCustGroup() {
		this.customerManagementService.getCustomerGroup().subscribe(
			res => {
				this.groupconfigs = [];
				_.map(res.Data, x => {
					let obj = { label: x.CustGroupDesc, value: x.CustGroupId };
					this.groupconfigs.push(obj);
				});
				this.fetchCustomerGroupDetail();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
			}
		);
	}

	// Save Customer Group Name
	// ============================= //
	public disableCustomerGroup: boolean = false;
	changeCustomerGroup() {
		let obj = {
			CustGroupId: this.selectedGroup,
			CustomerId: this.CustomerId
		};
		if (this.selectedCustomerGrupDetail == null) {
			this.customerManagementService.postCustomerGroupDetail(obj).subscribe(
				res => {
					this.msgsConfig = [];
					this.msgsConfig.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Set customer group'
					});
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchServiceType();
						});
					}
					this.msgsConfig = [];
					this.msgsConfig.push({
						severity: 'error',
						summary: 'Failed',
						detail: 'Set customer group'
					});
				}
			);
		} else {
			this.customerManagementService
				.putCustomerGroupDetail(obj, this.selectedCustomerGrupDetail.CustGroupDetailId)
				.subscribe(
					res => {
						this.msgsConfig = [];
						this.msgsConfig.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Update customer group'
						});
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.fetchServiceType();
							});
						}
						this.msgsConfig = [];
						this.msgsConfig.push({
							severity: 'error',
							summary: 'Failed',
							detail: 'Update customer group'
						});
					}
				);
		}
	}

	// Fetch Customer group detail
	// =========================== //
	private selectedCustomerGrupDetail = null;
	public selectedGroup = null;
	fetchCustomerGroupDetail() {
		this.customerManagementService.getCustomerGroupDetail(this.CustomerId).subscribe(res => {
			if (res.Data.length != 0) {
				this.selectedCustomerGrupDetail = res.Data[0];
				this.selectedGroup = res.Data[0].CustGroupId;
			}
		});
	}

	// ============================================================================== //
	// Product Service type
	// ============================================================================== //
	public products = [];
	public selectedProduct = [];
	fetchServiceType() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (dataUser != null) {
			this.orderService.getServiceType(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(
				res => {
					this.products = [];
					if (res.Data.length != 0) {
						_.map(res.Data, x => {
							let obj = { value: x.ServiceTypeId, label: x.ServiceTypeName };
							this.products.push(obj);
						});
					}

					this.fetchServiceTypeDetail();
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchServiceType();
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchServiceType();
					}
				}
			);
		}
	}
	// Fetch Service Type
	// =========================== //
	private ConfigurationServiceTypeId = null;
	public loadingService = true;
	private nullServiceType = true;
	fetchServiceTypeDetail() {
		this.customerManagementService.getServiceType(this.CustomerId).subscribe(
			res => {
				this.loadingService = false;
				if (res.Data.length != 0) {
					this.nullServiceType = false;
					this.ConfigurationServiceTypeId = res.Data[0].ConfigurationServiceTypeId;
					this.schemeObject['ProductConfigId'] = this.ConfigurationServiceTypeId;
					let arrObj = [];
					_.map(res.Data[0].details, x => {
						arrObj.push(x.ServiceTypeId);
					});
					this.selectedProduct = arrObj;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchData();
					});
				}
			}
		);
	}
	// Change Service Type
	// =========================== //
	changeServiceType(e) {
		let obj = {
			CustomerId: this.CustomerId,
			Details: this.selectedProduct
		};
		this.loadingService = true;
		if (this.selectedProduct.length != 0) {
			if (this.nullServiceType) {
				this.customerManagementService.postServiceType(obj).subscribe(
					res => {
						this.msgsConfig = [];
						this.msgsConfig.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success save service type'
						});
						this.loadingService = false;
						this.fetchServiceTypeDetail();
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.fetchData();
							});
						}
						this.msgsConfig = [];
						this.msgsConfig.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Failed save service type'
						});
						this.loadingService = false;
					}
				);
			} else {
				this.customerManagementService
					.putServiceType({ Details: this.selectedProduct }, this.ConfigurationServiceTypeId)
					.subscribe(
						res => {
							this.msgsConfig = [];
							this.msgsConfig.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Success update service type'
							});
							this.loadingService = false;
							this.fetchServiceTypeDetail();
						},
						err => {
							if (err.status == 401) {
								this.mainService.updateToken(() => {
									this.fetchData();
								});
							}
							this.msgsConfig = [];
							this.msgsConfig.push({
								severity: 'error',
								summary: 'Error',
								detail: 'Failed update service type'
							});
							this.loadingService = false;
						}
					);
			}
		} else {
			this.loadingService = false;
			this.msgsConfig = [];
			this.msgsConfig.push({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed save service type, please select service type'
			});
		}
	}
}
