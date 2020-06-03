import { Component, OnInit, Compiler } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MainService } from '../../lib/service/main.service';
import { SelectItem } from 'primeng/primeng';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';
import { OrderService } from '../order.service';
import { UserManagemenetService } from '../../user-management/user-managemenet.service';
import { LayoutService } from '../../layout/layout.service';

@Component({
	selector: 'app-hourly',
	templateUrl: './hourly.component.html',
	styleUrls: ['./hourly.component.scss']
})
export class HourlyComponent implements OnInit {
	public blockSpace: RegExp = /[^\s]/;
	private productId = 'STID-007';
	public productName = 'TMS Hourly';
	public disableAddPassengger: boolean = false;
	private Id = null;
	public isUpdate: boolean = false;
	private dataUser;
	private selectedPickup;
	private selectedDestination;
	public IsInternal: boolean = false;
	public priceTotal: Number = 0;
	private arrAdditional: string[] = [];
	private PICName = null;
	public userIndicator = null;
	public PODate: Date = moment()['_d'];
	public PONumber = '';
	public PONumber2 = '';
	public RoleId = null;

	// Tab Index
	// ======================== //
	public tabIndex: Number = 0;

	handleChange(e) {
		this.tabIndex = e.index;
	}

	prevForm() {
		this.tabIndex = Number(this.tabIndex) - 1;
	}

	constructor(
		private orderService: OrderService,
		private userManagemenetService: UserManagemenetService,
		private mainService: MainService,
		private layoutService: LayoutService,
		private activatedRoute: ActivatedRoute,
		private _compiler: Compiler
	) {
		this.activatedRoute.queryParams.subscribe(params => {
			this.productName = params['productName'];
		});
	}

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	ngOnInit() {
		this.fetchCustomer();
		this.fetchDriverSpesification();
		this.initObjSchemeOrder();
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.IsInternal = dataUser['IsInternal'] == 1 ? true : false;
		this.checkRole();
		this._compiler.clearCache();
	}

	private withDriver = [];
	changeSelfDrive(e) {
		let getBranchId = _.find(this.originCities, { CityId: this.selectedCity });
		if (getBranchId != undefined) {
			if (this.selectedDuration != null) {
				this.fetchPeckage(this.selectedCustomer, this.selectedCar, this.selectedDuration, getBranchId.BranchId);
			}

			if (this.selectedPackegeContract != null) {
				let getBranchId = _.find(this.originCities, {
					CityId: this.selectedCity
				});
				if (getBranchId != undefined && this.packages.length) {
					this.fetchContract(
						this.selectedCustomer,
						this.selectedCar,
						this.selectedDuration,
						getBranchId.BranchId,
						this.selectedPackegeContract.FuelId,
						this.selectedPackegeContract.TollandParkingId,
						this.selectedPackegeContract.DriverorRiderId,
						this.selectedPackegeContract.ChannelTypeId,
						this.selectedPackegeContract.CrewId,
						this.selectedPackegeContract.CoverageAreaId,
						this.productId,
						this.selectedCity
					);
				}
			}
		}
	}

	private priority = [];
	private joinOrder = [];
	// State Order
	// ============================ //
	private stateOrder = [
		{ label: 'Your Self', value: '01' },
		{ label: 'Guest', value: '02' },
		{ label: 'Other Employee', value: '03' }
	];
	public selectedstateOrder = '01';

	checkRole() {
		const dataUser = JSON.parse(this.mainService['dataUser']);
		this.RoleId = dataUser.RoleId;
		if (dataUser.RoleId == 'RL-009') {
			let dataCreateFor = _.filter(this.stateOrder, x => {
				return x.value == '01';
			});
			this.stateOrder = dataCreateFor;
		}
	}

	selectstateOrder(e) {
		this.validTextEmail = false;
		this.validPhoneNumber = false;
		this.users = [];
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let obj;

		if (this.selectedstateOrder == '03') {
			obj = {
				id: _.uniqueId('passenger_'),
				UserId: null,
				isPIC: null,
				PICName: null,
				phone: null,
				email: null,
				isDisable: false
			};
			this.users.push(obj);
			this.selectedPicVehicleType = null;
		} else {
			obj = {
				id: _.uniqueId('passenger_'),
				UserId: dataUser.Id,
				isPIC: dataUser.Id,
				PICName: dataUser.FirstName + ' ' + dataUser.LastName,
				phone: dataUser.NoHandphone,
				email: dataUser.EmailCorp,
				isDisable: true
			};
			this.users.push(obj);
			this.selectedPicVehicleType = this.users[0].id;
			if (this.selectedstateOrder == '02') {
				this.addUser();
			}
		}
		// start check unnormally test
		// check keitka case pertama pilih other employee, selesai tahap ngisi package & price ternyata diganti your self,
		// maka untuk menjalankan fungsi elibigiliti-nya dengan code dibawah ini
		const UserId = this.users;
		this.users.length == 1 && this.changePIC(UserId);
		// end unnormally test

		this.checkValidGuest();
	}

	// Check Valid Pasengger
	// =========================== //
	public validGuest: boolean = true;
	public validPhoneNumber: Boolean = false;
	public validTextEmail: Boolean = false;
	checkValidGuest() {
		let findPICName = _.find(this.users, x => {
			return x.PICName == null || x.PICName == '';
		});
		let findemail = _.find(this.users, x => {
			return x.email == null || x.email == '';
		});
		let findphone = _.find(this.users, x => {
			return x.phone == null || x.phone == '';
		});

		if (findPICName == undefined && findemail == undefined && findphone == undefined) {
			this.validPhoneNumber = false;
			this.validTextEmail = false;
			this.validGuest = true;
			_.map(this.users, x => {
				x['validPhone'] = 'none';
				x['validEmail'] = 'none';
				if (!this.validateEmail(x.email)) {
					this.validGuest = false;
					this.validTextEmail = true;
					x['validEmail'] = 'error';
				}
				if (!this.checkaValidNumberPhone(x.phone)) {
					this.validGuest = false;
					this.validPhoneNumber = true;
					x['validPhone'] = 'error';
				} else {
					if (x['validEmail'] == 'none' && x['validEmail'] == 'none') {
						this.validGuest = true;
					}
					this.validPhoneNumber = false;
				}
			});
		} else {
			this.validGuest = false;
		}

		if (this.selectedstateOrder == '01' || this.selectedstateOrder == '03') {
			if (this.users.length == 0) {
				this.validGuest = false;
			}
		} else if (this.selectedstateOrder == '02') {
			if (this.users.length == 1) {
				this.validGuest = false;
			}
		} else {
			this.validGuest = true;
		}
	}

	validateEmail(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	// Notification
	// =========================== //
	public obJschemeOrder;
	initObjSchemeOrder() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let jsonOrder = JSON.parse(this.mainService['order']);

		if (dataUser != null) {
			let objOrder = {
				CompanyId: null,
				CustomerName: null,
				CustomerId: null,
				BusinessUnitId: null,
				ChannelId: null,
				ServiceType: null,
				ServiceTypeName: null,
				CreatedBy: dataUser.FirstName + '  ' + dataUser.LastName,
				TotalPrice: 0,
				CostCenterId: null,
				CostCenterName: null,
				PIC: dataUser.Id,
				OrganizationId: null,
				ReservationDetail: []
			};

			if (jsonOrder == null || jsonOrder.timeBased == undefined) {
				this.obJschemeOrder = objOrder;
			} else {
				if (dataUser.Id != jsonOrder.timeBased.PIC) {
					localStorage.removeItem('order');
					this.mainService.updateLocalStorage();
					this.initObjSchemeOrder();
				} else {
					if (jsonOrder.timeBased != undefined) {
						let order = jsonOrder.timeBased;
						this.obJschemeOrder = order;
						let arrPrice = [];
						let getPrice = _.map(this.obJschemeOrder.ReservationDetail, x => {
							arrPrice.push(Number(x.PriceCalc));
						});
						this.priceTotal = _.reduce(arrPrice, (sum, n) => {
							return sum + n;
						});
					} else {
						this.obJschemeOrder = objOrder;
					}
				}
			}

			if (this.priceTotal == undefined) {
				this.priceTotal = 0;
			}

			this.readOrder();
		}
	}
	// Read Order
	// Set data listed sebelumnya
	// =========================== //
	readOrder() {
		let jsonOrder = JSON.parse(this.mainService['order']);
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if (jsonOrder != null) {
			if (jsonOrder.timeBased != undefined) {
				let order = jsonOrder.timeBased;
				setTimeout(() => {
					if (order.ReservationDetail.length) {
						this.selectedCustomer = order.ReservationDetail[0].CustomerId;
						this.disableCustomer = true;
						// if (dataUser.RoleId != 'RL-001') {
						if (!_.includes(['RL-001', 'RL-002'], dataUser.RoleId)) {
							this.selectedPic = dataUser.EmailCorp;
							this.selectedPICAutoComplete = order.ReservationDetail[0].UserId;
							this.disablePic = true;
						}

						let findPIC = _.find(this.userAccount, {
							value: order.ReservationDetail[0].UserId
						});
						if (findPIC != undefined) {
							this.PICName = findPIC.label;
						}

						if (this.dataOrderTemporaryEdit == null) {
							this.users = [];
							this.selectedPICAutoComplete = order.ReservationDetail[0].UserId;
							let find = _.find(order.ReservationDetail[0].users, { UserId: this.selectedPICAutoComplete });
							if (find != undefined) {
								let obj = {
									id: _.uniqueId('passenger_'),
									UserId: find.UserId,
									isPIC: find.UserId,
									PICName: find.PICName,
									phone: find.phone,
									email: find.email,
									isDisable: true,
									validPhone: 'none',
									validEmail: 'none'
								};
								this.users.push(obj);
								setTimeout(() => {
									this.selectedPicVehicleType = this.users[0].id;
								}, 500);
							}
						}
					} else {
						if (dataUser.UserIndicator[0].RoleIndicatorId == 'MRI003') {
							this.users = [];
							let obj = {
								id: _.uniqueId('passenger_'),
								UserId: dataUser.Id,
								isPIC: dataUser.Id,
								PICName: dataUser.FirstName + ' ' + dataUser.LastName,
								phone: dataUser.NoHandphone,
								email: dataUser.EmailCorp,
								isDisable: true,
								validPhone: 'none',
								validEmail: 'none'
							};
							this.users.push(obj);
							this.selectedPicVehicleType = this.users[0].id;
							if (this.selectedstateOrder == '02') {
								setTimeout(() => {
									this.selectstateOrder('02');
								}, 500);
							}
						} else {
							this.disableCustomer = false;
							this.disablePic = false;
							this.PICName = 'No Requestor';
						}
					}
				}, 100);
			}
		}
	}

	// Clear Order Cart
	// =========================== //
	clearOrder() {
		localStorage.removeItem('order');
		this.mainService.updateLocalStorage();
		this.initObjSchemeOrder();
		this.priceTotal = 0;
	}

