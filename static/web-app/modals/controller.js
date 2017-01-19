angular.module('Modals').controller('ModalCtrl', function ($scope, $rootScope, $mdDialog) {
    $rootScope.displayed = false;
    $scope.$on('apiError', function (event, apiError) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'modals/modalErrorContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiErrorStatus: apiError.status,
                        apiErrorMessage: apiError.message,
                        apiErrorCode: apiError.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('serverError', function (event, serverError) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'modals/modalServerErrorContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        errorStatus: serverError.status,
                        errorMessage: serverError.data
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('apiWarning', function (event, apiWarning) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'modals/modalWarningContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiWarningStatus: apiWarning.status,
                        apiWarningMessage: apiWarning.message,
                        apiWarningCode: apiWarning.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('createSingle', function (event, user, account) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogSingleController',
                templateUrl: 'modals/modalSingleContent.html',
                locals: {
                    items: {
                        user: user,
                        account: account
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('renewSingleUser', function (event, user, account) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'RenewSingleUserController',
                templateUrl: 'modals/modalRenewSingleUserContent.html',
                locals: {
                    items: {
                        user: user,
                        account: account
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });

    $scope.open = function (template, items) {
        var modalTemplateUrl = "";
        var controller = "";
        switch (template) {
            case 'about':
                controller = "DialogController";
                modalTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                controller = 'DialogExportController';
                modalTemplateUrl = 'modals/modalExportContent.html';
                break;
            case 'exportBulk':
                controller = "DialogExportController";
                modalTemplateUrl = 'modals/modalBulkContent.html';
                break;
        }
        $mdDialog.show({
            controller: controller,
            templateUrl: modalTemplateUrl,
            escapeToClose: false,
            locals: {
                items: items
            }
        });
    };
});


angular.module('Modals').controller('DialogController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.items = items;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});
angular.module('Modals').controller('DialogConfirmController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.userName = items.userName;
    $scope.numberOfAccounts = items.numberOfAccounts;
    $scope.action = items.action;
    $scope.cancel = function () {
        $mdDialog.cancel()
    };
    $scope.confirm = function () {
        $mdDialog.hide();
    }
});
angular.module('Modals').controller('DialogSingleController', function ($scope, $rootScope, $mdDialog, items, createService) {
    $scope.hmngType = $rootScope.hmngType;
    // items is injected in the controller, not its scope!
    $scope.user = items.user;
    $scope.account = items.account;

    if (!$scope.account) {
        createService.saveUser($scope.user).then(function (promise) {
            if (promise && promise.error) {
                $mdDialog.hide();
                $rootScope.displayed = false;
                $rootScope.$broadcast("apiWarning", promise.error);
            } else {
                $scope.account = promise;
            }
        });
    }

    $scope.isPPSK = function(){
        return $scope.account.authType === "PPSK";
    };

    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.sendBySms = function () {
        $mdDialog.show({
            controller: 'DialogSendBySmsController',
            templateUrl: 'modals/modalSendBySmsContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account,
                    backModal: "createSingle"
                }
            }
        });
    };
    $scope.sendByEmail = function () {
        $mdDialog.show({
            controller: 'DialogSendByEmailController',
            templateUrl: 'modals/modalSendByEmailContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account,
                    backModal: "createSingle"
                }
            }
        });
    };
    $scope.qrcode = function () {
        $mdDialog.show({
            controller: 'DialogQrCodeController',
            templateUrl: 'modals/modalQrCodeContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account
                }
            }
        });
    };
    $scope.iOSProfile = function () {
        $mdDialog.show({
            controller: 'DialogSendIosProfileController',
            templateUrl: 'modals/modalSendIosProfileContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account
                }
            }
        });
    }
});

