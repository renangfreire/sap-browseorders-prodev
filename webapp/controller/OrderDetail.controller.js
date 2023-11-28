sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models",
    "sap/ui/model/json/JSONModel",
    "com/lab2dev/browseordersprodev/model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models, JSONModel, formatter) {
        "use strict";
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.OrderDetail", {
            formatter: formatter,
            onInit: function () {

                const oRouter = this.getOwnerComponent().getRouter()

                oRouter.getRoute("OrderDetail").attachPatternMatched(this._onRouteMatched, this)

                
            },
            _onRouteMatched: function(oEvent){
                const orderID = oEvent.getParameter("arguments").orderID

                const orders = models.getOrderData(orderID);

                orders
                    .then((oOrder) => {
                        const oModel = new JSONModel(oOrder) 

                        console.log(oModel)

                        this.getView().setModel(oModel)
                    })
                    .catch((sError) => {
                        console.log("Error getOrder" + sError)
                    })

            }
        });
    });