	// Generete Object Scheme
	// ============================= //
	generateObjectScheme() {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let getBranchId = _.find(this.originCities, { CityId: this.selectedCity }).BranchId;
		let PriceCalc = this.totalPriceOrder * this.valHourly + this.totalPriceOrder * this.valHourly * 0.1;

		this.obJschemeOrder.CustomerId = this.selectedCustomer;
		this.obJschemeOrder.CustomerName = _.find(this.customers, {
			value: this.selectedCustomer
		}).label;
		this.obJschemeOrder.CompanyId = dataUser.UserCompanyMapping[0].CompanyId;
		this.obJschemeOrder.BusinessUnitId = dataUser.UserCompanyMapping[0].BusinessUnitId;
		this.obJschemeOrder.ServiceType = this.productId;
		this.obJschemeOrder.ServiceTypeName = this.productName;
		this.obJschemeOrder.CostCenterId = this.selectedCostCenter;
		this.obJschemeOrder.CostCenterName = this.selectedCostCenterName;
		this.obJschemeOrder.OrganizationId = this.organizationId
			? this.organizationId
			: dataUser.UserProfileB2B[0].OrganizationId;

		if (this.isUpdate) {
			let find = _.find(this.obJschemeOrder.ReservationDetail, { Id: this.Id });
			find.statusProcess = 'none';
			find.EmailCorp = this.selectedPic;
			find.UserId = this.selectedPICAutoComplete;
			find.UnitTypeId = this.selectedCar;
			find.UnitTypeName = _.find(this.cars, { value: this.selectedCar }).label;
			find.VehicleCapacity = _.find(this.cars, { value: this.selectedCar }).VehicleCapacity;
			find.CityId = this.selectedCity;
			find.CityName = _.find(this.cities, { value: this.selectedCity }).label;
			find.BranchId = getBranchId;
			find.StartDate = this.arrTimeValue;
			find.Duration = this.valHourly;
			find.DurationName = _.find(this.durations, {
				value: this.selectedDuration
			}).label;
			find.QtyUnit = this.sumQtyCarsPickup;
			find.QtyPassenger = this.users.length;
			find.IsPlanned = false;
			find.IsExpedition = false;
			find.IsPlanned = false;
			find.IsWithDriver = this.withDriver.length ? false : true;
			//find.IsPriority = this.priority.length ? false : true;
			find.PoolId = this.PoolId;
			find.IsJoinOrderAllowed = this.joinOrder.length ? true : false;
			find.Fuel = this.selectedFuel;
			find.TollAndParking = this.selectedParking;
			find.DriverOrRider = this.selectedDriver;
			find.CostCenterId = this.selectedCostCenter;
			find.CostCenterName = this.selectedCostCenterName;
			find.IsPaymentUpfront = false;
			find.ContractId = this.selectedContrat.ContractId;
			find.ContractItemId = this.selectedContrat.ContractItemId;
			find.MaterialId = this.selectedDuration;
			find.Price = this.BasicPrice;
			find.PriceCalc = PriceCalc;
			find.PickupLocation = this.PickupLocation;
			find.Passengers = this.Passengers;
			find.MaterialSAPCode = _.find(this.originDurations, {
				MaterialId: this.selectedDuration
			}).MaterialSAPCode;
			find.ContractSAPCode = this.selectedContrat.ContractSAPCode;
			find.ContractLineItemSAP = this.selectedContrat.ContractLineItemNumber;
			find.packageSelected = this.selectedPackege;
			find.packages = this.packages;
			find.arrTime = this.arrTime;
			find.arrAdditional = this.arrAdditional;
			find.reArrAdditional = [];
			find.users = this.users;
			find.carsPickup = this.carsPickup;
			find.CustomerId = this.selectedCustomer;
			find.DriverSpesification = this.selectedDriverSpesification;
			find.durationType = this.durationType;
			find.selectedstateOrder = this.selectedstateOrder;
			find.arrContract = this.arrContract;

			let IsStay = _.includes(this.arrAdditional, 'IsStay');
			if (IsStay) {
				find.IsStay = true;
				find.reArrAdditional.push(' Overnight Stay');
			}
			let OutTown = _.includes(this.arrAdditional, 'OutTown');
			if (OutTown) {
				find.OutTown = true;
				find.reArrAdditional.push(' Out Of Town');
			}

			if (!find.IsWithDriver) {
				find.reArrAdditional.push(' Self Driver');
			}
			// if (!find.IsPriority) {
			// 	find.reArrAdditional.push(' Priority');
			// }
			if (find.IsJoinOrderAllowed) {
				find.reArrAdditional.push(' Join Order');
			}
			this.isUpdate = false;
		} else {
			var itemReservationDetail = {
				statusProcess: 'none',
				EmailCorp: this.selectedPic,
				UserId: this.selectedPICAutoComplete,
				UnitTypeId: this.selectedCar,
				UnitTypeName: _.find(this.cars, { value: this.selectedCar }).label,
				VehicleCapacity: _.find(this.cars, { value: this.selectedCar }).VehicleCapacity,
				CityId: this.selectedCity,
				CityName: _.find(this.cities, { value: this.selectedCity }).label,
				BranchId: getBranchId,
				StartDate: this.arrTimeValue,
				Duration: this.valHourly,
				QtyUnit: this.sumQtyCarsPickup,
				QtyPassenger: this.users.length,
				IsStay: false,
				OutTown: false,
				IsPlanned: true,
				IsExpedition: false,
				IsWithDriver: this.withDriver.length ? false : true,
				//IsPriority: this.priority.length ? false : true,
				PoolId: this.PoolId,
				IsJoinOrderAllowed: this.joinOrder.length ? true : false,
				Fuel: this.selectedFuel,
				TollAndParking: this.selectedParking,
				DriverOrRider: this.selectedDriver,
				CostCenterId: this.selectedCostCenter,
				CostCenterName: this.selectedCostCenterName,
				IsPaymentUpfront: false,
				ContractId: this.selectedContrat.ContractId,
				ContractItemId: this.selectedContrat.ContractItemId,
				ProductId: this.productId,
				MaterialId: this.selectedDuration,
				ExternalOrderReferenceNumber: 'T001', // Tetep
				LicensePlate: 'RI 1 AJA',
				Price: this.BasicPrice,
				PickupLocation: this.PickupLocation,
				DropLocation: this.DropLocation,
				Passengers: this.Passengers,
				MaterialSAPCode: _.find(this.originDurations, {
					MaterialId: this.selectedDuration
				}).MaterialSAPCode,
				ContractSAPCode: this.selectedContrat.ContractSAPCode,
				ContractLineItemSAP: this.selectedContrat.ContractLineItemNumber,

				DriverSpesification: this.selectedDriverSpesification,
				DurationName: _.find(this.durations, { value: this.selectedDuration }).label,
				packageSelected: this.selectedPackege, // Takeout
				packages: this.packages, // Takeout
				PriceCalc: PriceCalc, // Takeout
				arrTime: this.arrTime, // Takeout
				arrAdditional: this.arrAdditional, // Takeout
				reArrAdditional: [], // Takeout
				users: this.users, // Takeout
				carsPickup: this.carsPickup, // Takeout
				CustomerId: this.selectedCustomer, // Takeout
				arrContract: this.arrContract,
				durationType: this.durationType,
				selectedstateOrder: this.selectedstateOrder,
				disableEdit: false,
				disableDelete: false
			};

			let IsStay = _.includes(this.arrAdditional, 'IsStay');
			if (IsStay) {
				itemReservationDetail.IsStay = true;
				itemReservationDetail.reArrAdditional.push(' Overnight Stay');
			}

			let OutTown = _.includes(this.arrAdditional, 'OutTown');
			if (OutTown) {
				itemReservationDetail.OutTown = true;
				itemReservationDetail.reArrAdditional.push(' Out Of Town');
			}

			if (!this.withDriver.length ? false : true) {
				itemReservationDetail.reArrAdditional.push(' Self Driver');
			}

			// if (!this.priority.length ? false : true) {
			// 	itemReservationDetail.reArrAdditional.push(' Priority');
			// }

			if (!this.joinOrder.length ? false : true) {
				itemReservationDetail.reArrAdditional.push(' Join Order');
			}

			itemReservationDetail['Id'] = _.uniqueId('Order_'); // Takeout
			this.obJschemeOrder.ReservationDetail.push(itemReservationDetail);
		}

		let arrPrice = [];
		let getPrice = _.map(this.obJschemeOrder.ReservationDetail, x => {
			arrPrice.push(Number(x.PriceCalc));
		});
		this.priceTotal = _.reduce(arrPrice, (sum, n) => {
			return sum + n;
		});
		this.obJschemeOrder.TotalPrice = this.priceTotal;

		this.clearFormOrder();
		this.readOrder();
		localStorage.setItem('order', JSON.stringify({ timeBased: this.obJschemeOrder }));
		this.mainService.updateLocalStorage();
	}

	// Clear Form Order
	// =========================== //
	clearFormOrder() {
		this.selectedstateOrder = '01';
		this.olc = 0;
		this.outOfTown = 0;
		this.selectedCity = null;
		this.arrTime = [];
		this.users = [];
		this.cars = [];
		this.durations = [];
		this.selectedPic = null;
		this.addUser();
		this.arrContract = [];
		this.destinationPickup = null;
		this.notePickup = null;
		this.BasicPrice = 0;
		this.selectedCostCenter = null;
		this.selectedCostCenterName = null;
		this.selectedContrat = null;
		this.selectedPicVehicleType = null;
		this.invalidLocation = true;
		this.minDateItemTime = null;
		this.maxDateItemTime = null;

		if (this.cars.length) {
			this.addUnitCar();
		}

		setTimeout(() => {
			this.carsPickup = [];
			this.sumQtyCarsPickup = 0;
			this.dataOrderTemporaryEdit = null;
			this.arrAdditional = [];
			this.arrContract = [];
			this.selectedContrat = null;
			this.withDriver = [];
			this.priority = [];
			this.joinOrder = [];
			this.dateTime = new Date();
			this.packages = [];
			this.selectedPackege = null;
			this.selectedCar = null;
			this.selectedDuration = null;
			this.readOrder();

			var dots = document.querySelectorAll('li');
			_.map(dots, x => {
				x.classList.remove('ui-tabview-selected');
				x.classList.remove('ui-state-active');
			});
			this.tabIndex = 0;

			if (this.selectedstateOrder == '01') {
				this.fetchUser(this.selectedCustomer);
			}
		}, 500);
	}

	deleteOrder(e) {
		_.remove(this.obJschemeOrder.ReservationDetail, e);

		if (this.obJschemeOrder.ReservationDetail.length != 0) {
			let arrPrice = [];
			let getPrice = _.map(this.obJschemeOrder.ReservationDetail, x => {
				arrPrice.push(Number(x.PriceCalc));
			});
			this.priceTotal = _.reduce(arrPrice, (sum, n) => {
				return sum + n;
			});
		} else {
			this.priceTotal = 0;
			this.users = [];
		}

		this.clearFormOrder();
		localStorage.setItem('order', JSON.stringify({ timeBased: this.obJschemeOrder }));
		this.mainService.updateLocalStorage();
		this.readOrder();
	}

