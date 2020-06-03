import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { SelectItem, Paginator, FileUpload } from 'primeng/primeng';
import * as _ from 'lodash';
import * as Papa from 'papaparse/papaparse.min.js';
import * as queryString from 'query-string';
import * as moment from 'moment';

import { Message } from 'primeng/components/common/api';

import { store } from '../../lib/service/reducer.service';
import { CustomerManagementService } from '../customer-management.service';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';
import { MainService } from '../../lib/service/main.service';
import { UserManagemenetService } from '../../user-management/user-managemenet.service';
import { OrderService } from '../../order/order.service';

@Component({
	selector: 'app-price-payment',
	templateUrl: './price-payment.component.html',
	styleUrls: ['./price-payment.component.scss']
})
export class PricePaymentComponent implements OnInit {
	// ================================================= //
	// Propeties
	// ================================================= //
	public data = [];
	public cols: any[];
	public dataTableLoad: Boolean;
	public dateFilter: any;
	public errorHandling: any = {};
	public colsImport: any[];
	public percentage: boolean = true;
	private time = new Date('2018-08-16T00:00:00.000Z');
	private schemePayment;
	public loading: boolean = true;
	private priceValue: SelectItem[] = [
		{ label: 'Percentage', value: 'Percentage' },
		{ label: 'Nominal', value: 'Rupiah' }
	];
	// Calendar
	// ============================= //
	private periodeDateValue: Date[] = [new Date(), new Date()];
	private minDateValue: Date;
	private maxDateValue: Date;
	private disableMaxDate = true;
	public isUpdate: Boolean = false;
	selectPeriodeDateValue(e) {}
	readDatePeriode() {
		if (this.periodeDateValue[1] == null) {
			this.periodeDateValue = [this.periodeDateValue[0], this.periodeDateValue[0]];
		}
	}
	@ViewChild('customFilter') customFilter;
	@ViewChild('p') paginator: Paginator;
	@ViewChild('fileInput') fileInput: FileUpload;

	constructor(
		private mainService: MainService,
		private detailCustomer: DetailCustomerComponent,
		private userManagemenetService: UserManagemenetService,
		private cmService: CustomerManagementService,
		private orderService: OrderService,
		private elementRef: ElementRef
	) {}
	@Input() disableNext: boolean;
	@Input() isOpen: boolean;
	@Output() onSave = new EventEmitter();

	ngOnInit() {
		//history budget
		this.cols = [
			{
				field: 'CostCenterName',
				header: 'Cost Center',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			},
			{
				field: 'PICName',
				header: 'Pic',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			},
			{
				field: 'InitialBudget',
				header: 'Initial Budget',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			},
			{
				field: 'CurrentBudget',
				header: 'Current Budget',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			},
			{
				field: 'LimitBudget',
				header: 'Budget Limit',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			},
			{
				field: 'created_at',
				header: 'Top Up Date',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.customFilter,
				checked: true,
				disableCol: false
			}
		];

		this.schemePayment = {
			CustomerId: this.detailCustomer['CustomerId'],
			PaymentTypeId: null,
			PaymentSchemeId: null,
			Detail: []
		};

		this.filterObjPriceProduct = [];
		this.arrDates = [];
		_.times(31, x => {
			let obj = { activate: false, value: x + 1 };
			this.arrDates.push(obj);
		});
		this.colsImport = [
			{
				field: 'ErrorLine',
				header: 'Error Line'
			},
			{
				field: 'ErrorMessage',
				header: 'Error Message'
			}
		];
	}

	public displayUploadCsv: boolean = false;
	public submitButtonCsv: boolean = false;
	public arrObjCsv = [];
	//upload product price
	onFileSelect(file: File) {
		this.arrObjCsv = [];
		Papa.parse(file, {
			complete: results => {
				//this.arrObjCsv=results.data;
				let keys = results.data[0];
				let check = _.filter(results.data, key => {
					return key != '';
				});
				_.map(check, (x, i) => {
					let obj = _.zipObject(keys, x);
					if (i != 0) {
						this.arrObjCsv.push(obj);
					}
				});
			}
		});
	}
	// Open Upload CSV
	// =========================== //
	public loaded: Boolean = true;
	openUploadCsv() {
		this.loaded = false;
		this.displayUploadCsv = true;
		this.fileInput.clear();
		this.arrObjCsv = [];
		setTimeout(() => {
			this.loaded = true;
		}, 300);
	}
	// Remove Object CSV
	// =========================== //
	onRemoveUploadCsv() {
		this.arrObjCsv = [];
	}
	// Close Upload CSV
	// =========================== //
	closeDialogCsv() {
		this.showErrorImport = false;
		this.dataError = [];
		this.displayUploadCsv = false;
		this.fileInput.clear();
		this.arrObjCsv = [];
	}
	// Post CSV
	// =========================== //