angular.module("Modals").controller("DialogSendByEmailController", function ($scope, $rootScope, $mdDialog, sendCredentialsService, items) {
    $scope.backModal = items.backModal;
    if (items.user){
        $scope.email = items.user.email;
        $scope.user = items.user;
    } else {
        $scope.email = items.account.email;
        $scope.user = items.account;
    }
    $scope.account = items.account;
    $scope.isWorking = false;
    $scope.success = false;
    $scope.failed = false;

    $scope.sendByEmail = function () {
        $scope.isWorking = true;
        sendCredentialsService.deliver(items.account.id, "EMAIL", $scope.email, null).then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) $scope.failed = promise.error;
            else $scope.success = true;
        });
    };
    $scope.back = function () {
        $rootScope.$broadcast(items.backModal, items.user, items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module("Modals").controller("DialogSendIosProfileController", function ($scope, $rootScope, $mdDialog, iOSProfileService, items) {
    $scope.email = items.user.email;
    $scope.user = items.user;
    $scope.account = items.account;
    $scope.isWorking = false;
    $scope.success = false;

    $scope.sendIosProfile = function () {
        $scope.isWorking = true;
        iOSProfileService.sendProfile(items.account.loginName, items.account.activeTime, items.account.ssid, items.account.password, $scope.email).then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) $rootScope.$broadcast("apiWarning", promise.error);
            else $scope.success = true;
        });
    };
    $scope.$watch("email", function () {
        $scope.success = false;
    });
    $scope.back = function () {
        $rootScope.$broadcast('createSingle', items.user, items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module("Modals").controller("DialogSendBySmsController", function ($scope, $rootScope, $mdDialog, sendCredentialsService, items) {
    $scope.backModal = items.backModal;
    if (items.user){
        $scope.email = items.user.phone;
        $scope.user = items.user;
    } else {
        $scope.email = items.account.phone;
        $scope.user = items.account;
    }
    $scope.account = items.account;
    $scope.isWorking = false;
    $scope.success = false;
    $scope.failed = false;

    $scope.sendBySms = function () {
        sendCredentialsService.deliver(items.account.id, "SMS", null, $scope.phone).then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) $scope.failed = promise.error;
            else $scope.success = true;
        });
    };
    $scope.back = function () {
        $rootScope.$broadcast(items.backModal, items.user, items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module('Modals').controller('DialogQrCodeController', function ($scope, $rootScope, $mdDialog, $interval, connectionStatusService, items) {
    // items is injected in the controller, not its scope!
    $scope.user = items.user;
    $scope.account = items.account;

    $scope.connectionStatus = {
        connected: false,
        os: "N/A",
        ssid: "N/A",
        radioHealth: "N/A",
        networkHealth: "N/A",
        applicationHealth: "N/A",
        hostName: "N/A",
        ip: "N/A",
        userProfile: "N/A",
        clientMac: "N/A",
        radioBand: "N/A",
        clientProtocol: "N/A"
    };
    $scope.clientConnected = false;
    var waitingForResponse = false;
    $scope.qrcodeString = "WIFI:S:" + $scope.account.ssid + ";T:WPA;P:" + $scope.account.password + ";;";
    /**
     * Loads and populates the notifications
     */

    this.checkConnection = function (userName) {
        waitingForResponse = true;
        connectionStatusService.getStatus(userName).then(function (promise) {
            waitingForResponse = false;
            if (promise && promise.error) $rootScope.$broadcast("apiWarning", promise.error);
            else {
                $scope.connectionStatus = promise.data;
                if ($scope.connectionStatus.connected) $interval.cancel(checkStatus);
                $scope.clientConnected = $scope.connectionStatus.connected;
            }

        });
    };
    //Put in interval, first trigger after 10 seconds
    var checkStatus = $interval(function () {
        if (!waitingForResponse) {
            this.checkConnection($scope.account.loginName);
        }
    }.bind(this), 1000);

    $scope.userString = function (userName, isConnected) {
        if (isConnected) return userName + " is currently not connected.";
        else return userName + " is currently connected.";
    };
    $scope.userColor = function (isConnected) {
        if (isConnected) return "color: #75D064";
        else return "color: #aca5a3";
    };
    $scope.healthColor = function (healthScore) {
        if (healthScore == 100) return "color: #75D064";
        else if (healthScore >= 50) return "color: #FFCF5C";
        else return "color: #d04d49";
    };

    $scope.back = function () {
        $interval.cancel(checkStatus);
        $rootScope.$broadcast('createSingle', items.user, items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $interval.cancel(checkStatus);
        $mdDialog.hide();
    };
});

angular.module('Modals').controller('DialogExportController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.credentials = items.credentials;
    $scope.exportFields = items.exportFields;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.getExportHeader = function () {
        var header = [];
        $scope.exportFields.forEach(function (field) {
            if (field.selected) header.push(field.name);
        });
        header[0] = '#' + header[0];
        return header;
    };
    $scope.export = function () {
        if ($scope.credentials) {
            var exportData = [];
            $scope.credentials.forEach(function (credential) {
                var user = {};
                $scope.exportFields.forEach(function (field) {
                    if (field.selected) user[field.name] = credential[field.name];
                });
                exportData.push(user);
            });
            return exportData;
        }
    };


    $scope.getExportHeaderBulk = function () {
        $scope.exportFields[0] = '#' + $scope.exportFields[0];
        return $scope.exportFields;
    };
    $scope.exportBulk = function () {
        if ($scope.credentials) {
            return $scope.credentials;
        }
    };
});



angular.module('Modals').controller('RenewSingleUserController', function ($scope, $rootScope, $mdDialog, renewUserService, items) {
    $scope.hmngType = $rootScope.hmngType;

    $scope.user = items.user;

    $scope.success = false;
    $scope.failed = false;
    $scope.activeTime = "";
    $scope.expireTime = "";

    if (!items.account) {
        $scope.account = {
            loginName : $scope.user.userName,
            id: $scope.user.id
        };
        $scope.isWorking = true;
        var renewCredential = renewUserService.renewCredentials($scope.user.id);
        renewCredential.then(function (promise) {
            $scope.isWorking = false;
            if (promise && promise.error) $scope.failed = promise.error;
            else {
                $scope.success = true;
                $scope.activeTime = promise.data.activeTime;
                $scope.expireTime = promise.data.expireTime;

            }
        });
    } else {
        $scope.success = true;
        $scope.account = {
            loginName : $scope.user.userName,
            id: $scope.user.id
        };
    }


    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.sendBySms = function () {
        $mdDialog.show({
            controller: 'DialogSendBySmsController',
            templateUrl: 'modals/modalSendBySmsContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account,
                    backModal: "renewSingleUser"
                }
            }
        });
    };
    $scope.sendByEmail = function () {
        $mdDialog.show({
            controller: 'DialogSendByEmailController',
            templateUrl: 'modals/modalSendByEmailContent.html',
            locals: {
                items: {
                    user: $scope.user,
                    account: $scope.account,
                    backModal: "renewSingleUser"
                }
            }
        });
    };
});