	public dataOrderTemporaryEdit = null;
	editOrder(e) {
		this.dataOrderTemporaryEdit = e;
		this.valHourly = e.Duration;
		this.isUpdate = true;
		this.disabledCar = false;
		this.disabledDuration = false;
		this.withDriver = e.IsWithDriver ? [] : ['isWithDriver'];
		//this.priority = e.IsPriority ? [] : ['isPriority'];
		this.joinOrder = e.IsJoinOrderAllowed ? ['IsJoinOrderAllowed'] : [];
		this.Id = e.Id;
		this.arrTime = e.arrTime;
		this.users = e.users;
		this.notePickup = e.PickupLocation[0].Notes;
		this.destinationPickup = e.DropLocation[0].Notes;
		this.selectedCostCenter = e.CostCenterId;
		this.selectedCostCenterName = e.CostCenterName;
		this.selectedCar = e.UnitTypeId;
		this.selectedDuration = e.MaterialId;
		this.selectedFuel = e.Fuel;
		this.selectedParking = e.TollAndParking;
		this.selectedDriver = e.DriverOrRider;
		this.selectedDriverSpesification = e.DriverSpesification;
		this.arrAdditional = e.arrAdditional;
		this.BasicPrice = e.Price;
		this.selectedstateOrder = e.selectedstateOrder;
		this.carsPickup = _.filter(e.carsPickup, x => {
			return x.Lat != null && x.Long != null;
		});
		this.selectedCustomer = e.CustomerId;
		this.invalidLocation = false;
		this.fetchUser(e.CustomerId);
		this.fetchCityCoverage(e.CustomerId);
		this.readMinMaxDate();
		let findVehicle = _.find(e.Passengers, { IsEligibility: 1 }).UserId;
		let userVehicle = _.find(this.users, { UserId: findVehicle }).UserId;
		this.fetchCarType(userVehicle);
		this.selectedPic = e.Passengers[0].EmailCorp;
		this.selectedPICAutoComplete = e.Passengers[0].UserId;
		if (this.selectedstateOrder == '02') {
			this.checkValidGuest();
		}
		setTimeout(() => {
			var dots = document.querySelectorAll('li');
			_.map(dots, x => {
				x.classList.remove('ui-state-active');
			});
			this.tabIndex = 0;
		}, 500);
	}
	cancelUpdate() {
		// case ketika edit sudah mengganti/remove tanggal tp dicancel/tidak jadi update
		// yg existing dulu dia langsung nembak di arrTime-nya
		// karena dicancel maka akan mengembalikan date ordernya kembali
		let jsonOrder = JSON.parse(this.mainService['order']);
		if (jsonOrder != null) {
			if (jsonOrder.timeBased != undefined) {
				let find = _.find(this.obJschemeOrder.ReservationDetail, { Id: this.Id }); // arr yg akan diedit
				let order = jsonOrder.timeBased;
				let detailOrder = _.find(order.ReservationDetail, { Id: this.Id }); //mengembalikan tanggal
				find.arrTime = detailOrder.arrTime;
			}
		}
		this.isUpdate = false;
		this.dataOrderTemporaryEdit = null;
		this.clearFormOrder();
	}