	public showErrorImport: Boolean = false;
	public dataError = [];
	private dataErrorUpload = [];
	postCsv() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let obj = this.arrObjCsv;
		let empty = true;
		let errorIndividual = [];
		let ErrorLine = [];
		let objDataError = {};
		this.dataErrorUpload = [];
		Object.keys(obj).forEach(key => {
			if (
				obj[key].CityId == '' ||
				obj[key].CustomerId == '' ||
				obj[key].Duration == '' ||
				obj[key].VehicleType == '' ||
				obj[key].ServiceTypeId == '' ||
				obj[key].FuelId == '' ||
				obj[key].TollAndParkingId == '' ||
				obj[key].DriverOrRiderId == '' ||
				obj[key].ChannelTypeId == '' ||
				obj[key].Price == '' ||
				isNaN(obj[key].Price) ||
				obj[key].AdditionalPrice == '' ||
				isNaN(obj[key].AdditionalPrice)
			)
				empty = false;
			obj[key].BusinessUnitId = dataUser.UserCompanyMapping[0].BusinessUnitId;
			//check validation individual
			let errorCustomer = null;
			let errorBusinessUnitId = null;
			let errorCityId = null;
			let errorLine;
			let i = Number(key) + 1;
			if (obj[key].CustomerId != this.detailCustomer['CustomerId']) {
				errorLine = i;
				errorCustomer = `CutomerId must be ${this.detailCustomer['CustomerId']}.`;
			}
			let businessId = Number(obj[key].BusinessUnitId);
			if (`0${businessId}`.toString() != dataUser.UserCompanyMapping[0].BusinessUnitId.toString()) {
				errorLine = i;
				errorBusinessUnitId = `BusinessUnitId must be ${dataUser.UserCompanyMapping[0].BusinessUnitId}.`;
			}
			let findCity = _.find(this.cities, { CityId: obj[key].CityId });
			if (findCity == undefined) {
				errorLine = i;
				errorCityId = 'CityId is Incorrect.';
			}

			if (errorLine != undefined) {
				objDataError = {
					index: ErrorLine[key] = errorLine,
					message: errorIndividual[key] = [errorCustomer, errorBusinessUnitId, errorCityId]
				};
				this.dataErrorUpload.push(objDataError);
			}
		});
		if (!empty) {
			this.msgs = [];
			this.msgs.push({ severity: 'error', summary: 'Error', detail: 'Invalid Data, Please check your file import' });
			return false;
		} else {
			this.showErrorImport = false;
			if (this.dataErrorUpload.length > 0) {
				this.showErrorImport = true;
				this.dataError = this.dataErrorUpload;
				this.fetchErrorImportCSV();
			} else {
				this.dataError = [];
				this.loading = true;
				this.submitButtonCsv = true;
				this.showErrorImport = false;
				this.cmService.importProductPrice(this.arrObjCsv).subscribe(
					res => {
						if (res.ErrorMessage.length > 0) {
							this.dataError = res.ErrorMessage;
							this.showErrorImport = true;
							this.loading = false;
							this.submitButtonCsv = false;
							this.fetchErrorImportCSV();
						} else {
							this.showErrorImport = false;
							this.submitButtonCsv = false;
							this.loading = false;
							this.displayUploadCsv = false;
							this.fileInput.clear();
							this.arrObjCsv = [];
							this.msgs = [];
							this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Product price has been added' });
						}
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.postCsv();
							});
						} else {
							this.submitButton = false;
							this.msgs = [];
							this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
						}
					}
				);
			}
		}
	}

	fetchErrorImportCSV() {
		_.map(this.dataError, item => {
			item['ErrorLine'] = item.index + 1;
			item['ErrorMessage'] = _.filter(item.message, x => x != null).join(' - ');
		});
	}

	ngOnChanges() {
		// this.fetchDataHistoryBudget();
		this.filterServiceType();
		this.fetchFuel();
		_.map(this.originVehicles, (x, i) => {
			_.map(this.selectedProduct, p => {
				this.fetchDuration(x.VehicleTypeId, p, x);
			});
		});

		if (this.isOpen) {
			this.loading = true;
			this.onSaveProductPrice = false;
			this.filterObjPriceProduct = [];
			this.fetchPaymentType();
			this.fetchPaymentScheme();
			this.fetchPrice();
		}
	}

	// ================================================= //
	// CRUD
	// ================================================= //
	public msgs: Message[] = [];
	private submitButton: boolean = false;
	save(e) {
		this.submitButton = true;
		e['BasePriceValue'] = this.BasePriceValue;
		e['CustomerId'] = this.detailCustomer['CustomerId'];
		if (this.PriceId == null) {
			this.cmService.postPrice(e).subscribe(
				res => {
					this.submitButton = false;
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Price'
					});
					this.submitPriceDetail(res.Data[0].ConfigurationPriceAdjustmentId, e);
					this.submitButton = false;
				},
				err => {
					this.submitButton = false;
					this.msgs.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error Price'
					});
				}
			);
		} else {
			// Post Price
			let obj = {
				AdjustmentType: this.AdjustmentType == 'Percentage' ? '%' : 'Rupiah',
				CustomerId: this.detailCustomer['CustomerId'],
				BasePriceValue: this.BasePriceValue
			};

			// Update Price
			// ========================= //
			this.cmService.updatePrice(obj, this.PriceId).subscribe(
				res => {
					this.submitButton = false;
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Update Price'
					});
					this.submitPriceDetail(res.Data.ConfigurationPriceAdjustmentId, e);
					this.submitButton = false;
				},
				err => {
					this.submitButton = false;
					this.msgs.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error Update Price'
					});
				}
			);
		}

		this.submitPayment();
		this.submitProductPrice();
	}
	// Submit Payment
	// ========================= //
	private msgsPayment: Message[] = [];
	private arrBillingTypes = [
		{ label: 'Weekly', value: 'BLT-0001' },
		{ label: 'Date', value: 'BLT-0002' }
	];
	private BillingType = null;
	private arrDates = [];
	private selectArrDate = [];
	selectScheduleDate(e) {
		e.activate = !e.activate;
		this.selectArrDate = [];
		_.map(this.arrDates, x => {
			if (x.activate) {
				this.selectArrDate.push(x.value);
			}
		});
	}

	// Save Payment
	// =========================== //
	private topDays: Number = 0;
	private IsScheduler = null;
	private IsCreditCard: boolean = false;
	private IsNonCVV: boolean = false;
	private IsVirtualAccountBCA: boolean = false;
	private SoScheduler: boolean = true;
	submitPayment() {
		this.msgsPayment = [];
		this.schemePayment['PaymentSchemeId'] = this.selectedschemaPembayaran;
		this.schemePayment['BillingType'] = this.BillingType;
		this.schemePayment['BillingDates'] = this.BillingType == 'BLT-0001' ? _.uniq(this.selectedDay) : this.selectArrDate;
		this.schemePayment['IsScheduler'] = this.IsScheduler ? 1 : 0;
		this.schemePayment['SoScheduler'] = this.SoScheduler ? 0 : 1;
		this.schemePayment['IsCreditCard'] = this.IsCreditCard ? 1 : 0;
		this.schemePayment['IsNonCVV'] = this.IsNonCVV ? 1 : 0;
		this.schemePayment['IsVirtualAccountBCA'] = this.IsVirtualAccountBCA ? 1 : 0;
		this.schemePayment['TopDays'] = this.topDays;

		// Array Detail
		// ==================== //
		let arrDetail = [];
		_.map(this.dataCostCenter, x => {
			let obj = {
				CostCenterId: x.CostCenterId,
				CostCenterName: x.CostCenterName,
				PIC: x.PIC,
				PICName: _.find(x.arrPics, { value: x.PIC }).label,
				PaymentSchemeId: this.selectedschemaPembayaran,
				StartDate: moment(this.periodeDateValue[0]).format('YYYY-MM-DD'),
				EndDate: moment(this.periodeDateValue[1]).format('YYYY-MM-DD'),
				InitialBudget: x.InitialBudget,
				LimitBudget: x.LimitBudget
			};
			arrDetail.push(obj);
		});

		if (this.selectedschemaPembayaran == 'PS0002') {
			this.schemePayment['Detail'] = arrDetail;
		} else if (this.selectedschemaPembayaran == 'PS0003') {
			_.map(arrDetail, val => {
				delete val['StartDate'];
				delete val['EndDate'];
				delete val['InitialBudget'];
				delete val['LimitBudget'];
				delete val['CostCenterName'];
				delete val['PICName'];
			});
			this.schemePayment['Detail'] = arrDetail;
		} else {
			this.schemePayment['Detail'] = [];
		}

		if (this.schemePayment.SoScheduler == 0) {
			this.schemePayment['BillingDates'] = [];
			this.schemePayment['BillingType'] = null;
		}

		if (this.isNull) {
			if (this.selectedPaymentType == 'PT0002') {
				// Update Payment
				// ========================= //
				this.cmService
					.updatePaymentEmploye({ TopDays: this.schemePayment['TopDays'] }, this.detailCustomer['CustomerId'])
					.subscribe(
						res => {
							this.submitButton = false;
							this.msgsPayment.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Success Update Payment'
							});
						},
						err => {
							this.submitButton = false;
							this.msgsPayment.push({
								severity: 'error',
								summary: 'Error',
								detail: 'Error Update Payment'
							});
						}
					);

				// Post Payment
				// ========================= //
				this.cmService.postPayment(this.schemePayment).subscribe(
					resPayment => {
						this.submitButton = false;
						store.dispatch({
							type: 'SET_BILLING_CONFIG_ID',
							value: resPayment.Data.ConfigurationPaymentSchemeId
						});
						this.fetchCityByCustomer();
						this.detailCustomer.updateConfigStep('5');
						this.msgsPayment.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Payment'
						});
					},
					err => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error Payment'
						});
					}
				);
			} else {
				// Post Payment
				// ========================= //
				this.cmService.postPayment(this.schemePayment).subscribe(
					resPayment => {
						this.submitButton = false;
						store.dispatch({
							type: 'SET_BILLING_CONFIG_ID',
							value: resPayment.Data.ConfigurationPaymentSchemeId
						});
						this.fetchCityByCustomer();
						this.detailCustomer.updateConfigStep('5');
						this.msgsPayment.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Payment'
						});
					},
					err => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error Payment'
						});
					}
				);
			}
		} else {
			if (this.selectedPaymentType == 'PT0002') {
				// Update Payment
				// ========================= //
				this.cmService
					.updatePaymentEmploye({ TopDays: this.schemePayment['TopDays'] }, this.detailCustomer['CustomerId'])
					.subscribe(
						res => {
							this.submitButton = false;
							this.msgsPayment.push({
								severity: 'success',
								summary: 'Success',
								detail: 'Success Update Payment'
							});
						},
						err => {
							this.submitButton = false;
							this.msgsPayment.push({
								severity: 'error',
								summary: 'Error',
								detail: 'Error Update Payment'
							});
						}
					);

				// Update Payment
				// ========================= //
				this.cmService.updatePayment(this.schemePayment, this.PaymentSchemeId).subscribe(
					res => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Update Payment'
						});
					},
					err => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error Update Payment'
						});
					}
				);
			} else {
				// Update Payment
				// ========================= //
				this.cmService.updatePayment(this.schemePayment, this.PaymentSchemeId).subscribe(
					res => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Update Payment'
						});
					},
					err => {
						this.submitButton = false;
						this.msgsPayment.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error Update Payment'
						});
					}
				);
			}
		}
	}
	private invalidCostcenter: boolean = false;
	onChangeScheduler() {
		this.schemePayment['PaymentSchemeId'] = this.selectedschemaPembayaran;
		this.schemePayment['BillingType'] = this.BillingType;
		this.schemePayment['BillingDates'] = this.BillingType == 'BLT-0001' ? _.uniq(this.selectedDay) : this.selectArrDate;
		this.schemePayment['IsScheduler'] = this.IsScheduler ? 1 : 0;
		this.schemePayment['SoScheduler'] = this.SoScheduler ? 0 : 1;
		this.schemePayment['IsCreditCard'] = this.IsCreditCard ? 1 : 0;
		this.schemePayment['IsNonCVV'] = this.IsNonCVV ? 1 : 0;
		this.schemePayment['IsVirtualAccountBCA'] = this.IsVirtualAccountBCA ? 1 : 0;
		this.schemePayment['TopDays'] = this.topDays;

		if (!this.isNull) {
			delete this.schemePayment['Detail'];
			this.submitButton = true;
			this.cmService.updatePayment(this.schemePayment, this.PaymentSchemeId).subscribe(
				res => {
					this.submitButton = false;
					this.loading = true;
					this.fetchPaymentType();
					this.fetchPaymentScheme();
					this.fetchPrice();
					this.fetchPayment();
					this.msgs.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Update Payment'
					});
				},
				err => {
					this.submitButton = false;
					this.msgs.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error Update Payment'
					});
				}
			);
		}
	}

	// Update Billig Date
	// ============================= //
	private onUpdateBillingDate: boolean = false;
	updateBillingDates() {
		let arrDates = [];

		if (this.isNullBillingDate) {
			_.map(this.selectArrDate, x => {
				let dateValue = moment(x, 'DD').format('YYYY-MM-DD');
				arrDates.push(dateValue);
			});
		} else {
			_.map(this.dateBilling, x => {
				let dateValue = moment(x).format('YYYY-MM-DD');
				arrDates.push(dateValue);
			});
		}

		let obj = {
			BillingType: this.BillingType,
			BillingDates: this.BillingType == 'BLT-0001' ? _.uniq(this.selectedDay) : arrDates
		};
		this.onUpdateBillingDate = true;
		this.msgs = [];
		this.cmService.updateBillingDate(obj, this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.onUpdateBillingDate = false;

				if (obj.BillingType == 'BLT-0002') {
					this.isNullBillingDate = false;
				} else {
					this.isNullBillingDate = true;
				}

				this.fetchPayment();
				this.msgs.push({
					severity: 'success',
					summary: 'Success',
					detail: 'Success Update billing date'
				});
			},
			err => {
				this.onUpdateBillingDate = false;
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Error Update Payment billing date'
				});
			}
		);
	}
	clearClickDate() {}

	// Select Day
	// ========================== //
	private days = [
		{ label: 'Sunday', value: 1 },
		{ label: 'Monday', value: 2 },
		{ label: 'Tuesday', value: 3 },
		{ label: 'Wednesday', value: 4 },
		{ label: 'Thursday', value: 5 },
		{ label: 'Friday', value: 6 },
		{ label: 'Saturday', value: 7 }
	];
	private selectedDay;
	selectDay(e) {
		if (!this.isNull) {
			this.updateBillingDates();
		}
	}
	// Payment Billing Date
	// ========================= //
	private dateBilling: any = [new Date(), new Date()];
	selectBillingDate(e) {
		if (this.isNullBillingDate) {
			if (this.selectArrDate.length) {
				this.updateBillingDates();
			}
		} else {
			let value = this.elementRef.nativeElement.querySelectorAll('.input-date-payment');
			let arrValue = [];
			_.map(value[0].value.split(', '), x => {
				arrValue.push(new Date(moment(x).format('YYYY-MM-DD')));
			});
			this.dateBilling = arrValue;
			if (this.dateBilling.length) {
				this.updateBillingDates();
			}
		}
	}

	// Post Price Cancelation
	// ========================= //
	private msgsPriceCancelation: Message[] = [];
	submitPriceDetail(ConfigPriceAdjustmentId, e) {
		let arrObj = [];
		this.msgsPriceCancelation = [];
		_.map(this.cities, x => {
			let objCancelation = {
				CityId: x.CityId,
				ConfigPriceAdjustmentId: ConfigPriceAdjustmentId,
				CustomerId: x.CustomerId,
				CancelValue: x.CancelValue,
				AdjustmentType: e.AdjustmentType == 'Percentage' ? '%' : 'Rupiah',
				CancelationTime: x.CancelationTime,
				AutoCancelationTime: x.AutoCancelationTime,
				MaxOrderTime: x.MaxOrderTime,
				OutOfTownWeekEnd: x.OutOfTownWeekEnd,
				OutOfTownOverNightWeekEnd: x.OutOfTownOverNightWeekEnd,
				OutOfTownWeekDay: x.OutOfTownWeekDay,
				OutOfTownOverNightWeekDay: x.OutOfTownOverNightWeekDay,
				Id: x.Id
			};
			arrObj.push(objCancelation);
		});

		if (this.nullPriceDetail) {
			_.map(arrObj, x => {
				delete x['Id'];
			});
			this.cmService.postPriceDetail(arrObj).subscribe(
				resPrice => {
					this.msgsPriceCancelation.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Price detail'
					});
				},
				err => {
					this.submitButton = false;
					this.msgsPriceCancelation.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error price detail'
					});
				}
			);
		} else {
			this.cmService.putPriceDetail(arrObj).subscribe(
				resPrice => {
					this.msgsPriceCancelation.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Price detail'
					});
				},
				err => {
					this.submitButton = false;
					this.msgsPriceCancelation.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error price detail'
					});
				}
			);

			let newData = _.filter(arrObj, { Id: undefined });
			if (newData.length) {
				_.map(newData, x => {
					delete x['Id'];
				});
				this.cmService.postPriceDetail(newData).subscribe(
					resPrice => {
						this.msgsPriceCancelation.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Price detail'
						});
					},
					err => {
						this.submitButton = false;
						this.msgsPriceCancelation.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error price detail'
						});
					}
				);
			}
		}
	}

	// Update Budget
	// ============================= //
	private detailUpdateBudget = null;
	updateBudgetLimit(e) {
		let find = _.find(this.detailPayment, {
			ConfigurationPaymentSchemeDetailId: e.DetailId
		});
		let obj = {
			CostCenterName: e.CostCenterName,
			CostCenterId: e.CostCenterId,
			PIC: e.PIC,
			PICName: _.find(e.arrPics, { value: e.PIC }).label,
			InitialBudget: e.InitialBudget,
			LimitBudget: e.LimitBudget,
			Status: 1
		};
		e['statusUpdate'] = true;
		if (_.parseInt(obj['InitialBudget']) >= 100000) {
			//update payment budget
			if (find != undefined) {
				obj['ConfigurationPaymentSchemeDetailId'] = find.ConfigurationPaymentSchemeDetailId;
				obj['ConfigurationPaymentSchemeId'] = find.ConfigurationPaymentSchemeId;
				obj['StartDate'] = find.StartDate;
				obj['EndDate'] = find.EndDate;
				this.cmService.updatePaymentDetail(obj, e.DetailId).subscribe(
					res => {
						e['statusUpdate'] = false;
						this.fetchPayment();
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Update Payment'
						});
						_.map(this.dataCostCenter, x => {
							x['InitialBudget'] = 0;
						});
					},
					err => {
						e['statusUpdate'] = false;
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.updateBudgetLimit(e);
							});
						}
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: 'Failed',
							detail: 'Failed Update Payment'
						});
					}
				);
			} else {
				//insert new budget / row
				obj['ConfigurationPaymentSchemeId'] = this.PaymentSchemeId;
				obj['StartDate'] = moment(this.periodeDateValue[0]).format('YYYY-MM-DD');
				obj['EndDate'] = moment(this.periodeDateValue[1]).format('YYYY-MM-DD');
				this.cmService.InsertPaymentDetail(obj).subscribe(
					res => {
						e['statusUpdate'] = false;
						this.fetchPayment();
						this.msgs = [];
						this.msgs.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success Insert Payment'
						});
						_.map(this.dataCostCenter, x => {
							x['InitialBudget'] = 0;
						});
					},
					err => {
						e['statusUpdate'] = false;
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.updateBudgetLimit(e);
							});
						}
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: 'Failed',
							detail: 'Failed Insert Payment'
						});
					}
				);
			}
		} else {
			e['statusUpdate'] = false;
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Failed',
				detail: 'Minimal Top Up Rp. 100.000'
			});
		}
	}

	// Submit Product Price
	// ============================= //
	private msgsProductPrice: Message[] = [];
	private onSaveProductPrice: boolean = false;
	submitProductPrice() {
		let arrProductPrice = [];
		this.msgsProductPrice = [];
		_.map(this.objPriceProduct, x => {
			let obj = {
				CityId: x.CityId,
				CustomerId: this.detailCustomer['CustomerId'],
				Duration: x.Duration,
				VehicleType: x.VehicleType,
				Price: x.Price,
				ServiceTypeId: x.ServiceTypeId,
				FuelId: x.FuelId,
				TollAndParkingId: x.TollAndParkingId,
				DriverOrRiderId: x.DriverOrRiderId,
				ChannelTypeId: x.ChannelTypeId,
				AdditionalPrice: x.AdditionalPrice,
				Id: x.Id,
				CrewId: null,
				CoverageAreaId: null
			};
			arrProductPrice.push(obj);
		});
		if (this.nullProductPrice) {
			_.map(arrProductPrice, x => {
				delete x['Id'];
			});
			this.cmService.postProductPricePayment(arrProductPrice).subscribe(
				res => {
					this.msgsProductPrice.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success post product price'
					});
					this.onSaveProductPrice = true;
					this.fetchPrice();
				},
				err => {
					this.msgsProductPrice.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error post product price'
					});
				}
			);
		} else {
			let arrNewProductPrice = [];
			let arrOldProductPrice = [];
			_.map(arrProductPrice, x => {
				let getNew = _.includes(this.avilableCity, x.CityId);
				if (getNew) {
					arrOldProductPrice.push(x);
				} else {
					arrNewProductPrice.push(x);
				}
			});

			// Update Product Price
			this.cmService.putProductPricePayment(arrOldProductPrice).subscribe(
				res => {
					this.msgsProductPrice.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success update product price'
					});
					this.onSaveProductPrice = true;
					this.fetchPrice();
				},
				err => {
					this.msgsProductPrice.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error update product price'
					});
				}
			);

			// Post Product Price
			if (arrNewProductPrice.length) {
				this.cmService.postProductPricePayment(arrNewProductPrice).subscribe(
					res => {
						this.msgsProductPrice.push({
							severity: 'success',
							summary: 'Success',
							detail: 'Success post product price'
						});
						this.onSaveProductPrice = true;
						this.fetchPrice();
					},
					err => {
						this.msgsProductPrice.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Error post product price'
						});
					}
				);
			}
		}
	}
	// Config Product Price
	// =========================== //
	public displayProductPrice: boolean = false;
	public selectedProductPrice = null;
	public priceProductValue = 0;
	public AdditionalPrice = 0;

	updateProductPrice(e) {
		this.isUpdate = false;
		if (e.ConfigurationPriceProductId != undefined) {
			this.isUpdate = true;
		}
		this.displayProductPrice = true;
		this.selectedProductPrice = e;
		this.selectedFuel = e.FuelId;
		this.selectedParking = e.TollAndParkingId;
		this.selectedDriver = e.DriverOrRiderId;
		this.priceProductValue = e.Price;
		this.AdditionalPrice = Number(e.AdditionalPrice);
		this.selectedChannel = e.ChannelTypeId;
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}

	private msgUpdateAdjustment: Message[] = [];
	updateAdjustment(param, e) {
		this.loading = true;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (e.AdjustmentType == 'Percentage') {
			e.AdjustmentType = '%';
		} else {
			e.AdjustmentType = 'Rupiah';
		}
		this.msgUpdateAdjustment = [];
		let adjustmentId = param.ConfigPriceAdjustmentDetailId;
		let Objtmp = {
			CityId: param.CityId,
			ConfigPriceAdjustmentId: param.ConfigPriceAdjustmentId,
			CustomerId: param.CustomerId,
			CancelValue: param.CancelValue,
			AdjustmentType: e.AdjustmentType,
			BusinessUnitId: dataUser.UserCompanyMapping[0].BusinessUnitId,
			CancelationTime: param.CancelationTime,
			AutoCancelationTime: param.AutoCancelationTime,
			MaxOrderTime: param.MaxOrderTime,
			OutOfTownWeekEnd: param.OutOfTownWeekEnd,
			OutOfTownOverNightWeekEnd: param.OutOfTownOverNightWeekEnd,
			OutOfTownWeekDay: param.OutOfTownWeekDay,
			OutOfTownOverNightWeekDay: param.OutOfTownOverNightWeekDay
		};
		if (adjustmentId != null) {
			_.map(Objtmp, val => {
				delete val['ConfigPriceAdjusmentId'];
				delete val['AdjustmentType'];
				delete val['CustomerId'];
				delete val['BusinessUnitId'];
			});
			this.cmService.putPriceDetailById(Objtmp, adjustmentId).subscribe(
				resPrice => {
					this.fetchCityByCustomer();
					this.loading = false;
					this.msgUpdateAdjustment.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success price detail'
					});
				},
				err => {
					this.msgUpdateAdjustment.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error price detail'
					});
					this.loading = false;
				}
			);
		} else {
			this.cmService.postPriceDetail(Objtmp).subscribe(
				resPrice => {
					this.fetchCityByCustomer();
					this.loading = false;
					this.msgUpdateAdjustment.push({
						severity: 'success',
						summary: 'Success',
						detail: 'Success Price detail'
					});
				},
				err => {
					this.loading = false;
					this.msgUpdateAdjustment.push({
						severity: 'error',
						summary: 'Error',
						detail: 'Error price detail'
					});
				}
			);
		}
	}

	closeDialogProductPrice() {
		this.displayProductPrice = false;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}
	private invalidateProductPrice: boolean = true;
	saveProductPrice(e) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let find = _.find(this.objPriceProduct, this.selectedProductPrice);
		find.FuelId = e.Fuel;
		find.TollAndParkingId = e.TollParking;
		find.DriverOrRiderId = e.DriverRider;
		find.ChannelTypeId = e.Channel;
		find.Price = e.price;
		find.AdditionalPrice = Number(e.AdditionalPrice);

		//start update individu==========================
		let objProdAndPrice = {
			CityId: find.CityId,
			CustomerId: find.CustomerId,
			Duration: find.Duration,
			VehicleType: find.VehicleType,
			Price: find.Price,
			ServiceTypeId: find.ServiceTypeId,
			FuelId: find.FuelId,
			TollAndParkingId: find.TollAndParkingId,
			DriverOrRiderId: find.DriverOrRiderId,
			ChannelTypeId: find.ChannelTypeId,
			AdditionalPrice: find.AdditionalPrice,
			BusinessUnitId: dataUser.UserCompanyMapping[0].BusinessUnitId,
			CrewId: null,
			CoverageAreaId: null
		};

		this.readEmptyFieldProductPrice();

		if (find.ConfigurationPriceProductId != undefined) {
			delete objProdAndPrice['BusinessUnitId'];
			this.cmService.updateIndiPriceAndProduct(objProdAndPrice, find.ConfigurationPriceProductId).subscribe(res => {
				if (res.Data.length > 0) {
					this.displayProductPrice = false;
				}
			});
		} else {
			this.cmService.saveIndiPriceAndProduct(objProdAndPrice).subscribe(res => {
				if (res.Data.length > 0) {
					let data = res.Data[0];
					find['ConfigurationPriceProductId'] = data.ConfigurationPriceProductId;
					this.displayProductPrice = false;
				}
			});
		}
		//end update individu==========================

		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}

	readEmptyFieldProductPrice() {
		let findChannelTypeIdNull = _.find(this.objPriceProduct, {
			ChannelTypeId: null
		});
		if (findChannelTypeIdNull == undefined) {
			this.invalidateProductPrice = false;
		} else {
			this.invalidateProductPrice = true;
		}

		let findDriverOrRiderIdNull = _.find(this.objPriceProduct, {
			DriverOrRiderId: null
		});
		if (findDriverOrRiderIdNull == undefined) {
			this.invalidateProductPrice = false;
		} else {
			this.invalidateProductPrice = true;
		}

		let findFueldNull = _.find(this.objPriceProduct, { FuelId: null });
		if (findFueldNull == undefined) {
			this.invalidateProductPrice = false;
		} else {
			this.invalidateProductPrice = true;
		}

		let tollAndParkingNull = _.find(this.objPriceProduct, {
			TollAndParkingId: null
		});
		if (tollAndParkingNull == undefined) {
			this.invalidateProductPrice = false;
		} else {
			this.invalidateProductPrice = true;
		}
	}

	// ===================================================================================================================================== //

	// ================================================= //
	// FETCH
	// ================================================= //

	// Fetch Payment Type
	// ============================= //
	private paymentType: SelectItem[] = [];
	public selectedPaymentType = null;
	fetchPaymentType() {
		this.cmService.getPaymentType().subscribe(
			res => {
				this.paymentType = [];
				_.map(res.Data, x => {
					let obj = {
						label: x.PaymentTypeName,
						value: x.PaymentTypeId
					};
					this.paymentType.push(obj);
				});
				this.selectedPaymentType = this.paymentType[0].value;
				this.schemePayment['PaymentTypeId'] = this.paymentType[0].value;
				this.fetchCostCenter();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPaymentType();
					});
				}
			}
		);
	}
	onSelectPaymentType(e) {
		this.schemePayment['PaymentTypeId'] = e.value;
		if (this.selectedPaymentType == 'PT0002') {
			this.filterSchemaPembayaran = _.filter(this.schemaPembayaran, x => {
				return x.value != 'PS0002';
			});
		} else {
			this.filterSchemaPembayaran = this.schemaPembayaran;
		}
	}

	// Fetch Cost Center
	// ============================= //
	private dataCostCenter = [];
	private originConstCenter = [];
	fetchCostCenter() {
		this.cmService.getCostCenter(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.dataCostCenter = [];
				this.originConstCenter = [];
				this.originConstCenter = res.Data;
				_.map(res.Data, x => {
					this.fetchAccount(x.Id);
					let obj = {
						CostCenterId: x.Id,
						CostCenterName: x.CostCenterName,
						arrPics: [],
						PIC: null,
						PaymentSchemeId: null,
						StartDate: null,
						EndDate: null,
						InitialBudget: null,
						CurrentBudget: null,
						LimitBudget: null,
						statusUpdate: false
					};
					this.dataCostCenter.push(obj);
				});
				this.schemePayment['Detail'] = this.dataCostCenter;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenter();
					});
				}
			}
		);
	}

	// Fetch Account
	// ============================= //
	fetchAccount(id) {
		this.cmService.getUser(this.detailCustomer['CustomerId']).subscribe(
			res => {
				let arrPics = [];
				if (res.Data.length) {
					_.map(res.Data, x => {
						let obj = {
							label: x.FirstName + ' ' + x.LastName,
							value: x.Id
						};
						arrPics.push(obj);
					});

					_.map(this.dataCostCenter, x => {
						let getCostCenter = _.find(this.dataCostCenter, {
							CostCenterId: id
						});
						//lepas pic depedencies 19-12-19 confirm by angger
						x['arrPics'] = arrPics;
					});
				}
				this.fetchPayment();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchAccount(id);
					});
				}
			}
		);
	}
	// Fetch Price
	// ============================= //
	private priceNull: boolean = true;
	private PriceId = null;
	fetchPrice() {
		this.cmService.getPrice(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data.length != 0) {
					this.PriceId = res.Data[0].ConfigurationPriceAdjustmentId;
					if (res.Data.length != 0) {
						this.priceNull = false;

						let obj = res.Data[0];
						if (obj.AdjustmentType == '%' || obj.AdjustmentType == 'Percentage') {
							obj.AdjustmentType = 'Percentage';
						} else {
							obj.AdjustmentType = 'Rupiah';
							this.percentage = false;
						}
						this.AdjustmentType = obj.AdjustmentType;
						this.BasePriceValue = obj.BasePriceValue;

						store.dispatch({
							type: 'SET_PRICE_CONFIG_ID',
							value: res.Data[0].ConfigurationPriceAdjustmentId
						});
						if (this.onSaveProductPrice) {
							this.onSave.emit();
						}
					}
				}
				this.fetchCityByCustomer();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPrice();
					});
				}
			}
		);
	}

	// Fetch Payment Scheme
	// ============================= //
	private schemaPembayaran: SelectItem[] = [];
	private filterSchemaPembayaran = [];
	private schemaPembayaran2: SelectItem[] = [];
	public selectedschemaPembayaran = null;
	fetchPaymentScheme() {
		this.cmService.getPaymentScheme().subscribe(
			res => {
				this.schemaPembayaran = [];
				this.filterSchemaPembayaran = [];
				_.map(res.Data, x => {
					let obj = {
						label: x.PaymentSchemeName,
						value: x.PaymentSchemeId
					};

					if (x.PaymentSchemeName != 'Deposit') {
						this.schemaPembayaran.push(obj);
					}
				});
				this.filterSchemaPembayaran = this.schemaPembayaran;
				this.selectedschemaPembayaran = this.schemaPembayaran[0].value;
				this.schemePayment['PaymentSchemeId'] = this.schemaPembayaran[0].value;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPaymentScheme();
					});
				}
			}
		);
	}

	onSelectPaymentScheme(e) {
		this.schemePayment['PaymentSchemeId'] = e.value;
		if (this.selectedschemaPembayaran == 'PS0002' || this.selectedschemaPembayaran == 'PS0003') {
			this.schemePayment['Detail'] = this.dataCostCenter;
		} else {
			this.schemePayment['Detail'] = [];
		}
	}

	// Fetch Data Payment Scheme
	// ============================= //
	private isNull: boolean = true;
	private isNullBillingDate: boolean = true;
	private PaymentId;
	private PaymentSchemeId;
	private detaislNull: boolean = true;
	private detailPayment = [];
	fetchPayment() {
		this.cmService.getPayment(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.detailPayment = [];
				let resData = res.Data;
				if (resData.Id != undefined) {
					if (resData.BillingType == 'BLT-0002') {
						this.isNullBillingDate = false;
					} else {
						this.isNullBillingDate = true;
					}
					this.PaymentId = resData.Id;
					this.PaymentSchemeId = resData.ConfigurationPaymentSchemeId;
					this.selectedschemaPembayaran = resData.PaymentSchemeId;
					this.topDays = Number(resData.TopDays);
					this.BillingType = resData.BillingType;
					this.IsScheduler = resData.IsScheduler == 1 ? true : false;
					this.SoScheduler = resData.SoScheduler == 0 ? true : false;
					this.selectedPaymentType = resData.PaymentTypeId;
					this.detailPayment = resData.details;
					this.IsCreditCard = resData.IsCreditCard == '1' ? true : false;
					this.IsNonCVV = resData.IsNonCVV == '1' ? true : false;
					this.IsVirtualAccountBCA = resData.IsVirtualAccountBCA == '1' ? true : false;
					if (resData.details.length) {
						this.detaislNull = false;
					} else {
						this.detaislNull = true;
					}

					if (resData.BillingDate.length != 0) {
						if (this.BillingType == 'BLT-0002') {
							this.dateBilling = [];
							_.map(resData.BillingDate, x => {
								this.dateBilling.push(new Date(x.BillingDate));
							});
						} else {
							let days = [];
							_.map(resData.BillingDate, x => {
								days.push(moment(x.BillingDate).format('dddd'));
							});
							let uniqueDay = _.sortedUniq(days);
							let setDays = [];
							_.map(uniqueDay, x => {
								let find = _.find(this.days, { label: x });
								if (find != undefined) {
									setDays.push(find.value);
								}
							});
							this.selectedDay = _.uniq(setDays);
						}
					}

					_.map(resData.details, x => {
						let find = _.find(this.dataCostCenter, {
							CostCenterId: x.CostCenterId
						});
						if (find != undefined) {
							find['PIC'] = x.PIC;
							find['InitialBudget'] = null;
							find['LimitBudget'] = _.parseInt(x.LimitBudget);
							find['CurrentBudget'] = _.parseInt(x.CurrentBudget) ? Number(x.CurrentBudget).toLocaleString() : 0;
							find['StartDate'] = x.StartDate;
							find['EndDate'] = x.EndDate;
							find['CostCenterId'] = x.CostCenterId;
							find['DetailId'] = x.ConfigurationPaymentSchemeDetailId;
						}

						this.periodeDateValue = [moment(x.StartDate)['_d'], moment(x.EndDate)['_d']];
						// this.periodeDateValue[1] = moment(x.EndDate)['_d'];
					});

					if (resData != '') {
						this.isNull = false;
						store.dispatch({
							type: 'SET_BILLING_CONFIG_ID',
							value: resData.ConfigurationPaymentSchemeId
						});
					}
				}

				if (this.selectedPaymentType == 'PT0002') {
					this.filterSchemaPembayaran = _.filter(this.schemaPembayaran, x => {
						return x.value != 'PS0002';
					});
				} else {
					this.filterSchemaPembayaran = this.schemaPembayaran;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPayment();
					});
				}
			}
		);
	}

	// Fetch City By Customer For Cancelation Price by city
	// ============================= //
	private cities = [];
	private listPriceProduct = [];
	public originiCities = [];
	public selectedOriginiCities = null;
	fetchCityByCustomer() {
		this.cmService.getCityByCustomer(this.detailCustomer['CustomerId']).subscribe(
			res => {
				this.cities = [];
				this.listPriceProduct = [];
				this.originiCities = res.Data;
				this.selectedOriginiCities = this.originiCities[0];
				_.map(res.Data, x => {
					let obj = {
						ConfigPriceAdjustmentId: this.PriceId,
						CityId: x.CityId,
						CancelValue: 0,
						CustomerId: this.detailCustomer['CustomerId'],
						CancelationTime: null,
						AutoCancelationTime: null,
						MaxOrderTime: null,
						AdditionalHourValue: 0,
						OutOfTownWeekEnd: 0,
						OutOfTownOverNightWeekEnd: 0,
						OutOfTownWeekDay: 0,
						OutOfTownOverNightWeekDay: 0
					};
					this.cities.push(obj);
					let objListCity = {
						arrProduct: [],
						CityId: x.CityId
					};
					this.listPriceProduct.push(objListCity);
				});
				_.map(this.cities, x => {
					this.cmService.getCityDetail(x.CityId).subscribe(res => {
						x['cityName'] = res.Data.MsCityName;
					});
				});
				this.fetchPriceDetail();
				this.fetchVehicleEligibility();
				this.loading = false;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCityByCustomer();
					});
				}
			}
		);
	}
	selectProductCity(e) {
		this.selectedOriginiCities = e;
		this.filterObjPriceProduct = _.filter(this.objPriceProduct, {
			CityId: this.selectedOriginiCities.CityId
		});
	}
	// Fetch Price Cancelation
	// ============================= //
	private nullPriceDetail = true;
	fetchPriceDetail() {
		this.cmService.getPriceDetail(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data.length != 0) {
					this.nullPriceDetail = false;
					_.map(res.Data, x => {
						let find = _.find(this.cities, { CityId: x.CityId });
						if (x.AutoCancelationTime == null) {
							x.AutoCancelationTime = '00:00';
						}

						if (x.CancelationTime == null) {
							x.CancelationTime = '00:00';
						}

						if (x.MaxOrderTime == null) {
							x.MaxOrderTime = '00:00';
						}
						if (find != undefined) {
							find.CancelValue = Number(x.CancelValue).toFixed(0);
							find.Id = x.Id;
							find.OutOfTownOverNightWeekDay = Number(x.OutOfTownOverNightWeekDay).toFixed(0);
							find.OutOfTownWeekDay = Number(x.OutOfTownWeekDay).toFixed(0);
							find.AdditionalHourValue = Number(x.AdditionalHourValue).toFixed(0);
							find.OutOfTownWeekEnd = Number(x.OutOfTownWeekEnd).toFixed(0);
							find.OutOfTownOverNightWeekEnd = Number(x.OutOfTownOverNightWeekEnd).toFixed(0);
							find.ConfigPriceCancelId = x.ConfigPriceCancelId;
							find.CancelationTime = x.CancelationTime;
							find.AutoCancelationTime = x.AutoCancelationTime;
							find.MaxOrderTime = x.MaxOrderTime;
							_.map(this.cities, val => {
								if (val.CityId == x.CityId) {
									val['ConfigPriceAdjustmentDetailId'] = x.ConfigPriceAdjustmentDetailId;
								}
							});
						}
					});
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPriceDetail();
					});
				}
			}
		);
	}

	// Fetch Duration
	// =========================== //
	private originDurations = [];
	private customDurations = [];
	private objPriceProduct = [];
	public filterObjPriceProduct = [];
	private lengthDuration = 0;
	public loadingProductPrice = false;
	fetchDuration(VehicleTypeId, ServiceTypeId, obj) {
		this.objPriceProduct = [];
		this.filterObjPriceProduct = [];
		this.originDurations = [];
		this.loadingProductPrice = true;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let minDateItemTime = moment().format('YYYY-MM-DD');
		let maxDateItemTime = moment().format('YYYY-MM-DD');

		if (dataUser != null) {
			this.orderService
				.getDuration(
					this.detailCustomer['CustomerId'],
					dataUser.UserCompanyMapping[0].BusinessUnitId,
					minDateItemTime,
					maxDateItemTime,
					VehicleTypeId,
					ServiceTypeId,
					true
				)
				.subscribe(
					res => {
						this.originDurations = res.Data;
						this.loadingProductPrice = false;
						if (res.Data != '') {
							this.customDurations = [];
							_.map(res.Data, (x, i) => {
								let mergeObj = _.merge(x, obj);
								this.customDurations.push(mergeObj);
							});

							_.map(this.originiCities, c => {
								_.map(this.customDurations, (x, i) => {
									let obj = {
										CityName: c.MsCityName,
										CityId: c.CityId,
										CustomerId: this.detailCustomer['CustomerId'],
										Duration: x.MaterialId,
										UOM: x.UOM,
										DurationName: x.Duration + ' ' + x.UOM,
										VehicleType: x.VehicleTypeId,
										VehicleTypeName: x.Description,
										Price: 0,
										AdditionalPrice: 0,
										ServiceTypeId: ServiceTypeId,
										FuelId: null,
										TollAndParkingId: null,
										DriverOrRiderId: null,
										ChannelTypeId: null,
										CrewId: null,
										CoverageAreaId: null,
										Id: i
									};
									this.objPriceProduct.push(obj);
								});
							});
							this.filterObjPriceProduct = _.filter(this.objPriceProduct, {
								CityId: this.selectedOriginiCities.CityId
							});
							this.lengthDuration = res.Data.length;
							this.fetchProductPrice();
						}
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.fetchDuration(VehicleTypeId, ServiceTypeId, obj);
							});
						}
						if (err.name == 'TimeoutError') {
							this.fetchDuration(VehicleTypeId, ServiceTypeId, obj);
						}
					}
				);
		}
	}

	// Fetch Product Price
	// ============================== //
	private nullProductPrice = true;
	private avilableCity = [];
	fetchProductPrice() {
		this.cmService.getProductPrice(this.detailCustomer['CustomerId']).subscribe(res => {
			if (res.Data.length) {
				this.nullProductPrice = false;
				_.map(res.Data, x => {
					let find = _.find(this.objPriceProduct, {
						CityId: x.CityId,
						Duration: x.Duration,
						ServiceTypeId: x.ServiceTypeId,
						VehicleType: x.VehicleType
					});
					if (find != undefined) {
						_.merge(find, x);
						find['Id'] = x.Id;
						find['Price'] = Number(x.Price);
					}
					this.avilableCity.push(x.CityId);
				});
				this.readEmptyFieldProductPrice();
			}
		});
	}

	// ============================================================================== //
	// Product Service type
	// ============================================================================== //
	@Input() serviceType: any;
	@Input() dataServiceType: any = [];
	public selectedProduct = [];
	selectProduct(e) {
		if (e.value.length != 0) {
			_.map(this.originVehicles, (x, i) => {
				_.map(this.selectedProduct, p => {
					this.fetchDuration(x.VehicleTypeId, p, x);
				});
			});
			this.selectedOriginiCities = this.originiCities[0];
		} else {
			this.filterObjPriceProduct = [];
		}
	}

	public arrFilterServiceType = [];
	filterServiceType() {
		this.arrFilterServiceType = [];
		this.selectedProduct = [];
		if (this.serviceType.length != 0) {
			_.map(this.serviceType, x => {
				let find = _.find(this.dataServiceType, { value: x });
				if (find != undefined) {
					this.arrFilterServiceType.push(find);
				}
			});
			if (!_.isEmpty(this.arrFilterServiceType.length)) {
				this.selectedProduct = this.arrFilterServiceType[0].value;
			}
		}
	}

	// Fetch Main Eligibility (Vehicle)
	// =========================== //
	private originVehicles = [];
	fetchVehicleEligibility() {
		this.cmService.getEligibility(this.detailCustomer['CustomerId']).subscribe(res => {
			this.originVehicles = res.Data;
		});
	}
	changeVehiclePayment(e, obj) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let minDateItemTime = moment().format('YYYY-MM-DD');
		let maxDateItemTime = moment().format('YYYY-MM-DD');

		if (dataUser != null) {
			this.orderService
				.getDuration(
					this.detailCustomer['CustomerId'],
					dataUser.UserCompanyMapping[0].BusinessUnitId,
					minDateItemTime,
					maxDateItemTime,
					e.value,
					this.selectedProduct,
					false
				)
				.subscribe(
					res => {
						obj.Durations = [];
						let arrDuration = [];
						if (res.Data != '') {
							_.map(res.Data, x => {
								let obj = {
									value: x.MaterialId,
									label: x.Duration + ' ' + x.UOM
								};
								arrDuration.push(obj);
							});
						}
						obj.Durations = arrDuration;
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.changeVehiclePayment(e, obj);
							});
						}

						if (err.name == 'TimeoutError') {
							this.changeVehiclePayment(e, obj);
						}
					}
				);
		}
	}

	// ============================================================================== //
	// Package Options
	// ============================================================================== //

	// Fuels
	// ========================= //
	public fuels = [];
	public selectedFuel = null;
	fetchFuel() {
		this.orderService.getFuel().subscribe(
			res => {
				this.fuels = [];
				_.map(res.Data, x => {
					let obj = { value: x.FuelSAPCode, label: x.Name };
					this.fuels.push(obj);
				});
				this.fetchTollParking();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchFuel();
					});
				}
			}
		);
	}

	// Toll & Parking
	// ========================= //
	public tolls = [];
	public selectedParking = null;
	fetchTollParking() {
		this.orderService.getTollParking().subscribe(
			res => {
				this.tolls = [];
				_.map(res.Data, x => {
					let obj = { value: x.TollandParkingSAPCode, label: x.Name };
					this.tolls.push(obj);
				});
				this.fetchDriverRider();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchTollParking();
					});
				}
			}
		);
	}
	// Driver
	// ========================= //
	public drivers = [];
	public selectedDriver = null;
	fetchDriverRider() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (dataUser != null) {
			this.cmService.getDriverRider().subscribe(
				res => {
					this.drivers = [];
					_.map(res.Data, x => {
						let obj = { value: x.DriverorRiderSAPCode, label: x.Name };
						this.drivers.push(obj);
					});
					this.fetchChanel();
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchDriverRider();
						});
					}
				}
			);
		}
	}

	// Driver Spesification
	// =========================== //
	private driverSpesification = [];
	private selectedDriverSpesification = null;
	fetchDriverSpesification() {
		this.orderService.getDriverSpesification().subscribe(
			res => {
				this.driverSpesification = [];
				this.selectedDriverSpesification = [];
				_.map(res.Data, x => {
					let obj = { value: x.AbilityId, label: x.Description };
					this.driverSpesification.push(obj);
				});
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDriverSpesification();
					});
				}
			}
		);
	}

	// Chanel Type
	// =========================== //
	public channels = [];
	public selectedChannel = null;
	fetchChanel() {
		this.orderService.getChanel().subscribe(
			res => {
				this.channels = [];
				_.map(res.Data, x => {
					let obj = { value: x.ChannelTypeSAPCode, label: x.Name };
					this.channels.push(obj);
				});
				this.fetchDriverSpesification();
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchChanel();
					});
				}
			}
		);
	}
	packageChange(e) {
		if (e.value == 'include') {
			this.selectedFuel = '01';
			this.selectedParking = '01';
			this.selectedDriver = '01';
			this.selectedChannel = '03';
		}
	}

	// ===================================================================================================================================== //

	// ================================================= //
	// EVENT
	// ================================================= //

	// Filed Price
	// ============================= //
	private AdjustmentType: String = 'Percentage';
	private CustomerId: String = this.detailCustomer['CustomerId'];
	private BasePriceValue: Number = 0;

	onChangeValue(e) {
		if (e.value == 'Percentage') {
			this.percentage = true;
			_.map(this.cities, x => {
				if (Number(x.CancelValue) > 100) {
					x.CancelValue = 100;
				}
			});
		} else {
			this.percentage = false;
		}
	}

	public crews = [];
	public selectedCrew = null;

	public coverageAreas = [];
	public selectedCoverageAreas = null;

	// ================================================= //
	// INPUT FOR ALL
	// ================================================= //
	public displayInputForAll: boolean = false;
	public InputOutOfTownOverNightWeekDay;
	public InputOutOfTownWeekDay;
	public InputOutOfTownOverNightWeekEnd;
	public InputOutOfTownWeekEnd;
	public InputCancelValue;
	public InputMaxOrderTime;
	public InputCancelationTime;
	public InputAutoCancelationTime;
	submitInputForAll(e) {
		if (!_.isEmpty(e.InputAutoCancelationTime)) {
			_.map(this.cities, x => {
				x.AutoCancelationTime = e.InputAutoCancelationTime;
			});
		}
		if (!_.isEmpty(e.InputCancelationTime)) {
			_.map(this.cities, x => {
				x.CancelationTime = e.InputCancelationTime;
			});
		}

		if (!_.isEmpty(e.InputMaxOrderTime)) {
			_.map(this.cities, x => {
				x.MaxOrderTime = e.InputMaxOrderTime;
			});
		}

		if (e.InputCancelValue != undefined || e.InputCancelValue != null) {
			_.map(this.cities, x => {
				x.CancelValue = e.InputCancelValue;
			});
		}

		if (e.InputOutOfTownWeekEnd != undefined || e.InputOutOfTownWeekEnd != null) {
			_.map(this.cities, x => {
				x.OutOfTownWeekEnd = e.InputOutOfTownWeekEnd;
			});
		}

		if (e.InputOutOfTownOverNightWeekEnd != undefined || e.InputOutOfTownOverNightWeekEnd != null) {
			_.map(this.cities, x => {
				x.OutOfTownOverNightWeekEnd = e.InputOutOfTownOverNightWeekEnd;
			});
		}

		if (e.InputOutOfTownWeekDay != undefined || e.InputOutOfTownWeekDay != null) {
			_.map(this.cities, x => {
				x.OutOfTownWeekDay = e.InputOutOfTownWeekDay;
			});
		}

		if (e.InputOutOfTownOverNightWeekDay != undefined || e.InputOutOfTownOverNightWeekDay != null) {
			_.map(this.cities, x => {
				x.OutOfTownOverNightWeekDay = e.InputOutOfTownOverNightWeekDay;
			});
		}

		this.displayInputForAll = false;
	}

	handleChange(e) {
		var index = e.index;
		if (index == 3) {
			setTimeout(() => {
				this.fetchDataHistoryBudget();
			}, 200);
		}
	}
	//fetch data history budget
	fetchDataHistoryBudget() {
		this.dataTableLoad = true;
		this.cmService
			.getHistoryBudget(
				this.detailCustomer['CustomerId'],
				this.setUrl + '&page=' + this.page + '&Limit=' + this.pageRows + '&isPaginate=1'
			)
			.subscribe(res => {
				let data = res.Data.data;
				_.map(data, x => {
					x['InitialBudget'] = Number(x.InitialBudget).toLocaleString();
					x['LimitBudget'] = Number(x.LimitBudget).toLocaleString();
					x['CurrentBudget'] = Number(x.CurrentBudget).toLocaleString();
					x['created_at'] = this.convertDateTime(x.created_at);
				});
				this.data = data;
				this.totalRecords = res.Data.total;
				this.dataTableLoad = false;
			});
	}
	convertDateTime(str) {
		var date = moment(str.substring(0, 10)).format('DD MMM YYYY') + ' - ' + str.substring(11, 16);
		return (str = date);
	}
	// Pagination
	// =========================== //
	public page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e) {
		this.page = e.page + 1;
		this.fetchDataHistoryBudget();
	}
	private setUrl = '';
	public searchCostCenter: String;
	public searchPICName: String;
	public selectedDate: Date;
	submitFilter() {
		this.errorHandling = {};
		this.page = 1;
		this.paginator.changePageToFirst(event);
		setTimeout(() => {
			this.fetchDataHistoryBudget();
		}, 300);
		let selectedCostCenter = '';
		if (this.searchCostCenter != null) {
			selectedCostCenter = '&CostCenterName=' + this.searchCostCenter;
		}

		let selectDate;
		if (this.selectedDate == undefined) {
			selectDate = '';
		} else {
			selectDate =
				'&StartDate=' +
				moment(this.selectedDate[0]).format('YYYY-MM-DD') +
				'&EndDate=' +
				moment(this.selectedDate[1]).format('YYYY-MM-DD');
		}
		let selectedPIC = '';
		if (this.searchPICName != null) {
			selectedPIC = '&PICName=' + this.searchPICName;
		}
		this.setUrl = selectedCostCenter + selectDate + selectedPIC;
	}

	resetFilter(event) {
		this.page = 1;
		this.paginator.changePageToFirst(event);
		const parsed = queryString.parse(this.setUrl);
		delete parsed['CostCenterName'];
		delete parsed['PICName'];
		this.setUrl = queryString.stringify(parsed);
		this.searchCostCenter = null;
		this.searchPICName = null;
		this.clearDate();
		setTimeout(() => {
			this.fetchDataHistoryBudget();
		}, 300);
		this.errorHandling = {};
	}

	clearDate() {
		if (this.selectedDate) {
			const parsed = queryString.parse(this.setUrl);
			delete parsed['StartDate'];
			delete parsed['EndDate'];
			this.setUrl = queryString.stringify(parsed);
			this.selectedDate = null;
		}
	}
	downloadXLS() {
		this.dataTableLoad = true;
		if (this.selectedDate != undefined) {
			this.cmService.getHistoryBudget(this.detailCustomer['CustomerId'], this.setUrl + '&isPaginate=0').subscribe(
				res => {
					let arrData = [];
					let data = res.Data;
					_.map(data, x => {
						let obj = {
							'Cost Center': x.CostCenterName,
							'PIC Name': x.PICName,
							'Initial Budget': Number(x.InitialBudget).toLocaleString(),
							'Current Budget': Number(x.CurrentBudget).toLocaleString(),
							'Limit Budget': Number(x.LimitBudget).toLocaleString(),
							'Top Up Date': this.convertDateTime(x.created_at)
						};
						arrData.push(obj);
					});
					this.mainService.exportDataXls(arrData, 'Data History Budget');
					this.dataTableLoad = false;
					this.errorHandling = {};
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.downloadXLS();
						});
					}
					if (err.name == 'TimeoutError') {
						this.downloadXLS();
					}
				}
			);
		} else {
			this.dataTableLoad = false;
			this.errorHandling = { errStatus: true, msg: 'Required' };
		}
	}
	downloadCSV() {
		this.dataTableLoad = true;
		if (this.selectedDate != undefined) {
			this.cmService.getHistoryBudget(this.detailCustomer['CustomerId'], this.setUrl + '&isPaginate=0').subscribe(
				res => {
					let arrData = [];
					let data = res.Data;
					_.map(data, x => {
						let obj = {
							'Cost Center': x.CostCenterName,
							'PIC Name': x.PICName,
							'Initial Budget': Number(x.InitialBudget).toLocaleString(),
							'Current Budget': Number(x.CurrentBudget).toLocaleString(),
							'Limit Budget': Number(x.LimitBudget).toLocaleString(),
							'Top Up Date': this.convertDateTime(x.created_at)
						};
						arrData.push(obj);
					});
					this.mainService.exportDataCsv(arrData, 'Data History Budget');
					this.dataTableLoad = false;
					this.errorHandling = {};
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.downloadCSV();
						});
					}
					if (err.name == 'TimeoutError') {
						this.downloadCSV();
					}
				}
			);
		} else {
			this.dataTableLoad = false;
			this.errorHandling = { errStatus: true, msg: 'Required' };
		}
	}
}
