angular.module("CustomFilters", []);
angular.module('Monitor', []);
angular.module('Credentials', []);
angular.module("Create", []);
angular.module("Import", []);
angular.module("Modals", []);
var identity = angular.module("identity", [
    "ngRoute",
    'ui.bootstrap',
    'ngSanitize',
    'ngCsv',
    'ngMaterial',
    'ngMessages',
    'md.data.table',
    'CustomFilters',
    'Monitor',
    'Credentials',
    'Create',
    'Import',
    'Modals',
    'monospaced.qrcode',
    'ngIntlTelInput',
    'pascalprecht.translate'
]);

identity
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue", {
                'default': '600'
            })
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    }).config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }]).config(function (ngIntlTelInputProvider) {
        ngIntlTelInputProvider.set({
            defaultCountry: 'fr',
            preferredCountries: ["al", "ad", "at", "by", "be", "ba", "bg", "hr", "cz", "dk",
                "ee", "fo", "fi", "fr", "de", "gi", "gr", "va", "hu", "is", "ie", "it", "lv",
                "li", "lt", "lu", "mk", "mt", "md", "mc", "me", "nl", "no", "pl", "pt", "ro",
                "ru", "sm", "rs", "sk", "si", "es", "se", "ch", "ua", "gb"]
        });
    }).config(function ($translateProvider) {
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider
            .translations('en', en)
            .translations('fr', fr)
            .registerAvailableLanguageKeys(['en', 'fr'], {
                'en_*': 'en',
                'fr_*': 'fr',
                '*': 'en'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .usePostCompiling(true)
            .useSanitizeValueStrategy("escapeParameters");

    });


identity.factory("userTypesService", function () {
    var userTypes = [
        {name: "CLOUD_PPSK", selected: false},
        {name: "CLOUD_RADIUS", selected: false}
    ];
    return {
        getUserTypes: function () {
            return userTypes;
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userTypes.forEach(function (userType) {
                if (userType.selected) arrayForRequest.push(userType.name);
            });
            if (arrayForRequest.length === userTypes.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("userGroupsService", function ($http, $q, $rootScope) {
    var enableEmailApproval;
    var userGroups = [];
    var isLoaded = false;
    var promise = null;


    function getUserGroups() {
        isLoaded = false;
        if (promise) promise.abort();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/userGroup",
            method: "POST",
            timeout: canceller.promise
        });

        promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    userGroups = [];
                    enableEmailApproval = response.data.enableEmailApproval;
                    response.data.userGroups.forEach(function (group) {
                        group["selected"] = false;
                        userGroups.push(group);
                    });
                    isLoaded = true;
                    return {userGroups: userGroups, reqId: response.data.reqId};
                }
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        getUserGroups: getUserGroups,
        getEmailApprouval: function () {
            return enableEmailApproval;
        },
        getUserGroupName: function (groupId) {
            var groupName = "";
            userGroups.forEach(function (group) {
                if (group.id === groupId) groupName = group.name;
            });
            return groupName;
        },
        isLoaded: function () {
            return isLoaded;
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userGroups.forEach(function (userGroup) {
                if (userGroup.selected) arrayForRequest.push(userGroup.id);
            });
            if (arrayForRequest.length === userGroups.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("exportService", function () {
    var exportFields = [
        {name: 'userName', selected: true, display: "User Name"},
        {name: 'email', selected: true, display: "Email"},
        {name: 'phone', selected: true, display: "Phone"},
        {name: 'organization', selected: true, display: "Organization"},
        {name: 'groupId', selected: true, display: "Group ID"},
        {name: 'groupName', selected: true, display: "Group Name"},
        {name: 'credentialType', selected: true, display: "Credential Type"},
        {name: 'createTime', selected: true, display: "Create Time"},
        {name: 'activeTime', selected: true, display: "Active Time"},
        {name: 'expireTime', selected: true, display: "Expire Time"},
        {name: 'lifeTime', selected: true, display: "Life Time"},
        {name: 'ssids', selected: true, display: "SSIDs"},
        {name: 'visitPurpose', selected: true, display: "Visit Purpose"}
    ];
    return {
        getFields: function () {
            return exportFields;
        }
    }
});


identity.controller("UserCtrl", function ($scope, $rootScope, $mdDialog, $mdSidenav, $location, $translate) {
    var originatorEv;
    $rootScope.hmngType = $scope.hmngType;
    
    this.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };
    this.sideNav = function (id) {
        $mdSidenav(id).toggle()
    };
    this.showFab = function () {
        var haveFab = ["/monitor", "/credentials"];
        return (haveFab.indexOf($location.path().toString()) > -1);
    };
    this.translate = function (langKey){
        $translate.use(langKey);
    }
});

identity.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[1]) return true;
        else return false;
    };
    $scope.subnav = {};
    $scope.subnav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[2]) return true;
        else return false;
    };

});
identity.directive('fileChange', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function ($scope, element, attrs, ngModel) {
            var attrHandler = $parse(attrs['fileChange']);
            var handler = function (e) {
                $scope.$apply(function () {
                    attrHandler($scope, {$event: e, files: e.target.files});
                });
            };
            element[0].addEventListener('change', handler, false);
        }
    }
}]);

