import { Component, OnInit, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as queryString from 'query-string';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { SelectItem, Paginator } from 'primeng/primeng';
import { MainService } from '../../lib/service/main.service';
import { BillingService } from '../billing.service';

import { Message } from 'primeng/components/common/api';
import * as $ from 'jquery';

@Component({
	selector: 'app-transaction',
	templateUrl: './transaction.component.html',
	styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private selectedData: String[];
	private displayConfirm: boolean = false;
	private paginateTable: boolean = true;
	private originMultipleOrg: String[];
	public categoryFilterTransaction: SelectItem[];
	public errorHandling: any = {};
	public dataUser;
	public urlDownload = this.mainService['hostOrder'] + '/order/additional-reservation/download-receipt/';

	private statusReservation = [
		{ value: 'BOSID-001', label: 'BREAKDOWN' },
		{ value: 'BOSID-002', label: 'CANCELLED' },
		{ value: 'BOSID-003', label: 'DELIVERY COMPLETED' },
		{ value: 'BOSID-004', label: 'DRAFT' },
		{ value: 'BOSID-005', label: 'ON JOURNEY' },
		{ value: 'BOSID-006', label: 'APPROVED' },
		{ value: 'BOSID-007', label: 'ORDER COMPLETED' },
		{ value: 'BOSID-009', label: 'READY TO BILL' },
		{ value: 'BOSID-010', label: 'WAITING FOR PAYMENT' },
		{ value: 'BOSID-011', label: 'WAITING FOR APPROVAL' },
		{ value: 'BOSID-012', label: 'REJECTED' }
	];

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	@ViewChild('filterSearch') filterSearch;
	@ViewChild('p') paginator: Paginator;

	constructor(
		private billingService: BillingService,
		private mainService: MainService,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.categoryFilterTransaction = [
			{ value: 0, label: 'Reservation ID' },
			{ value: 1, label: 'Booking Order ID' },
			{ value: 2, label: 'Customer Name' },
			{ value: 3, label: 'Passenger' }
		];
	}

	ngOnInit() {
		this.cols = [
			{
				field: 'header.ReservationId',
				header: 'Reservation Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: true
			},
			{
				field: 'header.StatusName',
				header: 'Status',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.BookingOrderId',
				header: 'Booking Order Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'header.InvoiceCode',
				header: 'No Invoice',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'header.CustomerName',
				header: 'Customer Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'listPassengers',
				header: 'Passengers',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'header.CustomerId',
				header: 'Customer Id',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'header.ServiceTypeName',
				header: 'Service Type Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'header.CostCenterName',
				header: 'Cost Center',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.StartDate',
				header: 'Start Date',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.EndDate',
				header: 'End Date',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.ActualEndDate',
				header: 'Actual End Date',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.Duration',
				header: 'Duration',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'sumAddDuration',
				header: 'Extend Duration',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'sumAddDurationPrice',
				header: 'Extend Duration Price',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'body.UnitTypeName',
				header: 'Vehicle Type',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.CityName',
				header: 'City Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.LicensePlate',
				header: 'License Plate',
				filter: false,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.CancellationFee',
				header: 'Cancelation Fee',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.CancellationTime',
				header: 'Cancelation Time',
				filter: false,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'body.PickupLocation',
				header: 'Pickup Location',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'mainPrice',
				header: 'Price',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: true
			},
			// {
			// 	field: 'mainCencelationPrice',
			// 	header: 'Cancelation Price',
			// 	filter: true,
			//   filterMatchMode: 'contains',
			// 	ref: this.filterSearch,
			// 	checked: true,
			// 	disableCol: true
			// },
			{
				field: 'header.TotalPrice',
				header: 'Total Price',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: true
			}
		];

		let filterChecked = [];
		_.map(this.cols, x => {
			if (x.checked) {
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		if (this.mainService['dataUser'] != null) {
			this.dataUser = JSON.parse(this.mainService['dataUser']);
			this.role = this.dataUser.RoleId;
			if (this.dataUser.RoleId == 'RL-009') {
				this.selectedCustomer = this.dataUser.UserProfileB2B[0].CustomerId;
				this.fetchCityCoverage(this.selectedCustomer);
				this.fetchCostCenter(this.selectedCustomer);
				this.selectedPIC = this.dataUser.Id;
			} else if (this.dataUser.RoleId == 'RL-007' || this.dataUser.RoleId == 'RL-008') {
				this.fetchPIC(this.dataUser.UserProfileB2B[0].CustomerId);
				this.fetchCustomer();
			} else {
				this.fetchCustomer();
			}
			//mapping isOrganizationMapping
			this.originMultipleOrg = [];
			if (this.dataUser.IsOrganizationMapping == '1') {
				_.map(this.dataUser.UserOrganizationMapping, x => {
					this.originMultipleOrg.push(x.OrganizationId);
				});
			}
		}

		this.creatUrl();
		this.fetchData();
	}
	// Toggle Checkbox Columns
	// =========================== //
	checkBox = e => {
		if (e.checked) {
			e.checked = false;
		} else {
			e.checked = true;
		}
	};

	// ============================================================================== //
	// Fetch Procust
	// ============================================================================== //
	fetchData() {
		let setCreateBy = '';
		let paramOrg = '';
		this.loading = true;
		if (this.mainService['dataUser'] != null) {
			let CostCenterId = this.mainService['CostCenterId'];
			if (this.dataUser.IsOrganizationMapping == '1') {
				paramOrg += '&OrganizationId=' + this.originMultipleOrg;
			}
			if (this.role == 'RL-008') {
				setCreateBy += '&CreatedBy=' + this.dataUser.Id + '&CostCenterId=' + CostCenterId;
			}
			this.billingService
				.getTransaction(this.setUrl + '&page=' + this.page + '&Limit=' + this.pageRows + setCreateBy + paramOrg)
				.subscribe(
					res => {
						this.loading = false;
						this.data = this.createObject(res, 'fetch');
						_.map(this.data, x => {
							let findSameIndex = _.filter(this.data, { index: x.index });
							x['isIndex'] = true;
							x.body.StartDate = this.convertDateTime(x.body.StartDate);
							x.body.EndDate = this.convertDateTime(x.body.EndDate);
							x.body.ActualEndDate = x.body.ActualEndDate != null ? this.convertDateTime(x.body.ActualEndDate) : null;
							x.CancellationTime =
								x.body.CancellationTime != null ? this.convertDateTime(x.body.CancellationTime) : null;

							if (findSameIndex.length > 1) {
								_.map(findSameIndex, (objFilter, indexObjFilter) => {
									if (indexObjFilter != 0) {
										objFilter['isIndex'] = false;
									}
								});
							}
							(x.body.PickupLocation = this.isEmpty(x.body.pickup_locations[0], 'Alamat')),
								_.map(x.body.extend_durations, extendItem => {
									extendItem.AddDuration = Number(extendItem.AddDuration);
									extendItem.AddDurationPrice = Number(extendItem.AddDurationPrice);
								});

							x.header.StatusName = _.find(this.statusReservation, { value: x.header.Status }).label;
							x.sumAddDuration = _.sumBy(x.body.extend_durations, extendItem => {
								return extendItem.AddDuration;
							});
							x.sumAddDurationPrice =
								'Rp ' +
								_.sumBy(x.body.extend_durations, extendItem => {
									return extendItem.AddDurationPrice;
								}).toLocaleString();

							x.listPassengers = [];
							_.map(x.body.passengers, itemPassengers => {
								x.listPassengers.push(itemPassengers.Name);
							});

							x.header.CostCenterName = 'Loading...';
							this.fetchCostCenterDetail(x.header);
						});
						this.totalRecords = res.Data.total;
						this.setRowspanGroup(this.data);
					},
					err => {
						this.loading = false;
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
	}
	createObject(res, status) {
		let arrData = [];
		let response;

		if (status == 'fetch') {
			response = res.Data.data;
		} else {
			response = res.Data;
		}

		_.map(response, (x, i) => {
			let arrPrice = [];
			let arrCancelationFee = [];

			_.map(x.details, y => {
				if (!isNaN(x.TotalPrice)) {
					x.TotalPrice = 'Rp ' + Number(x.TotalPrice).toLocaleString();
				}

				let obj = { body: y, header: x, index: i, detailQty: x.details.length };
				arrData.push(obj);
			});

			_.map(x.details, (y, indexOrder) => {
				arrPrice.push(Number(y.Price));
				arrCancelationFee.push(Number(y.CancellationFee));
			});

			if (arrData.length) {
				if (arrData[i] != undefined) {
					arrData[i].mainPrice = 'Rp ' + Math.round(_.sum(arrPrice)).toLocaleString();
					arrData[i].mainCencelationPrice = 'Rp ' + Math.round(_.sum(arrCancelationFee)).toLocaleString(); // modify date 21-10-19 by angger, the field uccalled
				}
			}
		});

		return arrData;
	}
	convertDateTime(str) {
		var date = moment(str.substring(0, 10)).format('DD MMM YYYY') + ' - ' + str.substring(11, 16);
		return (str = date);
	}

	// On Filter Table
	onFilterTable() {
		this.setRowspanGroup(this.data);
	}

	// =========================== //
	// Set Rowspan Group
	// =========================== //
	setRowspanGroup(data) {
		if (data.length) {
			setTimeout(() => {
				$('tr.ui-widget-content').each(function() {
					var index = $(this).index(),
						dataObj = data;

					if (dataObj[index].isIndex) {
						$(this)
							.find('td')
							.eq(0)
							.addClass('td-main');
						$(this)
							.find('td')
							.eq(19)
							.addClass('td-main');
						$(this)
							.find('td')
							.eq(18)
							.addClass('td-main');
						$(this)
							.find('td')
							.eq(17)
							.addClass('td-main');
						$(this)
							.find('td')
							.eq(16)
							.addClass('td-main');
					} else {
						$(this)
							.find('td')
							.eq(0)
							.addClass('td-sub');
						$(this)
							.find('td')
							.eq(19)
							.addClass('td-sub');
						$(this)
							.find('td')
							.eq(18)
							.addClass('td-sub');
						$(this)
							.find('td')
							.eq(17)
							.addClass('td-sub');
						$(this)
							.find('td')
							.eq(16)
							.addClass('td-sub');
						$(this)
							.find('td')
							.eq(15)
							.addClass('td-sub');
					}
				});
			}, 1000);
		}
	}

	// =========================== //
	// Fetch Customer
	// =========================== //
	public customers = [];
	public selectedCustomer = null;
	selectCustomer() {
		this.fetchCityCoverage(this.selectedCustomer);
		this.fetchCostCenter(this.selectedCustomer);
		this.fetchPIC(this.selectedCustomer);
	}
	fetchCustomer() {
		this.customers = [{ label: 'All Customer', value: null }];
		this.billingService.getCustomer().subscribe(
			res => {
				_.map(res.Data, x => {
					let obj = {
						value: x.CustomerId,
						label: x.CustomerName
					};
					this.customers.push(obj);
				});
				if (this.dataUser.RoleId == 'RL-007' || this.dataUser.RoleId == 'RL-008') {
					this.selectedCustomer = this.dataUser.UserProfileB2B[0].CustomerId;
				} else {
					this.selectedCustomer = this.customers[0].value;
				}
				this.fetchCityCoverage(this.selectedCustomer);
				this.fetchCostCenter(this.selectedCustomer);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCustomer();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchCustomer();
				}
			}
		);
	}

	// Cities
	// ========================= //
	public cities = [];
	public selectedCity = null;
	fetchCityCoverage(id) {
		this.cities = [{ label: 'All City', value: null }];
		this.billingService.getCityCoverage(id).subscribe(
			res => {
				if (res.Data.length) {
					_.map(res.Data, x => {
						let obj = {
							value: x.CityId,
							label: x.MsCityName
						};
						this.cities.push(obj);
					});
					this.selectedCity = this.cities[0].value;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCityCoverage(id);
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchCityCoverage(id);
				}
			}
		);
	}

	// =========================== //
	// Fetch Cost Center
	// =========================== //
	public arrCostCenter = [];
	public selectedCostCenter = null;
	fetchCostCenter(CustomerId) {
		this.arrCostCenter = [{ label: 'All Cost Center', value: null }];
		this.billingService.getCostCenter(CustomerId).subscribe(
			res => {
				if (res.Data.length) {
					_.map(res.Data, x => {
						let obj = {
							value: x.Id,
							label: x.CostCenterName
						};
						this.arrCostCenter.push(obj);
					});
					this.selectedCostCenter = this.arrCostCenter[0].value;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenter(CustomerId);
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchCostCenter(CustomerId);
				}
			}
		);
	}
	fetchCostCenterDetail(obj) {
		this.billingService.getDetailCostCenter(obj.CostCenterId).subscribe(
			res => {
				obj.CostCenterName = res.Data.CostCenterName;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenterDetail(obj);
					});
				}
				if (err.name == 'TimeoutError') {
					this.fetchCostCenterDetail(obj);
				}
			}
		);
	}

	// Create URL
	// ============================ //
	private setUrl;
	public role;
	public StartDate;
	public categoryFilter;
	public searchValue: String = '';
	creatUrl() {
		let catFil = '';
		if (this.categoryFilter != null) {
			if (this.categoryFilter == 0) {
				catFil = '&ReservationId=' + this.searchValue;
			} else if (this.categoryFilter == 1) {
				catFil = '&BookingOrderId=' + this.searchValue;
			} else if (this.categoryFilter == 2) {
				catFil = '&CustomerName=' + this.searchValue;
			} else {
				catFil = '&Passengers=' + this.searchValue;
			}
		}
		let selectCustomer;
		if (this.selectedCustomer == null) {
			selectCustomer = '';
		} else {
			selectCustomer = '&CustomerId=' + this.selectedCustomer;
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

		let selectedPIC;
		if (this.selectedPIC == null) {
			selectedPIC = '';
		} else {
			selectedPIC = '&PIC=' + this.selectedPIC;
		}

		let selectdCity;
		if (this.selectedCity == null) {
			selectdCity = '';
		} else {
			selectdCity = '&CityId=' + this.selectedCity;
		}

		let selectedCostCenter;
		if (this.selectedCostCenter == null) {
			selectedCostCenter = '';
		} else {
			selectedCostCenter = '&CostCenterId=' + this.selectedCostCenter;
		}

		let urlAuth;
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			if (
				dataUser.UserIndicator[0].RoleIndicatorId == 'MRI002' ||
				dataUser.UserIndicator[0].RoleIndicatorId == 'MRI001'
			) {
				urlAuth = '';
			} else {
				switch (dataUser.RoleId) {
					case 'RL-009':
						urlAuth = '&CreatedBy=' + dataUser.Id;
						break;
					case 'RL-008':
					case 'RL-007':
						urlAuth = '&CustomerId=' + dataUser.UserProfileB2B[0].CustomerId;
						break;
				}
			}
		}

		this.setUrl = selectCustomer + selectedCostCenter + selectdCity + selectedPIC + selectDate + catFil + urlAuth;
	}
	resetFilter(event) {
		this.page = 1;
		this.paginator.changePageToFirst(event);
		this.selectedPIC = null;
		this.selectedCity = null;
		this.selectedCostCenter = null;
		this.categoryFilter = null;
		this.searchValue = '';
		this.selectedCustomer = null;
		if (this.mainService['dataUser'] != null) {
			this.dataUser = JSON.parse(this.mainService['dataUser']);
			if (this.dataUser.RoleId == 'RL-009') {
				this.selectedCustomer = this.dataUser.UserProfileB2B[0].CustomerId;
				this.fetchCityCoverage(this.selectedCustomer);
				this.fetchCostCenter(this.selectedCustomer);
				this.selectedPIC = this.dataUser.Id;
			} else if (this.dataUser.RoleId == 'RL-007' || this.dataUser.RoleId == 'RL-008') {
				this.fetchPIC(this.dataUser.UserProfileB2B[0].CustomerId);
				this.fetchCustomer();
			} else {
				this.fetchCustomer();
			}
		}
		this.creatUrl();
		this.clearDate();
		setTimeout(() => {
			this.fetchData();
		}, 300);
		this.errorHandling = {};
	}

	// Select Range Date=============
	// modify date 18-10-19 by rizal, because of all filter data with once click
	// selectRangeDate = e => {
	//   if (this.selectedDate[1] != null) {
	//     const parsed = queryString.parse(this.setUrl);
	//     parsed.StartDate = moment(this.selectedDate[0]).format('YYYY-MM-DD');
	//     parsed.EndDate = moment(this.selectedDate[1]).format('YYYY-MM-DD');
	//     this.setUrl = queryString.stringify(parsed);
	//   }
	// }

	clearDate() {
		if (this.selectedDate) {
			const parsed = queryString.parse(this.setUrl);
			delete parsed['StartDate'];
			delete parsed['EndDate'];
			this.setUrl = queryString.stringify(parsed);
			this.selectedDate = null;
		}
	}

	// Fetch PIC
	// =================================== //
	public selectedPIC = null;
	public PICList = [];

	fetchPIC(id) {
		this.billingService.getPicByCustomer(id).subscribe(
			res => {
				let arrPIC = [{ label: 'All PIC', value: null }];
				_.map(res.Data, x => {
					let obj = { label: x.EmailCorp, value: x.Id };
					arrPIC.push(obj);
				});
				this.PICList = arrPIC;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPIC(id);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchPIC(id);
				}
			}
		);
	}

	// Filter Billing
	// ========================================== //
	public selectedDate: Date;

	// Pagination
	// =========================== //
	public page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e) {
		this.page = e.page + 1;
		this.fetchData();
	}

	// Export All Data
	// =========================== //
	downloadCSV() {
		let setCreateBy = '';
		let paramOrg = '';
		this.loading = true;
		this.creatUrl();
		if (this.mainService['dataUser'] != null) {
			let CostCenterId = this.mainService['CostCenterId'];
			if (this.selectedDate != undefined) {
				let checkRangeDate =
					moment(this.selectedDate[1] ? this.selectedDate[1] : this.selectedDate[0]).diff(
						this.selectedDate[0],
						'days'
					) < 31;
				if (this.dataUser.IsOrganizationMapping == '1') {
					paramOrg += '&OrganizationId=' + this.originMultipleOrg;
				}

				if (this.role == 'RL-008') {
					setCreateBy += '&CreatedBy=' + this.dataUser.Id + '&CostCenterId=' + CostCenterId;
				}
				this.billingService.getTransaction(this.setUrl + '&DownloadReport=1' + paramOrg + setCreateBy).subscribe(
					res => {
						if (this.selectedDate[0] != null) {
							if (checkRangeDate) {
								let arrData = [];
								_.map(this.createObject(res, 'download'), (x, i) => {
									_.map(x.body.extend_durations, extendItem => {
										extendItem.AddDuration = Number(extendItem.AddDuration);
										extendItem.AddDurationPrice = Number(extendItem.AddDurationPrice);
									});
									//console.log(this.isEmpty(x.body.pickup_locations[0], 'Alamat'));
									x.listPassengers = [];
									_.map(x.body.passengers, itemPassengers => {
										x.listPassengers.push(itemPassengers.Name);
									});

									let obj: any = {
										No: i + 1,
										'Reservation Id': x.body.ReservationId,
										'Booking Order Id': x.body.BookingOrderId,
										'No Invoice': x.header.InvoiceCode || '-',
										'Customer Id': x.header.CustomerId || '-',
										'Customer Name': x.header.CustomerName || '-',
										'Service Type Name': x.header.ServiceTypeName || '-',
										'Cost Center': x.header.CostCenterName != null ? x.header.CostCenterName : '-',
										'Pickup Location': this.isEmpty(x.body.pickup_locations[0], 'Alamat'),
										'Pickup Location Notes': this.isEmpty(x.body.pickup_locations[0], 'Notes'),
										'Destination Note': this.isEmpty(x.body.drop_locations[0], 'Notes'),
										'Start Date': x.body.StartDate != null ? this.convertDateTime(x.body.StartDate) : '-',
										'End Date': x.body.EndDate != null ? this.convertDateTime(x.body.EndDate) : '-',
										'Actual End Date': x.body.ActualEndDate != null ? this.convertDateTime(x.body.ActualEndDate) : '-',
										Duration: x.body.Duration != null ? x.body.Duration : '-',
										'Extend Duration': _.sumBy(x.body.extend_durations, extendItem => {
											return extendItem.AddDuration;
										}),
										'Extend Duration Price': _.sumBy(x.body.extend_durations, extendItem => {
											return extendItem.AddDurationPrice;
										}),
										'Driver Name': x.body.drivers.length ? x.body.drivers[0].DriverName : '-',
										Nopol: x.body.LicensePlate,
										'Vehicle Type': x.body.UnitTypeName != null ? x.body.UnitTypeName : '-',
										'City Name': x.header.CityName || '-',
										'Passenger Name': x.listPassengers.toString(),
										'Create Date': x.header.created_at != null ? this.convertDateTime(x.header.created_at) : '-',
										Status: _.find(this.statusReservation, { value: x.header.StatusHeader }).label,
										'Cancellation Reason': x.body.CancellationReason || '-',
										'Cancellation Fee':
											x.body.CancellationFee != null ? `Rp. ${Number(x.body.CancellationFee).toLocaleString()}` : '-',
										'Cancellation Time':
											x.body.CancellationTime != null ? this.convertDateTime(x.body.CancellationTime) : '-',
										Price: x.mainPrice,
										'Total Price': x.header.TotalPrice,
										'Document 1': x.header.PONumber,
										'Document 2': x.header.PONumber2,
										//PODate: x.header.PODate!=null ? this.convertDateTime(x.header.PODate) : '-',
										PIC: x.header.PIC
									};
									//console.log(obj);
									arrData.push(obj);
								});
								this.mainService.exportDataCsv(arrData, 'Data Transaction');
								this.loading = false;
								this.errorHandling = {};
							} else {
								this.loading = false;
								this.errorHandling = {
									errStatus: true,
									msg: 'Limited 31 days!'
								};
							}
						}
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
				this.loading = false;
				this.errorHandling = { errStatus: true, msg: 'Required' };
			}
		}
	}
	downloadXLS() {
		let setCreateBy = '';
		let paramOrg = '';
		this.loading = true;
		this.creatUrl();
		if (this.mainService['dataUser'] != null) {
			let CostCenterId = this.mainService['CostCenterId'];
			if (this.selectedDate != undefined) {
				let checkRangeDate =
					moment(this.selectedDate[1] ? this.selectedDate[1] : this.selectedDate[0]).diff(
						this.selectedDate[0],
						'days'
					) < 31;
				if (this.dataUser.IsOrganizationMapping == '1') {
					paramOrg += '&OrganizationId=' + this.originMultipleOrg;
				}
				if (this.role == 'RL-008') {
					setCreateBy += '&CreatedBy=' + this.dataUser.Id + '&CostCenterId=' + CostCenterId;
				}
				this.billingService.getTransaction(this.setUrl + '&DownloadReport=1' + paramOrg + setCreateBy).subscribe(
					res => {
						if (this.selectedDate[0] != null) {
							if (checkRangeDate) {
								let arrData = [];
								_.map(this.createObject(res, 'download'), (x, i) => {
									_.map(x.body.extend_durations, extendItem => {
										extendItem.AddDuration = Number(extendItem.AddDuration);
										extendItem.AddDurationPrice = Number(extendItem.AddDurationPrice);
									});

									x.listPassengers = [];
									_.map(x.body.passengers, itemPassengers => {
										x.listPassengers.push(itemPassengers.Name);
									});

									// x.header.CostCenterName='Loading...'; // default inisialisasi
									// this.fetchCostCenterDetail(x.header); // add arr object CostCenterName

									let obj = {
										No: i + 1,
										'Reservation Id': x.body.ReservationId,
										'Booking Order Id': x.body.BookingOrderId,
										'No Invoice': x.header.InvoiceCode || '-',
										'Customer Id': x.header.CustomerId || '-',
										'Customer Name': x.header.CustomerName || '-',
										'Service Type Name': x.header.ServiceTypeName || '-',
										'Cost Center': x.header.CostCenterName != null ? x.header.CostCenterName : '-',
										'Pickup Location': this.isEmpty(x.body.pickup_locations[0], 'Alamat'),
										'Pickup Location Notes': this.isEmpty(x.body.pickup_locations[0], 'Notes'),
										'Destination Note': this.isEmpty(x.body.drop_locations[0], 'Notes'),
										'Start Date': x.body.StartDate != null ? this.convertDateTime(x.body.StartDate) : '-',
										'End Date': x.body.EndDate != null ? this.convertDateTime(x.body.EndDate) : '-',
										'Actual End Date': x.body.ActualEndDate != null ? this.convertDateTime(x.body.ActualEndDate) : '-',
										Duration: x.body.Duration != null ? x.body.Duration : '-',
										'Extend Duration': _.sumBy(x.body.extend_durations, extendItem => {
											return extendItem.AddDuration;
										}),
										'Extend Duration Price': _.sumBy(x.body.extend_durations, extendItem => {
											return extendItem.AddDurationPrice;
										}),
										'Driver Name': x.body.drivers.length ? x.body.drivers[0].DriverName : '-',
										Nopol: x.body.LicensePlate,
										'Vehicle Type': x.body.UnitTypeName != null ? x.body.UnitTypeName : '-',
										'City Name': x.header.CityName || '-',
										'Passenger Name': x.listPassengers.toString(),
										'Create Date': x.header.created_at != null ? this.convertDateTime(x.header.created_at) : '-',
										Status: _.find(this.statusReservation, { value: x.header.StatusHeader }).label,
										'Cancellation Reason': x.body.CancellationReason || '-',
										'Cancellation Fee':
											x.body.CancellationFee != null ? `Rp. ${Number(x.body.CancellationFee).toLocaleString()}` : '-',
										'Cancellation Time':
											x.body.CancellationTime != null ? this.convertDateTime(x.body.CancellationTime) : '-',
										Price: x.mainPrice,
										'Total Price': x.header.TotalPrice,
										'Document 1': x.header.PONumber,
										'Document 2': x.header.PONumber2,
										// PODate: x.header.PODate!=null ? this.convertDateTime(x.header.PODate) : '-',
										PIC: x.header.PIC
									};
									arrData.push(obj);
								});
								//console.log(arrData);
								this.mainService.exportDataXls(arrData, 'Data Transaction');
								this.loading = false;
								this.errorHandling = {};
							} else {
								this.loading = false;
								this.errorHandling = {
									errStatus: true,
									msg: 'Limited 31 days!'
								};
							}
						}
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
				this.loading = false;
				this.errorHandling = { errStatus: true, msg: 'Required' };
			}
		}
	}

	// ===============================
	// Filter By City & Cost Center
	// ===============================
	public displayFilterCustomer: boolean = false;
	submitFilter(event) {
		this.errorHandling = {};
		this.page = 1;
		this.paginator.changePageToFirst(event);
		this.creatUrl();
		setTimeout(() => {
			this.fetchData();
		}, 300);
		this.hideFilterDialog();
	}
	showFilterDialog() {
		this.displayFilterCustomer = true;
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}
	hideFilterDialog() {
		this.displayFilterCustomer = false;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}

	// ===============================
	// View Transaction
	// ===============================
	public displayTransaction: boolean = false;
	public widthDetail: number = 500;
	public selectedItem = null;
	viewItem(e) {
		this.selectedItem = e;
		this.displayTransaction = true;
		var elem = document.getElementById('body').setAttribute('class', 'on');
	}
	closeDetailTransaction() {
		this.selectedItem = null;
		this.displayTransaction = false;
		setTimeout(() => {
			var elem = document.getElementById('body').classList.remove('on');
		}, 500);
	}

	// function isset object not null===============//
	isEmpty = (obj, key) => {
		return key.split('.').reduce((o, x) => {
			return typeof o == 'undefined' || o === null ? '' : o[x];
		}, obj);
	};
}