	// ============================================================================== //
	// Customers Type
	// ============================================================================== //
	private customers = [];
	private selectedCustomer = null;
	private disableCustomer: boolean = false;
	public loadingReservation: boolean = false;
	fetchCustomer() {
		this.customers = [];
		if (this.mainService['dataUser'] != null) {
			this.orderService.getCustomer().subscribe(
				res => {
					_.map(res.Data, x => {
						let obj = {
							value: x.CustomerId,
							label: x.CustomerName
						};
						this.customers.push(obj);
					});

					let dataUser = JSON.parse(this.mainService['dataUser']);
					if (dataUser.UserIndicator[0].RoleIndicatorId == 'MRI003') {
						if (dataUser.UserProfileB2B[0] != null) {
							this.selectedCustomer = dataUser.UserProfileB2B[0].CustomerId;
							this.customers = _.filter(this.customers, {
								value: this.selectedCustomer
							});
						}
						this.disableCustomer = true;
					} else {
						this.readOrder();
					}

					if (this.dataOrderTemporaryEdit == null) {
						this.selectedCustomer = this.customers[0].value;
					} else {
						setTimeout(() => {
							this.selectedCustomer = this.dataOrderTemporaryEdit.CustomerId;
						}, 500);
					}

					setTimeout(() => {
						this.fetchUser(this.selectedCustomer);
						this.fetchCostCenter(this.selectedCustomer);
						this.fetchCityCoverage(this.selectedCustomer);
					}, 200);
					this.loadingReservation = false;
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchCustomer();
						});
					}

					if (err.name == 'TimeoutError' || err['_body'].type == 'error') {
						this.fetchCustomer();
					}
				}
			);
		}
	}
	selectCustomer(e) {
		this.olc = 0;
		this.outOfTown = 0;
		this.fetchUser(this.selectedCustomer);
		this.fetchCostCenter(this.selectedCustomer);
		this.fetchCityCoverage(this.selectedCustomer);
	}

	// ============================================================================== //
	// Costcenter
	// ============================================================================== //
	onChangeCostCenter(e) {
		let dataLabelCost = _.find(this.arrCostCenter, { value: e.value }).label;
		this.selectedCostCenterName = dataLabelCost;
		this.selectedCostCenter = e.value;
		this.checkValidGuest();
		//get trigger function PoolId
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let OrgId = this.organizationId ? this.organizationId : dataUser.UserProfileB2B[0].OrganizationId;
		this.getPool(OrgId);
	}

	private arrCostCenter = [];
	public selectedCostCenter = null;
	public selectedCostCenterName = null;
	private loadingCostCenter: boolean = false;
	fetchCostCenter(id) {
		this.loadingCostCenter = true;
		this.orderService.getCostCenter(id).subscribe(
			res => {
				this.arrCostCenter = [];
				_.map(res.Data, x => {
					let obj = {
						value: x.Id,
						label: x.CostCenterName
					};
					this.arrCostCenter.push(obj);
				});
				if (this.dataOrderTemporaryEdit != null) {
					this.selectedCostCenter = this.dataOrderTemporaryEdit.CostCenterId;
					this.selectedCostCenterName = this.dataOrderTemporaryEdit.CostCenterName;
				}
				// if(this.dataOrderTemporaryEdit == null){
				//   if(res.Data.length != 0){
				//     let dataUser = JSON.parse(this.mainService['dataUser']);
				//     if(dataUser.UserIndicator[0].RoleIndicatorId == "MRI003"){
				//       if(this.mainService['CostCenterId'] != 'null'){
				//         this.selectedCostCenter = this.mainService['CostCenterId'];
				//       }else{
				//         this.selectedCostCenter = this.arrCostCenter[0].value;
				//       }
				//     }else{
				//       this.selectedCostCenter = this.arrCostCenter[0].value;
				//     }
				//   }
				// }else{
				//   this.selectedCostCenter = this.dataOrderTemporaryEdit.CostCenterId;
				// }

				this.loadingCostCenter = false;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCostCenter(id);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchCostCenter(id);
				}
			}
		);
	}

	// Time Order
	// ========================== //
	public dateTime: Date = new Date();
	public timePicker: Date = new Date();
	public now = moment('00:00', 'HH:mm')['_d'];
	public arrTime = [];
	public createAvailabelDate = [];
	generateArrTime(isNew: boolean, data, isDelete: Boolean) {
		let obj = {
			id: _.uniqueId('time_'),
			originDate: data,
			valueDate: moment(data).format('DD MMMM YYYY'),
			valueTime: moment(data).format('HH:mm')
		};

		this.createArrAvailableDate();

		let find = _.find(this.arrTime, {
			valueDate: moment(data).format('DD MMMM YYYY')
		});
		if (find == undefined) {
			let isInclude = _.includes(this.createAvailabelDate, moment(obj.originDate).format('YYYY-MM-DD'));
			let time = this.MaxOrderTime;
			if (this.arrTime.length) {
				if (isInclude) {
					this.createListDate(time, data, obj, isNew);
				} else {
					if (!isDelete) {
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: 'Error',
							detail: 'Please select nearest date'
						});
					}
				}
			} else {
				this.createListDate(time, data, obj, isNew);
			}
		} else {
			if (isNew) {
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Date already exist'
				});
			}
		}

		this.filterQuantityTimeDuration();
	}

	createArrAvailableDate() {
		this.createAvailabelDate = [];
		_.map(this.arrTime, x => {
			let tomorrow = moment(x.originDate)
				.add(1, 'days')
				.format('YYYY-MM-DD');
			let yesterday = moment(x.originDate)
				.add(-1, 'days')
				.format('YYYY-MM-DD');

			if (!_.includes(this.createAvailabelDate, tomorrow)) {
				this.createAvailabelDate.push(tomorrow);
			}
			if (!_.includes(this.createAvailabelDate, yesterday)) {
				this.createAvailabelDate.push(yesterday);
			}
		});
	}

	createListDate(time, data, obj, isNew) {
		//time = datetime maxOrderTime
		//data = datetime selected
		if (time != null && time != undefined) {
			var splittime = time.split(':');
			var setTime = moment();
			setTime.add(splittime[0], 'hours');
			setTime.add(splittime[1], 'minutes');
			var timeValue = moment(data).format('YYYY-MM-DD HH:mm');
			var timeMax = moment(setTime, 'YYYY-MM-DD HH:mm');
			var timeValue2 = moment(data);
			//timeValue2.add(10, 'minutes'); request comment by angger tgl 03-01-2020
			obj['maxTime'] = time;
			obj['maxOrderTime'] = timeValue2.format('YYYY-MM-DD HH:mm');

			if (moment().format('YYYY-MM-DD') == moment(data).format('YYYY-MM-DD')) {
				if (moment(moment(timeValue, 'YYYY-MM-DD HH:mm')).isAfter(timeMax)) {
					if (isNew) {
						this.arrTime.push(obj);
					}
				} else {
					this.msgs = [];
					this.msgs.push({
						severity: 'error',
						summary: 'Failed',
						detail: 'Minimal order time is above \n' + timeMax.format('YYYY-MM-DD HH:mm')
					});
				}
			} else {
				if (moment(moment(timeValue, 'YYYY-MM-DD HH:mm')).isAfter(timeMax)) {
					if (isNew) {
						this.arrTime.push(obj);
					}
				} else {
					this.msgs = [];
					this.msgs.push({
						severity: 'error',
						summary: 'Failed',
						detail: 'Minimal order time is above \n' + timeMax.format('YYYY-MM-DD HH:mm')
					});
				}
			}
		} else {
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Error',
				detail: 'Minimum order time is null, please select other city'
			});
		}
		this.createArrAvailableDate();
	}

	addTime(e) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let date = moment(this.dateTime).format('YYYY-MM-DD');
		let time = moment(this.timePicker).format('HH:mm');
		let setTime = moment(date + ' ' + time)['_d'];
		this.generateArrTime(true, setTime, false);
		this.readMinMaxDate();

		let getBranchId = _.find(this.originCities, { CityId: this.selectedCity });
		// jika jumlah array tidak []/kosong maka nilainya true
		if (!this.arrContract.length) {
			//Menentukan eligibility berdasarkan otherEmployee dan role super admin
			if (this.selectedstateOrder == '03' && this.selectedPicVehicleType != null) {
				this.fetchCarType(this.selectedPicVehicleType);
			} else {
				// if (this.users.length > 1 && dataUser.RoleId == 'RL-001') {
				// 	let findEli = _.find(this.users, {
				// 		UserId: this.selectedPicVehicleType
				// 	});
				// 	if (findEli == undefined) {
				// 		this.fetchCarType(this.selectedPic);
				// 	} else {
				// 		this.fetchCarType(this.selectedPicVehicleType);
				// 	}
				// } else {
				// 	this.fetchCarType(this.selectedPICAutoComplete);
				// }

				if (this.users.length > 1 && dataUser.RoleId == 'RL-001') {
					let findEli = _.find(this.users, {
						UserId: this.selectedPicVehicleType
					});
					if (findEli == undefined) {
						this.fetchCarType(this.selectedPICAutoComplete);
					} else {
						this.fetchCarType(this.selectedPicVehicleType);
					}
				} else {
					this.fetchCarType(this.selectedPICAutoComplete);
				}
			}
		} else {
			// jika false akan mantrigger function fetchContract
			this.fetchContract(
				this.selectedCustomer,
				this.selectedCar,
				this.selectedDuration,
				getBranchId.BranchId,
				this.selectedPackegeContract.FuelId,
				this.selectedPackegeContract.TollandParkingId,
				this.selectedPackegeContract.DriverorRiderId,
				this.selectedPackegeContract.ChannelTypeId,
				this.selectedPackegeContract.CrewId,
				this.selectedPackegeContract.CoverageAreaId,
				this.productId,
				this.selectedCity
			);
		}
	}

	removeDate(e) {
		let date = moment(this.dateTime).format('YYYY-MM-DD');
		let time = moment(this.timePicker).format('HH:mm');
		let setTime = moment(date + ' ' + time)['_d'];
		let getBranchId = _.find(this.originCities, { CityId: this.selectedCity });
		let tomorrow = moment(e.originDate)
			.add(2, 'days')
			.format('YYYY-MM-DD');
		let isInclude = _.includes(this.createAvailabelDate, tomorrow);

		if (isInclude) {
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Error',
				detail: 'Remove date from last'
			});
		} else {
			_.remove(this.arrTime, e);
			this.createArrAvailableDate();
			this.generateArrTime(false, setTime, true);
			if (!this.arrContract.length) {
				this.fetchCarType(this.selectedPICAutoComplete);
			} else {
				this.fetchContract(
					this.selectedCustomer,
					this.selectedCar,
					this.selectedDuration,
					getBranchId.BranchId,
					this.selectedPackegeContract.FuelId,
					this.selectedPackegeContract.TollandParkingId,
					this.selectedPackegeContract.DriverorRiderId,
					this.selectedPackegeContract.ChannelTypeId,
					this.selectedPackegeContract.CrewId,
					this.selectedPackegeContract.CoverageAreaId,
					this.productId,
					this.selectedCity
				);
			}
		}
	}

	private arrTimeValue = [];
	creatArrayTime() {
		this.arrTimeValue = [];
		_.map(this.arrTime, x => {
			let date = moment(x.originDate).format('YYYY-MM-DD');
			let time = moment(x.originDate).format('HH:mm:00');
			this.arrTimeValue.push(date + ' ' + time);
		});
	}

	// Generate Min & Maximal date
	// ========================== //
	private minDateItemTime = null;
	private maxDateItemTime = null;
	readMinMaxDate() {
		let arrayTime = [];
		_.map(this.arrTime, x => {
			arrayTime.push(x.originDate);
		});
		this.minDateItemTime = moment(_.min(arrayTime)).format('YYYY-MM-DD');
		this.maxDateItemTime = moment(_.max(arrayTime)).format('YYYY-MM-DD');
	}

	// Cities
	// ========================= //
	private cities = [];
	private originCities = [];
	public selectedCity = null;
	public loadingCity: boolean = false;
	fetchCityCoverage(id) {
		this.loadingCity = true;
		this.cities = [];
		this.orderService.getCityCoverage(id).subscribe(
			res => {
				this.originCities = res.Data;
				this.loadingCity = false;
				_.map(res.Data, x => {
					let obj = {
						value: x.CityId,
						label: x.MsCityName
					};
					this.cities.push(obj);
				});
				if (res.Data.length != 0) {
					if (this.dataOrderTemporaryEdit == null) {
						//existing code
						//this.selectedCity = this.cities[0].value;

						//modify code 16-12-19
						this.selectedCity = null;
					} else {
						this.selectedCity = this.dataOrderTemporaryEdit.CityId;
					}
				}
				this.onSelectCity();
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

	public MaxOrderTime = null;
	public isLoadMaxOrderTime = false;
	onSelectCity() {
		if (this.selectedCity != null) {
			this.isLoadMaxOrderTime = true;
		}
		this.orderService.getMaxOrderTime(this.selectedCity, this.selectedCustomer).subscribe(
			res => {
				if (res.Data.length != 0) {
					this.MaxOrderTime = res.Data[0].MaxOrderTime;
					this.isLoadMaxOrderTime = false;
				}
				this.olc = 0;
				this.outOfTown = 0;
				this.arrContract = [];
				this.packages = [];
				this.selectedPackege = null;
				this.selectedContrat = null;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.onSelectCity();
					});
				}

				if (err.name == 'TimeoutError') {
					this.onSelectCity();
				}
			}
		);
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
				this.selectedDriverSpesification = this.driverSpesification[0].value;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDriverSpesification();
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchDriverSpesification();
				}
			}
		);
	}
	// Get Contract
	// ========================= //
	public selectedContrat = null;
	public arrContract = [];
	public loadingContract: boolean = false;
	private BasicPrice: Number = 0;
	private totalPriceOrder: number = 0;
	public olc = 0;
	public outOfTown = 0;
	fetchContract(
		CustomerId,
		VehicleTypeId,
		MaterialId,
		BranchId,
		FuelSAPCode,
		TollandParkingSAPCode,
		DriverorRiderSAPCode,
		ChannelTypeSAPCode,
		CrewSAPCode,
		CoverageAreaSAPCode,
		ServiceTypeId,
		CityId
	) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.loadingContract = true;

		// List Additional
		let IsStay = false;
		if (_.includes(this.arrAdditional, 'IsStay')) {
			IsStay = true;
		}

		let OutTown = false;
		if (_.includes(this.arrAdditional, 'OutTown')) {
			OutTown = true;
		}

		// List Time
		let listTime = [];
		_.map(this.arrTime, x => {
			listTime.push(moment(x.originDate).format('YYYY-MM-DD'));
		});

		CrewSAPCode = CrewSAPCode == null ? '' : CrewSAPCode;
		CoverageAreaSAPCode = CoverageAreaSAPCode == null ? '' : CoverageAreaSAPCode;
		this.orderService
			.getContract(
				CustomerId,
				dataUser.UserCompanyMapping[0].BusinessUnitId,
				this.minDateItemTime,
				this.maxDateItemTime,
				VehicleTypeId,
				this.withDriver.length ? false : true,
				MaterialId,
				BranchId,
				FuelSAPCode,
				TollandParkingSAPCode,
				DriverorRiderSAPCode,
				ChannelTypeSAPCode,
				CrewSAPCode,
				CoverageAreaSAPCode,
				ServiceTypeId,
				CityId,
				true,
				true,
				listTime.toString()
			)
			.subscribe(
				res => {
					// Initial Data
					this.arrContract = res.Data;
					if (this.arrContract.length) {
						setTimeout(() => {
							this.loadingContract = false;
						}, 500);

						this.selectedContrat = res.Data[0];
						_.map(this.arrContract, x => {
							x.Dates = moment(x.Dates).format('DD MMM YYYY');
							x.BasicPrice = Number(x.BasicPrice);
							x.olcQuantity = 0;
							x.time = 0;

							if (x.AdditionalPrice.Trip != '' || x.AdditionalPrice.Trip != undefined) {
								this.outOfTown = Number(x.AdditionalPrice.Trip);
							}
							if (x.AdditionalPrice.Olc != '' || x.AdditionalPrice.Olc != undefined) {
								this.olc = Number(x.AdditionalPrice.Olc);
							}

							if (x.AdditionalPrice.Olc == undefined) {
								x.AdditionalPrice.Olc = 0;
							} else {
								x.AdditionalPrice.Olc = Number(x.AdditionalPrice.Olc);
							}

							if (x.AdditionalPrice.Trip == undefined) {
								x.AdditionalPrice.Trip = 0;
								x.tripQuantity = 0;
							} else {
								x.AdditionalPrice.Trip = Number(x.AdditionalPrice.Trip);
								x.tripQuantity = 1;
							}

							// x.totalPrice = x.BasicPrice + x.AdditionalPrice.Olc + x.AdditionalPrice.Trip;

							x.totalPrice = x.BasicPrice;
						});
						this.BasicPrice = _.sumBy(this.arrContract, x => {
							return x.totalPrice;
						});

						this.sumQtyCarsPickup = 1;
					}

					// Filter Time On Cantract
					if (this.durationType == 'HR' || this.durationType == 'Time') {
						let findMaterialID = _.find(this.originDurations, {
							MaterialId: this.selectedDuration
						});
						this.olcQuantity = 0;
						_.map(this.arrTime, (x, i) => {
							let setTime = moment(x.originDate).add(findMaterialID.Duration, 'hours');
							let setCurrentDate = moment(setTime['_i']).format('YYYY-MM-DD');
							let updateDate = moment(setTime['_d']).format('YYYY-MM-DD');

							let yesterday = moment(x.originDate)
								.add(-1, 'days')
								.format('DD MMMM YYYY');
							let tomorrow = moment(x.originDate)
								.add(1, 'days')
								.format('DD MMMM YYYY');
							let findYesterday = _.find(this.arrTime, {
								valueDate: yesterday
							});
							let findTomorrow = _.find(this.arrTime, { valueDate: tomorrow });

							this.arrContract[i]['dateTime'] =
								moment(this.arrContract[i].Dates).format('YYYY-MM-DD') + ' ' + x.valueTime;

							if (updateDate != setCurrentDate) {
								this.olcQuantity++;
								this.arrContract[i].olcQuantity = 1;
							}

							// this.arrAdditional berisi [isStay, OutTown]
							if (_.isArray(this.arrAdditional) && this.arrAdditional.length == 2) {
								if (findTomorrow != undefined) {
									this.arrContract[i].olcQuantity = 1;
									this.arrContract[i].tripQuantity = 0;
								} else if (findTomorrow == undefined && findYesterday != undefined) {
									this.arrContract[i].olcQuantity = 0;
								}
							}

							if (this.arrContract[i].olcQuantity == 0) {
								this.arrContract[i].AdditionalPrice.Olc = 0;
							}

							if (this.arrContract[i].tripQuantity == 0) {
								this.arrContract[i].AdditionalPrice.Trip = 0;
							}

							// this.arrContract[i].totalPrice = this.arrContract[i].BasicPrice + this.arrContract[i].AdditionalPrice.Olc + this.arrContract[i].AdditionalPrice.Trip;
							this.arrContract[i].totalPrice = this.arrContract[i].BasicPrice;
							this.totalPriceOrder = _.sumBy(this.arrContract, x => {
								return x.totalPrice;
							});
						});
					}

					// Edit Condition
					if (this.dataOrderTemporaryEdit == null) {
						if (this.carsPickup.length) {
							_.remove(this.carsPickup, (x, i) => {
								return x.Lat == null && i >= 1;
							});
						} else {
							this.addUnitCar();
						}
					} else {
						this.carsPickup = this.dataOrderTemporaryEdit.carsPickup;
						_.remove(this.carsPickup, { Lat: null, Long: null });
						this.sumQtyCarsPickup = _.sumBy(this.carsPickup, x => {
							return x.qty;
						});
						this.cekInValidLocation();

						setTimeout(() => {
							var dots = document.querySelectorAll('li');
							_.map(dots, x => {
								x.classList.remove('ui-state-active');
							});
						}, 500);
					}

					if (this.dataOrderTemporaryEdit != null && this.arrContract.length == 0) {
						this.fetchContract(
							CustomerId,
							VehicleTypeId,
							MaterialId,
							BranchId,
							FuelSAPCode,
							TollandParkingSAPCode,
							DriverorRiderSAPCode,
							ChannelTypeSAPCode,
							CrewSAPCode,
							CoverageAreaSAPCode,
							ServiceTypeId,
							CityId
						);
					}

					// this.getHolidayDate();
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchContract(
								CustomerId,
								VehicleTypeId,
								MaterialId,
								BranchId,
								FuelSAPCode,
								TollandParkingSAPCode,
								DriverorRiderSAPCode,
								ChannelTypeSAPCode,
								CrewSAPCode,
								CoverageAreaSAPCode,
								ServiceTypeId,
								CityId
							);
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchContract(
							CustomerId,
							VehicleTypeId,
							MaterialId,
							BranchId,
							FuelSAPCode,
							TollandParkingSAPCode,
							DriverorRiderSAPCode,
							ChannelTypeSAPCode,
							CrewSAPCode,
							CoverageAreaSAPCode,
							ServiceTypeId,
							CityId
						);
					}

					this.selectedContrat = null;
					this.loadingContract = false;
					this.arrContract = [];
					this.carsPickup = [];
					this.invalidLocation = true;
					this.sumQtyCarsPickup = 0;
					this.msgs = [];
					this.msgs.push({
						severity: 'warn',
						summary: 'Failed',
						detail: err.message
					});
				}
			);
	}

	// Get Holiday
	// ========================= //
	getHolidayDate() {
		_.map(this.arrContract, x => {
			this.orderService.getOrderHolidayDate(moment(x.Dates).format('YYYY-MM-DD')).subscribe(
				res => {
					if (res.Data != '') {
						this.fetchPriceWeekDay(true, x);
					} else {
						this.fetchPriceWeekDay(false, x);
					}
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.getHolidayDate();
						});
					}

					if (err.name == 'TimeoutError') {
						this.getHolidayDate();
					}
				}
			);
		});
	}

	// Fetch Price Week Day
	// ========================= //
	fetchPriceWeekDay(isHoliday, obj) {
		this.orderService.getPriceWeekDay(this.selectedCity, this.selectedCustomer).subscribe(
			res => {
				if (isHoliday) {
					if (obj.AdditionalPrice.Olc != 0) {
						obj.AdditionalPrice.Olc = Number(res.Data[0].OutOfTownOverNightWeekEnd);
					}

					if (obj.AdditionalPrice.Trip != 0) {
						obj.AdditionalPrice.Trip = Number(res.Data[0].OutOfTownWeekEnd);
					}
				} else {
					if (obj.AdditionalPrice.Olc != 0) {
						obj.AdditionalPrice.Olc = Number(res.Data[0].OutOfTownOverNightWeekDay);
					}

					if (obj.AdditionalPrice.Trip != 0) {
						obj.AdditionalPrice.Trip = Number(res.Data[0].OutOfTownWeekDay);
					}
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchPriceWeekDay(isHoliday, obj);
					});
				}

				if (err.name == 'TimeoutError') {
					this.fetchPriceWeekDay(isHoliday, obj);
				}
			}
		);
	}

	// Get Package
	// ========================= //
	private selectedFuel = null;
	private selectedParking = null;
	private selectedDriver = null;
	public packages = [];
	public loadingPeckage: boolean = false;
	fetchPeckage(CustomerId, VehicleTypeId, MaterialId, BranchId) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.loadingPeckage = true;
		this.orderService
			.getPackage(
				CustomerId,
				dataUser.UserCompanyMapping[0].BusinessUnitId,
				this.minDateItemTime,
				this.maxDateItemTime,
				VehicleTypeId,
				this.withDriver.length ? false : true,
				MaterialId,
				BranchId
			)
			.subscribe(
				res => {
					this.packages = [];
					if (res.Data != '') {
						this.packages = res.Data;
						_.map(this.packages, x => {
							x['value'] = _.uniqueId('package_');
						});
					} else {
						this.arrContract = [];
						this.selectedContrat = null;
					}

					if (this.packages.length) {
						this.selectPackage(this.packages[0].value);
					}
					this.loadingPeckage = false;
				},
				err => {
					this.loadingPeckage = false;
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchPeckage(CustomerId, VehicleTypeId, MaterialId, BranchId);
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchPeckage(CustomerId, VehicleTypeId, MaterialId, BranchId);
					}
				}
			);
	}

	private selectedPackege = null;
	private selectedPackegeContract = null;
	selectPackage(e) {
		this.selectedPackege = e;
		this.selectedPackegeContract = _.find(this.packages, { value: e });

		let getBranchId = _.find(this.originCities, { CityId: this.selectedCity });
		if (getBranchId != undefined && this.packages.length) {
			this.fetchContract(
				this.selectedCustomer,
				this.selectedCar,
				this.selectedDuration,
				getBranchId.BranchId,
				this.selectedPackegeContract.FuelId,
				this.selectedPackegeContract.TollandParkingId,
				this.selectedPackegeContract.DriverorRiderId,
				this.selectedPackegeContract.ChannelTypeId,
				this.selectedPackegeContract.CrewId,
				this.selectedPackegeContract.CoverageAreaId,
				this.productId,
				this.selectedCity
			);
		}
	}

	private tripQuantity = 0;
	private tripPrice = 0;
	private olcQuantity = 0;
	private olcPrice = 0;

	changeAdditional() {
		if (this.selectedPackegeContract != null) {
			let getBranchId = _.find(this.originCities, {
				CityId: this.selectedCity
			});
			if (getBranchId != undefined && this.packages.length) {
				this.fetchContract(
					this.selectedCustomer,
					this.selectedCar,
					this.selectedDuration,
					getBranchId.BranchId,
					this.selectedPackegeContract.FuelId,
					this.selectedPackegeContract.TollandParkingId,
					this.selectedPackegeContract.DriverorRiderId,
					this.selectedPackegeContract.ChannelTypeId,
					this.selectedPackegeContract.CrewId,
					this.selectedPackegeContract.CoverageAreaId,
					this.productId,
					this.selectedCity
				);
			}
		}
	}
	// ============================================================================== //
	// Pick Up Section
	// ============================================================================== //

	// Duration
	// ========================= //
	private durations: SelectItem[];
	private originDurations: SelectItem[];
	private disabledDuration: boolean = true;
	public loadingDuration: boolean = false;
	private selectedDuration = null;
	private durationType = null;
	public showAlertDuration: boolean = false;
	public valHourly: number = 1;
	fetchDuration(customer, VehicleTypeId, ServiceTypeId) {
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.loadingDuration = true;
		if (this.minDateItemTime != null && this.maxDateItemTime != null) {
			this.orderService
				.getDuration(
					customer,
					dataUser.UserCompanyMapping[0].BusinessUnitId,
					this.minDateItemTime,
					this.maxDateItemTime,
					VehicleTypeId,
					ServiceTypeId,
					this.withDriver.length ? false : true
				)
				.subscribe(
					res => {
						this.loadingDuration = false;
						this.durations = [];
						if (res.Data != '') {
							this.originDurations = res.Data;
							this.showAlertDuration = false;
							_.map(res.Data, x => {
								let obj = {
									value: x.MaterialId,
									label: x.Duration + ' ' + x.UOM
								};
								this.durations.push(obj);
							});
							this.disabledDuration = false;
							if (this.dataOrderTemporaryEdit == null) {
								let makeRandomMaterialId;
								if (this.durations.length > 1) {
									makeRandomMaterialId = this.durations[Math.floor(Math.random() * this.durations.length)];
									this.selectedDuration = makeRandomMaterialId.value;
								} else {
									this.selectedDuration = this.durations[0].value;
								}
								this.durationType = res.Data[0].UOM;
								this.valHourly = 1;
							} else {
								this.packages = this.dataOrderTemporaryEdit.packages;
								this.selectedPackege = this.dataOrderTemporaryEdit.packageSelected;

								if (this.dataOrderTemporaryEdit.MaterialId != this.durations[0].value) {
									this.selectedDuration = this.durations[0].value;
								} else {
									this.selectedDuration = this.dataOrderTemporaryEdit.MaterialId;
								}
								this.durationType = this.dataOrderTemporaryEdit.durationType;
								this.valHourly = this.dataOrderTemporaryEdit.Duration;
							}
							this.filterQuantityTimeDuration();
						}
					},
					err => {
						this.loadingDuration = false;
						if (err.status == 401) {
							this.mainService.updateToken(() => {
								this.fetchDuration(customer, VehicleTypeId, ServiceTypeId);
							});
						}

						if (err.name == 'TimeoutError') {
							this.fetchDuration(customer, VehicleTypeId, ServiceTypeId);
						}
					}
				);
		}
	}
	filterQuantityTimeDuration() {
		if (this.arrTime.length > 1) {
			if (this.valHourly >= 16) {
				this.showAlertDuration = false;
				this.selectionFetch();
			} else {
				this.showAlertDuration = true;
			}
		} else {
			this.showAlertDuration = false;
			this.selectionFetch();
		}
		this.cekInValidLocation();
	}
	selectionFetch() {
		if (this.dataOrderTemporaryEdit == null) {
			let getBranchId = _.find(this.originCities, { CityId: this.selectedCity }).BranchId;
			if (getBranchId != undefined) {
				this.fetchPeckage(this.selectedCustomer, this.selectedCar, this.selectedDuration, getBranchId);
			}
		} else {
			this.selectPackage(this.dataOrderTemporaryEdit.packageSelected);
		}
	}
	private changeInterval = null;
	onChangeDuration() {
		clearInterval(this.changeInterval);
		this.changeInterval = setInterval(() => {
			this.filterQuantityTimeDuration();
			clearInterval(this.changeInterval);
		}, 1000);
	}
	onBlurDuratuion() {
		if (this.valHourly == null) {
			this.valHourly = 1;
		}
		clearInterval(this.changeInterval);
		this.changeInterval = setInterval(() => {
			this.filterQuantityTimeDuration();
			clearInterval(this.changeInterval);
		}, 1000);
	}

	// Cars Type
	// ========================= //
	private selectedCar = null;
	private cars = [];
	private cloneCars = [];
	private disabledCar: boolean = true;
	public loadingCars: boolean = false;
	public isFilerByPassengers: Boolean = false;
	fetchCarType(UserId) {
		if (UserId != null) {
			this.cloneCars = [];
			this.loadingCars = true;
			this.orderService.getVehicleByEligibility(UserId, this.minDateItemTime, this.maxDateItemTime).subscribe(
				res => {
					this.cloneCars = res.Data;
					this.cars = [];
					_.map(res.Data, x => {
						let order = JSON.parse(this.mainService['order']);
						let obj;
						if (order != null) {
							if (order.timeBased != undefined) {
								let findCarType = _.find(order.timeBased.ReservationDetail, {
									UnitTypeId: x.VehicleTypeId
								});
								if (findCarType != undefined) {
									if (this.dataOrderTemporaryEdit == null) {
										//renamed styleClass selected, coz style Class selected the styling = [used] label, request by angger 01-10-19
										//obj = {value: x.VehicleTypeId, label:x.Description, styleClass: 'selected'};
										obj = {
											value: x.VehicleTypeId,
											label: x.Description,
											styleClass: 'used',
											VehicleCapacity: x.VehicleCapacity
										};
									} else {
										if (x.VehicleTypeId == this.dataOrderTemporaryEdit.UnitTypeId) {
											obj = {
												value: x.VehicleTypeId,
												label: x.Description,
												styleClass: null,
												VehicleCapacity: x.VehicleCapacity
											};
										} else {
											obj = {
												value: x.VehicleTypeId,
												label: x.Description,
												styleClass: 'used',
												VehicleCapacity: x.VehicleCapacity
											};
										}
									}
								} else {
									obj = {
										value: x.VehicleTypeId,
										label: x.Description,
										styleClass: null,
										VehicleCapacity: x.VehicleCapacity
									};
								}
							} else {
								obj = {
									value: x.VehicleTypeId,
									label: x.Description,
									styleClass: null,
									VehicleCapacity: x.VehicleCapacity
								};
							}
						} else {
							obj = {
								value: x.VehicleTypeId,
								label: x.Description,
								styleClass: null,
								VehicleCapacity: x.VehicleCapacity
							};
						}
						this.cars.push(obj);
					});
					this.disabledCar = false;

					if (this.dataOrderTemporaryEdit == null) {
						if (this.selectedCar != null) {
							let objCar = {
								CityId: this.selectedCity,
								id: _.uniqueId('unit_'),
								unit: this.cars[0].label,
								Long: null,
								Lat: null,
								Alamat: null,
								Notes: null,
								DestinationNotes: null,
								qty: 1
							};

							if (!this.isUpdate) {
								this.carsPickup = [];
								this.carsPickup.push(objCar);
							}
						}
					} else {
						if (this.isSelectedCar) {
							this.selectedCar = this.dataOrderTemporaryEdit.UnitTypeId;
						} else {
							this.selectedCar = null;
						}
					}

					this.fetchDuration(this.selectedCustomer, this.selectedCar, this.productId);
					this.loadingCars = false;
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchCarType(UserId);
						});
					}

					if (err.name == 'TimeoutError') {
						this.fetchCarType(UserId);
					}
				}
			);
		}
	}

	public isSelectedCar: Boolean = true;
	onSelectCarType(e) {
		this.packages = [];
		this.isSelectedCar = true;
		this.fetchDuration(this.selectedCustomer, this.selectedCar, this.productId);
	}

	public sumQtyCarsPickup = 1;
	public carsPickup = [];
	addUnitCar() {
		let obj = {
			CityId: this.selectedCity,
			id: _.uniqueId('unit_'),
			unit: _.find(this.cars, { value: this.selectedCar }).label,
			Long: null,
			Lat: null,
			Alamat: null,
			Notes: null,
			DestinationNotes: null,
			qty: 1
		};
		this.carsPickup.push(obj);
		this.sumQtyCarsPickup = _.sumBy(this.carsPickup, x => {
			return x.qty;
		});

		this.cekInValidLocation();
	}
	readUnit() {}
	changeVehicle(e, obj) {}
	changeQtyVehicle() {
		this.cekInValidLocation();
		this.sumQtyCarsPickup = _.sumBy(this.carsPickup, x => {
			return x.qty;
		});
	}
	removeUnitCar(e) {
		_.remove(this.carsPickup, e);
		this.sumQtyCarsPickup = _.sumBy(this.carsPickup, x => {
			return x.qty;
		});
		this.cekInValidLocation();
	}
	public invalidLocation: boolean = true;
	cekInValidLocation() {
		let findNull = _.find(this.carsPickup, { Long: null });
		let findNoteNull = _.find(this.carsPickup, { Notes: null });
		let findDestinationNoteNull = _.find(this.carsPickup, {
			DestinationNotes: null
		});
		let findQtyNull = _.find(this.carsPickup, { qty: null });
		if (
			findNull == undefined &&
			findNoteNull == undefined &&
			findDestinationNoteNull == undefined &&
			findQtyNull == undefined &&
			!this.showAlertDuration
		) {
			this.invalidLocation = false;
		} else {
			this.invalidLocation = true;
		}
	}
	autoCompleteCallback(selectedData: any, obj) {
		if (selectedData.response) {
			obj.Long = selectedData.data.geometry.location.lng;
			obj.Lat = selectedData.data.geometry.location.lat;
			// obj.Alamat = selectedData.data.formatted_address;
			obj.Alamat = selectedData.data.name + ' ' + selectedData.data.formatted_address;
			obj.Name = selectedData.data.name;
		} else {
			obj.Long = null;
			obj.Lat = null;
			obj.Alamat = null;
			obj.Name = null;
		}

		this.cekInValidLocation();
	}
	onChangeNote(e) {
		if (e.Notes == '') {
			e.Notes = null;
		}
		this.cekInValidLocation();
	}
	onChangeDestinationNote(e) {
		if (e.DestinationNotes == '') {
			e.DestinationNotes = null;
		}
		this.cekInValidLocation();
	}

	private notePickup;
	private PickupLocation = [];

	private destinationPickup;
	private DropLocation = [
		{
			CityId: null,
			Long: null,
			Lat: null,
			Alamat: null,
			Name: null,
			Time: null,
			Notes: this.destinationPickup
		}
	];
	createObjectPickup() {
		let arrPickup = [];
		let filterPickup = _.filter(this.carsPickup, x => {
			return x.Lat != null && x.Long != null;
		});
		_.map(filterPickup, x => {
			x['CityId'] = this.selectedCity;
			delete x['id'];

			_.times(x.qty, function() {
				arrPickup.push(x);
			});
		});
		this.PickupLocation = arrPickup;
		this.DropLocation[0].Notes = this.destinationPickup;
	}

	// ============================================================================== //
	// Setting PIC Passenger & User Information
	// ============================================================================== //

	// Fetch User Account
	// =========================== //
	private userAccount = [];
	private originUser = [];
	private pics = [];
	public selectedPic = null;
	private disablePic: boolean = false;
	private loadingUserAccount: boolean = true;
	fetchUser(id) {
		this.loadingUserAccount = true;
		this.userAccount = [];
		this.pics = [];
		// this.userManagemenetService.getAccountByCustomer(id).subscribe(
		// 	res => {
		// 		if (!res.Data.length) {
		// 			this.selectedPicVehicleType = null;
		// 			this.selectedPic = null;
		// 			this.users = [];
		// 		} else {
		// 			_.map(res.Data, (x: any) => {
		// 				x['FullName'] = x.FirstName + ' ' + x.LastName;
		// 				let obj = {
		// 					label: x.EmailCorp,
		// 					value: x.Id
		// 				};
		// 				this.pics.push(x.EmailCorp);
		// 				this.userAccount.push(obj);
		// 			});
		// 			this.originUser = res.Data;
		// 		}

		// 	},
		// 	err => {
		// 		if (err.status == 401) {
		// 			this.mainService.updateToken(() => {
		// 				this.fetchUser(id);
		// 			});
		// 		}

		// 		if (err.name == 'TimeoutError') {
		// 			this.fetchUser(id);
		// 		}
		// 	}
		// );
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let obj = {
			id: _.uniqueId('passenger_'),
			UserId: dataUser.Id,
			isPIC: dataUser.Id,
			PICName: dataUser.FirstName + ' ' + dataUser.LastName,
			phone: dataUser.NoHandphone,
			email: dataUser.EmailCorp,
			isDisable: true,
			validPhone: 'none',
			validEmail: 'none'
		};
		if (this.dataOrderTemporaryEdit == null) {
			this.users = [];
			this.users.push(obj);
		}
		if (dataUser.RoleId != 'RL-001' && dataUser.RoleId != 'RL-002') {
			this.selectedPic = dataUser.EmailCorp;
		}
		this.selectedPICAutoComplete = dataUser.Id;
		this.userIndicator = dataUser.UserIndicator[0].RoleIndicatorId;

		switch (this.userIndicator) {
			case 'MRI003':
				this.selectedPic = dataUser.EmailCorp;
				this.selectedPICAutoComplete = dataUser.Id;
				this.fetchCostCenter(dataUser.UserProfileB2B[0].CustomerId);
				this.selectedPicVehicleType = this.users[0].id;

				if (dataUser.RoleId != 'RL-001') {
					this.disablePic = true;
				}
				break;
			case 'MRI001':
				this.fetchCostCenter(this.selectedCustomer);
				this.disablePic = false;
				break;
		}
		this.readOrder();

		if (this.dataOrderTemporaryEdit != null) {
			this.selectedPic = this.dataOrderTemporaryEdit.EmailCorp;
			let find = _.find(this.dataOrderTemporaryEdit.Passengers, {
				IsEligibility: 1
			});
			let findPIC = _.find(this.dataOrderTemporaryEdit.users, {
				email: find.Email
			});
			this.selectedPicVehicleType = findPIC.id;
		} else {
			this.fetchCarType(this.selectedPICAutoComplete);
		}

		this.loadingUserAccount = false;
	}

	// GET PoolId
	private PoolId: String = null;
	getPool(orgId) {
		this.orderService.getPoolId(orgId).subscribe(
			res => {
				if (res.Data.length) {
					this.PoolId = res.Data[0].PoolId;
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.getPool(orgId);
					});
				}

				if (err.name == 'TimeoutError') {
					this.getPool(orgId);
				}
			}
		);
	}
	// Creat Obj Passenger & User Information
	// ============================= //
	public users = [
		{
			id: _.uniqueId('passenger_'),
			UserId: null,
			isPIC: false,
			PICName: '',
			phone: '',
			email: '',
			isDisable: false,
			validPhone: 'none',
			validEmail: 'none'
		}
	];

	// Select PIC
	// =============================== //
	private selectedPIC = null;
	private selectedPICAutoComplete = null;
	public selectedPicVehicleType: string = null;
	private organizationId: String;
	onSelectPic(e) {
		this.organizationId = null;
		let find = _.find(this.userOriginAutoComplete, { EmailCorp: e });
		if (find != undefined) {
			let obj = {
				id: _.uniqueId('passenger_'),
				UserId: find.Id,
				isPIC: find.Id,
				PICName: find.FirstName + ' ' + find.LastName,
				phone: find.NoHandphone,
				email: find.EmailCorp,
				isDisable: true,
				validPhone: 'none',
				validEmail: 'none'
			};
			this.selectedPICAutoComplete = find.Id;
			this.users = [obj];
			this.selectedPicVehicleType = this.users[0].id;
			this.organizationId = find.user_profile_b2_b[0].OrganizationId;
			this.getPool(this.organizationId);
		}

		if (this.selectedCity != null && this.arrTime.length != 0) {
			//this.fetchCarType(this.selectedPic);
			this.fetchCarType(this.selectedPICAutoComplete);
		}
		this.checkValidGuest();
	}

	// Add Pesenger Information (PIC or Guest)
	// ================================ //
	private statusErr: Boolean = false;
	addUser() {
		let _this = this;
		let isPassengers = _this.users[0];
		if (_this.selectedstateOrder == '03' && _this.checkValidPassenger && isPassengers.UserId == null) {
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Error',
				detail: 'Invalid Passengers'
			});
		} else {
			let obj = {
				id: _.uniqueId('passenger_'),
				UserId: null,
				isPIC: null,
				PICName: null,
				phone: null,
				email: null,
				isDisable: false,
				validPhone: 'none',
				validEmail: 'none'
			};
			this.users.push(obj);
			if (_this.selectedstateOrder == '02') {
				_this.statusErr = false;
				if (_this.users.length > 6) {
					let limitPassenger = _.filter(this.users, (item, index) => {
						return index < 6;
					});
					this.users = limitPassenger;
					_this.statusErr = true;
				}
			} else {
				let defaultCheckId = _.filter(this.users, obj => {
					return obj.id != '';
				});
				this.defaultCheck = defaultCheckId[0].UserId;
				_this.statusErr = false;
				if (_this.users.length > 5) {
					let limitPassenger = _.filter(this.users, (item, index) => {
						return index < 5;
					});
					this.users = limitPassenger;
					_this.statusErr = true;
				}
			}
			if (_this.statusErr) {
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Error',
					detail: 'Maximal 5 Passengers'
				});
			}
			_this.checkDuplicateEmail();
		}
	}

	//notif and remove duplicate email
	//================================================================
	checkDuplicateEmail() {
		let _this = this;
		this.users = _.reduce(
			_this.users,
			(uniq, ob) => {
				if (!_.some(uniq, obj => obj.email == ob.email)) {
					uniq.push(ob);
				} else {
					let notif = _.find(_this.users, { email: ob.email });
					if (notif.email != null) {
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: 'Error',
							detail: 'User already exist'
						});
					}
				}
				return _.filter(uniq, item => {
					return item.email != '';
				});
			},
			[]
		);
	}

	checkaValidNumberPhone(phone) {
		return phone.length >= 10;
	}

	changePIC(obj) {
		this.isSelectedCar = false;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.olc = 0;
		this.outOfTown = 0;
		if (this.maxDateItemTime != null) {
			if (this.selectedstateOrder == '03' || dataUser.RoleId == 'RL-001' || dataUser.RoleId == 'RL-002') {
				this.selectedPicVehicleType = obj.UserId;
				this.fetchCarType(obj.UserId);
				if (this.cars.length) {
					setTimeout(() => {
						let isVehicleValid = _.find(this.cars, { value: this.selectedCar });
						if (isVehicleValid != undefined) {
							this.isSelectedCar = true;
						} else {
							this.isSelectedCar = false;
						}
					}, 3000);
				}
			} else {
				this.fetchCarType(this.selectedPICAutoComplete);
			}
		}
	}

	// private filterpics = [];
	// searchPics(e) {
	// 	// this.userOriginAutoComplete = [];
	// 	// this.emailAutocomplete = [];
	// 	// this.userManagemenetService
	// 	// 	.getAccountByCustomerAutocomplete(this.selectedCustomer, e.query.toLowerCase())
	// 	// 	.subscribe(res => {
	// 	// 		_.map(res.Data, prop => {
	// 	// 			setTimeout(() => {
	// 	// 				let obj = {
	// 	// 					FullName: prop.FirstName + '' + prop.LastName,
	// 	// 					EmailCorp: prop.EmailCorp,
	// 	// 					NoHandphone: prop.NoHandphone,
	// 	// 					UserId: prop.Id
	// 	// 				};
	// 	// 				console.log(prop.EmailCorp);
	// 	// 				return prop.EmailCorp;
	// 	// 				// this.emailAutocomplete.push(prop.EmailCorp);
	// 	// 				// this.userOriginAutoComplete.push(obj);
	// 	// 			}, 500);
	// 	// 		});
	// 	// 	});
	// 	// console.log(this.userOriginAutoComplete);
	// 	//console.log(this.pics)
	// 	this.filterpics = _.filter(this.pics, item => {
	// 		if (item == undefined) return item;
	// 		return item.toLowerCase().indexOf(e.query.toLowerCase()) > -1;
	// 	});
	// }

	private defaultCheck = null;
	private checkValidPassenger: Boolean = false;
	onChangePicUser(e, user) {
		let userId = JSON.parse(this.mainService['dataUser']).Id;
		let find = _.find(this.userOriginAutoComplete, { EmailCorp: e });
		let findUser = _.find(this.users, { UserId: find.Id });

		if (this.selectedstateOrder == '03' && userId == find.Id) {
			this.checkValidPassenger = true;
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Failed',
				detail: 'Please choose another employee'
			});
		} else {
			if (findUser == undefined) {
				if (find != undefined) {
					user['PICName'] = find.FirstName + ' ' + find.LastName;
					user['email'] = find.EmailCorp;
					user['phone'] = find.NoHandphone;
					user['UserId'] = find.Id;
					user['id'] = find.Id;
					//check for default radiobutton at least ada satu pic
					if (this.selectedstateOrder == '03') {
						if (this.defaultCheck != null) {
							this.selectedPicVehicleType = this.defaultCheck;
						} else {
							this.selectedPicVehicleType = find.Id;
						}
					}
					if (
						(this.selectedPicVehicleType != null && this.users.length > 0 && this.selectedstateOrder == '03') ||
						userId.RoleId == 'RL-001'
					) {
						this.fetchCarType(this.selectedPicVehicleType);
					}
					setTimeout(() => {
						user['isDisable'] = true;
					}, 500);
				}
			} else {
				user['PICName'] = null;
				user['email'] = null;
				user['phone'] = null;
				this.msgs = [];
				this.msgs.push({
					severity: 'error',
					summary: 'Failed',
					detail: 'User already exist'
				});
			}
			this.checkValidPassenger = false;
		}
	}

	public userOriginAutoComplete = [];
	public emailAutocomplete: any[] = [];
	public filterpics: String[];
	onSearchPicUser(e, user) {
		let query = e.query;
		this.emailAutocomplete = [];
		this.userManagemenetService
			.getAccountByCustomerAutocomplete(this.selectedCustomer, query.toLowerCase())
			.subscribe(res => {
				this.filterpics = [];
				_.map(res.Data, prop => {
					this.emailAutocomplete.push(prop.EmailCorp);
					this.filterpics = this.emailAutocomplete;
					this.userOriginAutoComplete = res.Data;
				});
			});

		let findUserId = this.findId();
		let findUser;
		if (findUser != undefined) {
			findUser = _.find(this.users, { UserId: findUserId.Id });
		}
		if (findUser == undefined) {
			if (findUserId == undefined) {
				this.checkValidPassenger = true;
			} else {
				user['PICName'] = findUserId.FirstName + ' ' + findUserId.LastName;
				user['email'] = findUserId.EmailCorp;
				user['phone'] = findUserId.NoHandphone;
				user['UserId'] = findUserId.Id;
				setTimeout(() => {
					user['isDisable'] = true;
				}, 500);
				this.checkValidPassenger = false;
			}
		} else {
			user['PICName'] = null;
			user['email'] = null;
			user['phone'] = null;
			this.msgs = [];
			this.msgs.push({
				severity: 'error',
				summary: 'Failed',
				detail: 'User already exist'
			});
		}
	}
	findId() {
		let findUserId = _.find(this.userOriginAutoComplete, x => {
			if (x.EmailCorp == undefined) return x.EmailCorp;
		});
		return findUserId;
	}

	removeUser(e) {
		_.remove(this.users, e);
		if (e.isPIC) {
			this.checkValidPassenger = false;
			this.selectedPIC = this.users[0];
		}
	}

	decisionIsEligibility(userId) {
		let isEli = null;
		if (this.users.length > 1) {
			let isEliMulti = null;
			let findEli = _.find(this.users, { UserId: this.selectedPicVehicleType });
			isEliMulti = this.selectedPICAutoComplete;
			if (findEli != undefined) {
				isEliMulti = this.selectedPicVehicleType;
			}
			isEli = isEliMulti;
		} else {
			isEli = userId;
		}
		return isEli == userId ? 1 : 0;
	}

	private fillCostCenter = [];
	checkBudget() {
		//get and filter cost center
		let tmpCost = [];
		_.map(this.obJschemeOrder.ReservationDetail, x => {
			tmpCost.push(x.CostCenterId);
		});
		//remove duplicate cost center
		this.fillCostCenter = _.uniqBy(tmpCost);
		if (this.fillCostCenter.length) {
			this.getBudget();
		}
	}

	public currentBudget = [];
	public loadingBudget: Boolean = false;
	private iBudget = 0;
	private tmpError = [];
	private budgetType = null;
	getBudget() {
		let nowDate = moment().format('YYYY-MM-DD HH:mm');
		this.loadingBudget = true;
		let obj = {
			CostCenterId: this.fillCostCenter
		};
		this.userManagemenetService.getBudgetSingle(this.selectedCustomer, obj).subscribe(
			res => {
				if (res.Data.length != 0) {
					this.budgetType = res.Data[0].PaymentSchemeId;
					this.loadingBudget = false;
					let data = res.Data[0];
					if (data.PaymentSchemeId == 'PS0002') {
						if (res.Data[0].details.length != 0) {
							let detail = data.details;
							this.currentBudget = [];
							_.map(detail, val => {
								let obj = {
									CostCenterId: val.CostCenterId,
									InitialBudget: val.InitialBudget,
									LimitBudget: val.LimitBudget,
									CurrentBudget: val.CurrentBudget
								};
								this.currentBudget.push(obj);
							});
						} else {
							this.msgs = [];
							this.msgs.push({
								severity: 'warn',
								summary: 'Budget',
								detail: `You have not configured the budget!`
							});
						}
					}
				}
				this.iBudget = 0;
				this.tmpError = [];

				_.map(this.currentBudget, x => {
					let objOrder = _.filter(this.obJschemeOrder.ReservationDetail, val => val.CostCenterId == x.CostCenterId);
					let OrderBudget = _.sumBy(objOrder, v => {
						return v.PriceCalc;
					});
					if (x.CurrentBudget - OrderBudget < x.LimitBudget) {
						this.tmpError.push(objOrder[0].CostCenterName);
					} else {
						this.iBudget++;
					}
				});
				//check order is over date
				let isOverDate = 0;
				_.map(this.obJschemeOrder.ReservationDetail, x => {
					if (moment(nowDate).isBefore(x.StartDate[0])) {
						isOverDate++;
					}
				});

				setTimeout(() => {
					if (isOverDate == this.obJschemeOrder.ReservationDetail.length) {
						if (this.budgetType == 'PS0002') {
							if (this.tmpError.length) {
								this.msgs = [];
								this.msgs.push({
									severity: 'error',
									summary: 'Budget Limit',
									detail: `You can not process this order because the initial budget of cost center ${this.tmpError.join(
										', '
									)} are insufficient`
								});
							}
							if (this.iBudget == this.fillCostCenter.length) {
								this.continueOrder();
								this.runProgress();
							}
						} else {
							this.continueOrder();
							this.runProgress();
						}
					} else {
						this.submitOrder = false;
						this.msgs = [];
						this.msgs.push({
							severity: 'error',
							summary: 'Expired Date',
							detail: 'One ordered out of date, please remove and create new order'
						});
					}
				}, 200);
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.checkBudget();
					});
				}
			}
		);
	}

	private Passengers = [];
	createObjPessenger() {
		this.Passengers = [];
		_.map(this.users, x => {
			let obj = {
				Name: x.PICName,
				PhoneNumber: x.phone,
				Email: x.email,
				UserId: x.UserId,
				IsEligibility: this.decisionIsEligibility(x.UserId),
				IsPIC: x.UserId == this.selectedPICAutoComplete
			};
			this.Passengers.push(obj);
		});
	}

	// Continue Order
	// ========================= //
	public submitOrder: boolean = false;
	private resqIndex = 0;
	private index = 0;
	private statusIndex = 0;
	public progressValue = 0;
	continueOrder() {
		let originObj = this.obJschemeOrder;
		let tmpCount = [];
		let ReservationAdditional = [];

		_.map(originObj.ReservationDetail, x => {
			_.map(x.arrContract, y => {
				let obj = {
					QuantityTrip: y.tripQuantity,
					PriceTrip: y.AdditionalPrice.Trip,
					QuantityOLC: y.olcQuantity,
					PriceOLC: y.AdditionalPrice.Olc,
					Date: y.dateTime,
					VehicleType: x.UnitTypeId
				};
				ReservationAdditional.push(obj);
			});
		});

		let getPackage = null;
		this.statusIndex = 0;
		this.index = 0;
		this.submitOrder = true;
		_.map(this.obJschemeOrder.ReservationDetail, x => {
			getPackage = _.find(x.packages, { value: x.packageSelected });

			// Set Pickup
			let PickupLocation = [];
			_.map(x.PickupLocation, y => {
				let PickupObj = {
					CityId: y.CityId,
					Long: y.Long.toString(),
					Lat: y.Lat.toString(),
					Alamat: y.Alamat,
					Time: '',
					Notes: y.Notes
				};
				PickupLocation.push(PickupObj);
			});

			// Set Droplocation
			let DropLocation = [];
			_.map(x.PickupLocation, y => {
				let DropObj = {
					CityId: y.CityId,
					Long: y.Long.toString(),
					Lat: y.Lat.toString(),
					Alamat: y.Alamat,
					Time: '',
					Notes: y.DestinationNotes
				};
				DropLocation.push(DropObj);
			});

			// Set Passengger
			let Passenger = [];
			_.map(x.Passengers, y => {
				let objPasennger = {
					Name: y.Name,
					PhoneNumber: y.PhoneNumber,
					Email: y.Email,
					IsEligibility: y.IsEligibility,
					IsPIC: y.IsPIC
				};
				Passenger.push(objPasennger);
			});

			let ReservationDetail = [];
			let objReservationDetail = {
				StatusOrder: null,
				UserId: x.UserId,
				UnitTypeId: x.UnitTypeId,
				UnitTypeName: x.UnitTypeName,
				VehicleCapacity: x.VehicleCapacity,
				CityId: x.CityId,
				CityName: x.CityName,
				BranchId: x.BranchId,
				StartDate: x.StartDate,
				Duration: x.Duration,
				QtyUnit: x.QtyUnit,
				DriverSpesification: x.DriverSpesification,
				QtyPassenger: x.QtyPassenger,
				IsStay: x.IsStay,
				OutTown: x.OutTown,
				IsPlanned: x.IsPlanned,
				//IsPriority: x.IsPriority, take out for a while
				PoolId: x.PoolId,
				IsJoinOrderAllowed: x.IsJoinOrderAllowed,
				IsExpedition: x.IsExpedition,
				IsWithDriver: x.IsWithDriver,
				Fuel: getPackage.FuelId,
				TollAndParking: getPackage.TollandParkingId,
				DriverOrRider: getPackage.DriverorRiderId,
				CostCenterId: x.CostCenterId,
				CostCenterName: x.CostCenterName,
				IsPaymentUpfront: x.IsPaymentUpfront,
				ContractId: x.ContractId,
				ContractItemId: x.ContractItemId,
				ProductId: x.ProductId,
				MaterialId: x.MaterialId,
				ExternalOrderReferenceNumber: x.ExternalOrderReferenceNumber,
				LicensePlate: x.LicensePlate,
				Price: x.PriceCalc,
				PickupLocation: PickupLocation,
				DropLocation: DropLocation,
				Passengers: Passenger,
				MaterialSAPCode: x.MaterialSAPCode,
				ContractSAPCode: x.ContractSAPCode,
				ContractLineItemSAP: x.ContractLineItemSAP
			};
			ReservationDetail.push(objReservationDetail);

			let PODate;
			if (_.isEmpty(this.PONumber)) {
				PODate = '';
			} else {
				PODate = moment(this.PODate).format('YYYY-MM-DD');
			}

			_.map(ReservationDetail, (val, i) => {
				let objOrder = {
					PONumber: this.PONumber,
					PONumber2: this.PONumber2,
					PODate: PODate,
					CustomerId: originObj.CustomerId,
					CustomerName: originObj.CustomerName,
					CompanyId: originObj.CompanyId,
					BusinessUnitId: originObj.BusinessUnitId,
					ChannelId: getPackage.ChannelTypeId,
					ServiceTypeId: originObj.ServiceType,
					ServiceTypeName: originObj.ServiceTypeName,
					CreatedBy: val.UserId,
					PIC: val.UserId,
					CostCenterId: val.CostCenterId,
					CostCenterName: val.CostCenterName,
					TotalPrice: val.Price,
					OrganizationId: originObj.OrganizationId,
					ReservationAdditional: ReservationAdditional,
					ReservationDetail: [val]
				};
				tmpCount.push(objOrder);
				let percentage = 100 / tmpCount.length;

				if (i > this.resqIndex) {
					this.obJschemeOrder.ReservationDetail[i].statusProcess = 'wait';
				}

				// check start date time is valid
				let orderMaxTime = x.arrTime[0].maxTime;
				let maxTime = orderMaxTime.split(':');
				let maxTimes = parseInt(maxTime[0]) * 60 + parseInt(maxTime[1]);
				let startDateOrder = moment(val.StartDate[0]).format('YYYY-MM-DD HH:mm');
				let timeDiff = moment(startDateOrder).diff(moment(), 'minutes');
				//check diff date
				if (timeDiff != undefined) {
					if (timeDiff < maxTimes) {
						this.submitOrder = false;
						if (this.obJschemeOrder.ReservationDetail[this.statusIndex].StatusOrder != 'success') {
							this.obJschemeOrder.ReservationDetail[this.statusIndex].StatusOrder = 'error';
							this.obJschemeOrder.ReservationDetail[this.statusIndex].statusProcess = 'error';
						}
					} else {
						this.obJschemeOrder.ReservationDetail[this.statusIndex].StatusOrder = 'success';
						this.index++;
					}
					this.statusIndex++;
				}
				//if check start date is complete
				setTimeout(() => {
					if (this.index == tmpCount.length) {
						if (this.obJschemeOrder.ReservationDetail[this.resqIndex] != undefined) {
							this.obJschemeOrder.ReservationDetail[this.resqIndex].statusProcess = 'process';
						}
						if (i == this.resqIndex && this.resqIndex <= tmpCount.length) {
							if (this.obJschemeOrder.ReservationDetail[i].statusProcess != 'success') {
								this.orderService.postReservation(objOrder).then(
									res => {
										if (this.progressValue <= 100) {
											let count = i + 1;
											this.progressValue = percentage * count;
										}
										this.obJschemeOrder.ReservationDetail[i].statusProcess = 'success';
										this.resqIndex++;
										this.continueOrder();

										setTimeout(() => {
											if (this.resqIndex == tmpCount.length) {
												this.submitOrder = false;
												this.clearOrder();
												this.clearFormOrder();
												this.readOrder();
												this.resqIndex = 0;
												this.index = 0;
												this.progressValue = 0;
												this.msgs = [];
												this.msgs.push({
													severity: 'success',
													summary: 'Success',
													detail: 'Success'
												});

												let dataUser = JSON.parse(this.mainService['dataUser']);
												if (dataUser.UserIndicator[0].RoleIndicatorId != 'MRI003') {
													this.disableCustomer = false;
													this.disablePic = false;
												}
											}
										}, 2000);
									},
									err => {
										if (err.status == 401) {
											this.mainService.updateToken(() => {
												this.continueOrder();
											});
										}
										this.obJschemeOrder.ReservationDetail[i].statusProcess = 'error';
										this.submitOrder = false;
										this.msgs = [];
										this.msgs.push({
											severity: 'error',
											summary: 'Failed',
											detail: JSON.parse(err['_body']).ErrorMessage
										});
									}
								);
							}
						}
					}
				}, 500);
			});
		});
	}
	runProgress() {
		this.progressValue = 1;
		setInterval(() => {
			this.progressValue = this.progressValue + Math.floor(Math.random() * 2) + 0.5;
			if (this.progressValue >= 99) {
				this.progressValue = 99;
			}
		}, 3000);
	}
}
