sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "com/lab2dev/browseordersprodev/model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel,Filter, FilterOperator, formatter) {
        "use strict";
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.Home", {
            formatter: formatter,
            onInit: function () {
                this.oRouter = this.getOwnerComponent().getRouter();

                const orders = models.getAllOrders();

                orders
                    .then((aOrder) => {
                        const oModel = new JSONModel({
                            Orders: aOrder,
                            count: this._countItems(aOrder)
                        }) 
                        this.getView().setModel(oModel)
                    })
                    .catch((sError) => {
                        console.log("Error getOrder" + sError)
                    })
            },
            onNavToOrderDetails: function(oEvent){
                const sOrderPath = oEvent.getSource().getBindingContextPath().split(/[a-z-(-)-/]/gi).filter(el => el != "")
                
                const orderID = this.getView().getModel().getData().Orders[sOrderPath].OrderID

                this.oRouter.navTo("OrderDetail", {orderID, query: {tab: "shipping"}})
            },
            onSearch: function(oEvent){
                const aFilters = []
                const sQuery = oEvent.getParameter("newValue")

                if(sQuery && sQuery.length > 0){
                    const filter = new Filter({
                        filters: [
                            new Filter("ShipName", FilterOperator.Contains, sQuery),
                            new Filter("OrderID", FilterOperator.EQ, sQuery)
                        ]
                    })
                    aFilters.push(filter)
                }

                const oList = this.byId("OrdersTable")
                const oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, "Application")
            },
            _countItems(aOrders){
                
                return aOrders.length
            },
            

        });
    });
