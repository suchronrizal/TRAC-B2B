import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as queryString from 'query-string';
import { SelectItem, Paginator } from 'primeng/primeng';
import { Router } from '@angular/router';
import { MainService } from '../../lib/service/main.service';
import { OrderService } from '../order.service';

@Component({
	selector: 'app-order-history',
	templateUrl: './order-history.component.html',
	styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private displayConfirm: boolean = false;
	private paginateTable: boolean = true;
	public errorHandling: any = {};
	private originMultipleOrg: String[];
	public specificGlobalSearch: SelectItem[];
	public statusReservation = [
		{ value: null, label: 'All Status' },
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

	@ViewChild('filterSearch') filterSearch;
	@ViewChild('p') paginator: Paginator;

	constructor(private mainService: MainService, private router: Router, private orderService: OrderService) {
		this.specificGlobalSearch = [
			{ value: '0', label: 'Reservation ID' },
			{ value: '1', label: 'Booking Order ID' },
			{ value: '2', label: 'Passengers' }
		];
	}

	ngOnInit() {
		this.cols = [
			{
				field: 'ReservationId',
				header: 'Reservation ID',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: true
			},
			{
				field: 'BookingOrderId',
				header: 'Booking Order',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: false
			},
			{
				field: 'CustomerName',
				header: 'Customer Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: false
			},
			{
				field: 'StartDate',
				header: 'Start Date',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false
				//sortable: true
			},
			{
				field: 'passengers',
				header: 'Passengers',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false,
				sortable: true
			},
			{
				field: 'drivers',
				header: 'Drivers',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false,
				sortable: true
			},
			{
				field: 'LicensePlate',
				header: 'No Pol',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false,
				sortable: true
			},
			{
				field: 'CityName',
				header: 'City Name',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: false,
				disableCol: false,
				sortable: true
			},
			{
				field: 'SatatusName',
				header: 'Reservation Status',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: false
			},
			{
				field: 'TotalPrice',
				header: 'Total Price',
				filter: true,
				filterMatchMode: 'contains',
				ref: this.filterSearch,
				checked: true,
				disableCol: false,
				sortable: false
			}
		];

		let filterChecked = [];
		_.map(this.cols, x => {
			if (x.checked) {
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;
		this.readUser();
		this.fetchCustomer();
		if (!this.data.length) {
			this.fetchCustomer();
		}
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.originMultipleOrg = [];
		if (dataUser.IsOrganizationMapping == '1') {
			_.map(dataUser.UserOrganizationMapping, x => {
				this.originMultipleOrg.push(x.OrganizationId);
			});
		}
	}

	isRowSelected(rowData: any) {
		return rowData.Status == 'BOSID-002' || rowData.Status == 'BOSID-012' ? 'blocked' : null;
	}
	// Read User Access
	// ============================ //

	readUser() {
		let dataUser = JSON.parse(this.mainService['dataUser']);

		let selectCustomer;
		if (this.selectedCustomer == null) {
			selectCustomer = '';
		} else {
			selectCustomer = '&CustomerId=' + this.selectedCustomer;
		}
		if (dataUser != null) {
			this.role = dataUser.RoleId;
			switch (this.role) {
				case 'RL-001':
				case 'RL-002':
					this.setUrl = selectCustomer;
					break;
				case 'RL-003':
					if (dataUser.UserBranchInternal[0] != null) {
						this.setUrl = 'BranchId=' + dataUser.UserBranchInternal[0].BranchId;
					}
					break;
				case 'RL-004':
				case 'RL-005':
				case 'RL-006':
					if (dataUser.UserBranchInternal[0] != null) {
						this.setUrl = 'PIC=' + dataUser.Id + '&BranchId=' + dataUser.UserBranchInternal[0].BranchId;
					}
					break;
				case 'RL-007':
					if (dataUser.UserProfileB2B[0] != null) {
						this.setUrl = 'CustomerId=' + dataUser.UserProfileB2B[0].CustomerId;
					}
					break;
				case 'RL-008':
					if (dataUser.UserProfileB2B[0] != null) {
						this.setUrl = 'CustomerId=' + dataUser.UserProfileB2B[0].CustomerId;
					}
					break;
				case 'RL-009':
					this.setUrl = 'PIC=' + dataUser.Id;
					break;
			}
		}
	}

	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e) {
		if (e.checked) {
			e.checked = false;
		} else {
			e.checked = true;
		}
	}

	// ============================================================================== //
	// Fetch Order
	// ============================================================================== //
	fetchOrderList() {
		let setCreateBy = '';
		let paramOrg = '';
		this.loading = true;
		if (this.mainService['dataUser'] != null) {
			let dataUser = JSON.parse(this.mainService['dataUser']);
			let CostCenterId = this.mainService['CostCenterId'];
			if (this.role == 'RL-008') {
				// RL-008 is PIC
				setCreateBy += '&CreatedBy=' + dataUser.Id + '&CostCenterId=' + CostCenterId;
			}
			if (dataUser.IsOrganizationMapping == '1') {
				paramOrg += '&OrganizationId=' + this.originMultipleOrg;
			}
			this.orderService
				.getOrderHistory(
					'?' +
						this.setUrl +
						'&page=' +
						this.page +
						'&OrderBy=StartDate&Limit=' +
						this.pageRows +
						'&BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId +
						setCreateBy +
						paramOrg
				)
				.subscribe(
					res => {
						this.data = res.Data.data;
						this.totalRecords = res.Data.total;

						_.map(this.data, x => {
							x.SatatusName = _.find(this.statusReservation, {
								value: x.Status
							}).label;
							//x.created_at = moment(x.created_at).format('DD MMM YYYY');
							x.StartDate = moment(x.StartDate).format('DD MMM YYYY');
							x.TotalPrice = 'Rp ' + Number(x.TotalPrice).toLocaleString();

							//maping passengers
							if (_.isArray(x.passengers)) {
								if (x.passengers.length > 0) {
									// check if the pic and passengers are one
									let arr = [];
									_.map(x.passengers, itemPassenger => {
										if (itemPassenger.IsPIC != 1) {
											// filtering non pic
											arr.push(itemPassenger.Name);
											x.passengers = arr; // passengers only
										} else {
											_.map(x.passengers, item => {
												x.passengers = item.Name; // isPIC
											});
										}
									});
								}
							}

							// maping drivers
							if (_.isArray(x.drivers)) {
								if (x.drivers.length > 0) {
									let tmpData = [];
									_.map(x.drivers, itemVal => {
										tmpData.push(itemVal.DriverName);
										x.drivers = tmpData;
									});
								} else {
									x.drivers = '-';
								}
							}
							x.LicensePlate = x.LicensePlate ? x.LicensePlate : '-';
						});
						this.loading = false;
					},
					err => {
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.fetchOrderList();
							});
						}

						if (err.name == 'TimeoutError') {
							this.fetchOrderList();
						}
					}
				);
		}
	}

	// Pagination
	// =========================== //
	private page = 1;
	public pageRows = 20;
	public totalRecords = 0;
	paginate(e) {
		this.page = e.page + 1;
		this.fetchOrderList();
	}

	private setUrl;
	public role;
	public categorySearch;
	public searchValue: String = null;
	creatUrl = () => {
		this.readUser();
		let catFil = '';
		if (this.categorySearch != null) {
			if (this.categorySearch == 0) {
				catFil = '&ReservationId=' + this.searchValue;
			} else if (this.categorySearch == 1) {
				catFil = '&BookingOrderId=' + this.searchValue;
			} else {
				catFil = '&Passengers=' + this.searchValue;
			}
		}
		let selectDate = '';
		if (this.rangeDate == undefined) {
			selectDate = '';
		} else {
			selectDate =
				'&StartDate=' +
				moment(this.rangeDate[0]).format('YYYY-MM-DD') +
				'&EndDate=' +
				moment(this.rangeDate[1]).format('YYYY-MM-DD');
		}

		let statusRev = '';
		if (this.selectedStatus != null) {
			statusRev = '&StatusRev=' + this.selectedStatus;
		}
		this.setUrl += catFil + statusRev + selectDate;
	};
	// Search All
	//============================== //
	//public selectedCustomer = null;
	private isSearch = false;
	searchAll(event) {
		this.isSearch = true;
		this.page = 1;
		this.paginator.changePageToFirst(event);
		this.creatUrl();
		this.errorHandling = {};
		setTimeout(() => {
			this.fetchOrderList();
		}, 300);
	}

	resetAll(event) {
		this.isSearch = false;
		this.paginator.changePageToFirst(event);
		this.page = 1;
		const parsed = queryString.parse(this.setUrl);
		delete parsed['CustomerId'];
		delete parsed['StatusRev'];
		delete parsed['ReservationId'];
		delete parsed['BookingOrderId'];
		delete parsed['Passengers'];
		this.setUrl = queryString.stringify(parsed);
		this.selectedCustomer = null;
		this.selectedStatus = null;
		this.categorySearch = null;
		this.searchValue = '';
		this.readUser();
		this.clearDate();
		setTimeout(() => {
			this.fetchOrderList();
		}, 300);

		this.errorHandling = {};
	}

	// Status
	// ============================= //
	public selectedStatus: null;

	// Calendar
	// ============================= //
	public rangeDate: Date;
	selectRangeDate(e) {
		if (this.rangeDate[1] != null) {
			const parsed = queryString.parse(this.setUrl);
			parsed.StartDate = moment(this.rangeDate[0]).format('YYYY-MM-DD');
			parsed.EndDate = moment(this.rangeDate[1]).format('YYYY-MM-DD');
			this.setUrl = queryString.stringify(parsed);
			//this.fetchOrderList();
		}
	}

	clearDate() {
		if (this.rangeDate) {
			const parsed = queryString.parse(this.setUrl);
			delete parsed['StartDate'];
			delete parsed['EndDate'];
			this.setUrl = queryString.stringify(parsed);
			this.rangeDate = null;
			this.fetchOrderList();
		}
	}

	// ============================================================================== //
	// Fetch Customer
	// ============================================================================== //
	private customers = [];
	private selectedCustomer;
	fetchCustomer() {
		this.loading = true;
		this.orderService.getCustomer().subscribe(
			res => {
				this.customers = [{ label: 'All Customer', value: null }];
				if (res.Data != '') {
					_.map(res.Data, x => {
						let obj = {
							value: x.CustomerId,
							label: x.CustomerName
						};
						this.customers.push(obj);
					});
					this.selectedCustomer = this.customers[0].value;
				}
				this.readUser();
				this.fetchOrderList();
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

	// Export All Data
	// =========================== //
	downloadCSV() {
		let setCreateBy = '';
		let paramOrg = '';
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let CostCenterId = this.mainService['CostCenterId'];
		this.loading = true;
		this.creatUrl();
		if (this.rangeDate != undefined) {
			let checkRangeDate =
				moment(this.rangeDate[1] ? this.rangeDate[1] : this.rangeDate[0]).diff(this.rangeDate[0], 'days') < 31;

			if (dataUser.IsOrganizationMapping == '1') {
				paramOrg += '&OrganizationId=' + this.originMultipleOrg;
			}
			if (this.role == 'RL-008') {
				setCreateBy += '&CreatedBy=' + dataUser.Id + '&CostCenterId=' + CostCenterId;
			}
			this.orderService
				.getOrderHistory(
					'?' +
						this.setUrl +
						'&BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId +
						'&DownloadReport=1' +
						paramOrg +
						setCreateBy
				)
				.subscribe(res => {
					if (this.rangeDate[0] != null) {
						if (checkRangeDate) {
							let arrData = [];
							_.map(res.Data, (val, index) => {
								let tmpPassengers = [];
								let tmpDriver = [];
								//maping passengers
								if (_.isArray(val.passengers) && val.passengers.length > 0) {
									// check if the pic and passengers are one
									let arr = [];
									_.map(val.passengers, itemPassenger => {
										if (itemPassenger.IsPIC != 1) {
											// filtering non pic
											arr.push(itemPassenger.Name); // passengers only
											tmpPassengers = arr;
										} else {
											_.map(val.passengers, item => {
												tmpPassengers = item.Name; // isPIC
											});
										}
									});
								}
								// maping data drivers
								if (_.isArray(val.drivers)) {
									if (val.drivers.length > 0) {
										let tmpData = [];
										_.map(val.drivers, itemVal => {
											tmpData.push(itemVal.DriverName);
											tmpDriver = tmpData;
										});
									}
								}
								let obj: any = {
									No: index + 1,
									'Reservation Id': val.ReservationId,
									'Customer Name': val.CustomerName,
									'Booking Order Id': val.BookingOrderId,
									'Date Created': this.convertDateTime(val.created_at),
									'Total Price': val.TotalPrice,
									'Start Date': this.convertDateTime(val.StartDate),
									'End Date': this.convertDateTime(val.EndDate),
									Alamat: val.Alamat,
									'City Name': val.CityName,
									'No Pol': val.LicensePlate,
									'Unit Type Name': val.UnitTypeName,
									Passengers: tmpPassengers.toString(),
									'Driver Name': tmpDriver.toString(),
									'Status Reservation': _.find(this.statusReservation, {
										value: val.Status
									}).label
								};
								arrData.push(obj);
							});
							this.mainService.exportDataCsv(arrData, 'Report Order History');
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
				});
		} else {
			this.loading = false;
			this.errorHandling = { errStatus: true, msg: 'Required' };
		}
	}

	downloadXLS() {
		let setCreateBy = '';
		let paramOrg = '';
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let CostCenterId = this.mainService['CostCenterId'];
		this.loading = true;
		this.creatUrl();
		if (this.rangeDate != undefined) {
			let checkRangeDate =
				moment(this.rangeDate[1] ? this.rangeDate[1] : this.rangeDate[0]).diff(this.rangeDate[0], 'days') < 31;
			if (dataUser.IsOrganizationMapping == '1') {
				paramOrg += '&OrganizationId=' + this.originMultipleOrg;
			}
			if (this.role == 'RL-008') {
				setCreateBy += '&CreatedBy=' + dataUser.Id + '&CostCenterId=' + CostCenterId;
			}
			this.orderService
				.getOrderHistory(
					'?' +
						this.setUrl +
						'&BusinessUnitId=' +
						dataUser.UserCompanyMapping[0].BusinessUnitId +
						'&DownloadReport=1' +
						paramOrg +
						setCreateBy
				)
				.subscribe(res => {
					if (this.rangeDate[0] != null) {
						if (checkRangeDate) {
							let arrData = [];
							_.map(res.Data, (val, index) => {
								let tmpPassengers = [];
								let tmpDriver = [];
								// maping data passenger
								if (_.isArray(val.passengers) && val.passengers.length > 0) {
									// check if the pic and passengers are one
									let arr = [];
									_.map(val.passengers, itemPassenger => {
										if (itemPassenger.IsPIC != 1) {
											// filtering non pic
											arr.push(itemPassenger.Name); // passengers only
											tmpPassengers = arr;
										} else {
											_.map(val.passengers, item => {
												tmpPassengers = item.Name; // isPIC
											});
										}
									});
								}
								// maping data drivers
								if (_.isArray(val.drivers)) {
									if (val.drivers.length > 0) {
										let tmpData = [];
										_.map(val.drivers, itemVal => {
											tmpData.push(itemVal.DriverName);
											tmpDriver = tmpData;
										});
									}
								}
								let obj: any = {
									No: index + 1,
									'Reservation Id': val.ReservationId,
									'Customer Name': val.CustomerName,
									'Booking Order Id': val.BookingOrderId,
									'Date Created': this.convertDateTime(val.created_at),
									'Total Price': val.TotalPrice,
									'Start Date': this.convertDateTime(val.StartDate),
									'End Date': this.convertDateTime(val.EndDate),
									Alamat: val.Alamat,
									'City Name': val.CityName,
									'No Pol': val.LicensePlate,
									'Unit Type Name': val.UnitTypeName,
									Passengers: tmpPassengers.toString(),
									'Driver Name': tmpDriver.toString(),
									'Status Reservation': _.find(this.statusReservation, {
										value: val.Status
									}).label
								};
								arrData.push(obj);
							});
							this.mainService.exportDataXls(arrData, 'Report Order History');
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
				});
		} else {
			this.loading = false;
			this.errorHandling = {
				errStatus: true,
				msg: 'Required!'
			};
		}
	}
	convertDateTime(str) {
		var date = moment(str.substring(0, 10)).format('DD MMM YYYY') + ' - ' + str.substring(11, 16);
		return (str = date ? date : '-');
	}
}
