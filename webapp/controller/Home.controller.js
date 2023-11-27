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
        
        return Controller.extend("com.lab2dev.browseordersprodev.controller.Home", {
            formatter: formatter,
            onInit: function () {
               const orders = models.getAllOrders();

               orders
                    .then(function(aOrder) {
                        const oModel = new JSONModel({
                            Orders: aOrder
                        }) 
                        this.getView().setModel(oModel)
                    })
                    .catch((sError) => {
                        console.error("Error getOrder" + sError)
                    })
            }
        });
    });
