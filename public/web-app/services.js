
angular.module('analytics').factory("TimelineService", function ($http, $q) {
    var date = {
        from: "",
        to: ""
    };
    var period = "week";
    var range = 7;
    var isReady = false;
    var lastChange;

    function retrieve(startTime, endTime, selectedLocations) {
        var canceller = $q.defer();
        var request = $http({
            url: '/api/timeline/',
            method: "GET",
            params: {
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                locations: selectedLocations
            },
            timeout: canceller.promise
        });
        return httpReq(request);
    };


    function httpReq(request) {
        isReady = false
        var promise = request.then(
            function (response) {
                isReady = true;
                lastChange = new Date().valueOf();
                return response;
            },
            function (response) {
                return { error: response.data };
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
        timeline: {
            retrieve: retrieve,
            isReady: function () { return isReady },
            lastChange: function () { return lastChange }
        },
        date: {
            get: function () { return date },
            set: function (new_date) { date = new_date },
            isReady: function () { return date.from != "" && date.to != "" }
        },
        period: {
            get: function () { return period },
            set: function (new_period) { period = new_period }
        },
        range: {
            get: function () { return range },
            set: function (new_range) { date = new_range }
        },
    }
});

angular.module('analytics').factory("LocationsService", function ($http, $q, $rootScope) {
    var selected = [];
    var checked = [];
    var locations = {};
    var filter = "GENERIC";
    var compareLocations = false;
    var isReady = false;

    function addParentRef(folder, parentId) {
        folder.parentId = parentId;
        if (folder.folders.length > 0) {
            for (var i in folder.folders) {
                if (folder.folders[i].folders) folder.folders[i] = addParentRef(folder.folders[i], folder.id);
            }
        }
        return folder;
    }
    function retrieve() {
        var canceller = $q.defer();
        var request = $http({
            method: 'GET',
            url: '/api/apLocationFolders',
            timeout: canceller.promise
        });
        return httpReq(request);
    };

    function httpReq(request) {
        isReady = false;
        var promise = request.then(
            function (response) {
                locations = addParentRef(response.data, null);
                isReady = true;
                return locations;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('apiError', response.data.error);
                    return ($q.reject(response.data.error));
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

    function addToArray(array, val) {
        if (array.indexOf(val) < 0) array.push(val);
        return array;
    }
    function delFromArray(array, val) {
        if (array.indexOf(val) > -1) array.splice(array.indexOf(val), 1);
        return array;
    }

    function selected_refresh(item) {
        if (checked.indexOf(item.id) > -1) selected.push(item.id);
        else if (item.folders.length > 0)
            item.folders.forEach(function (folder) {
                selected_refresh(folder);
            })
    }

    function locations_search(item, itemId) {
        if (item.id == itemId) {
            return item;
        } else if (item.folders != null) {
            var i;
            var result = null;
            for (i = 0; result == null && i < item.folders.length; i++) {
                result = locations_search(item.folders[i], itemId);
            }
            return result;
        }
        return null;
    }

    return {
        reset: function () { selected = []; checked = []; },
        selected: {
            reset: function () { selected = [] },
            refresh: function () { selected = []; selected_refresh(locations) },
            get: function () { return selected },
            set: function (val) { selected = val },
            add: function (val) { selected = addToArray(selected, val); },
            del: function (val) { selected = delFromArray(selected, val); }
        },
        checked: {
            reset: function () { checked = [] },
            get: function () { return checked },
            set: function (val) { checked = val },
            add: function (val) { checked = addToArray(checked, val); },
            del: function (val) { checked = delFromArray(checked, val); }
        },
        filter: {
            get: function () { return filter },
            set: function (val) { filter = val }
        },
        locations: {
            get: function () { return locations },
            retrieve: retrieve,
            search: function (itemId) { return locations_search(locations, itemId); },
            isReady: function () { return isReady }
        },
        compareLocations: {
            get: function () { return compareLocations },
            set: function (val) { compareLocations = val }
        }
    }
});

