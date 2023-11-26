sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "com/lab2dev/browseordersprodev/model/models"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, models) {
        "use strict";

        return Controller.extend("com.lab2dev.browseordersprodev.controller.Home", {
            onInit: async function () {
                const getOrderData = await models.allOrders();

            }
        });
    });
