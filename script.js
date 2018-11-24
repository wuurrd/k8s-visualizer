var app = angular.module("k8s", []);

app.controller("podview", function($scope, $http) {
    $scope.nodes = {};
    $scope.total_mem = 16;
    $scope.total_cpu = 4;

    $scope.getMemUsage = function(req) {
        if (req == undefined) {
            req = "128M";
        }
        if (req.endsWith('M')) {
            req = req.replace('M', '');
            req = req / 1000;
        } else if (req.endsWith('Ki')) {
            req = req.replace('Ki', '');
            req = req / 1024 / 1024;
        } else if (req.endsWith('Mi')) {
            req = req.replace('Mi', '');
            req = req / 1024;
        } else if (req.endsWith('Mi')) {
            req = req.replace('Mi', '');
            req = req / 1024;
        } else if (req.endsWith('Gi')) {
            req = req.replace('Gi', '');
            req = req / 1024 * 1000;
        }
        return parseFloat(req);
    };

    $scope.calculateMemWidth = function(req) {
        req = $scope.getMemUsage(req);
        var count = 100*req / $scope.total_mem;
        return count+'%';
    };

    $scope.getCpuUsage = function(req) {
        if (req === undefined) {
            req = "100m";
        }
        if (req.endsWith('m')) {
            req = req.replace('m', '');
            req = req / 1024;
        }
        return parseFloat(req);
    };

    $scope.calculateCpuWidth = function(req) {
        req = $scope.getCpuUsage(req);
        var count = 100*req / $scope.total_cpu;
        return count+'%';
    };

    $scope.cpuUsage = function(pods, key) {
        var cpuUsage = 0;
        angular.forEach(pods, function(pod) {
            var requests = pod.spec.containers[pod.spec.containers.length-1].resources[key];
            if (requests == undefined) {
                requests = {};
            }
            cpuUsage += $scope.getCpuUsage(requests.cpu);
        });
        console.log(cpuUsage);
        return (100 * cpuUsage / $scope.total_cpu) + "%";
    };

    $scope.memUsage = function(pods, key) {
        var memUsage = 0;
        angular.forEach(pods, function(pod) {
            var requests = pod.spec.containers[pod.spec.containers.length-1].resources[key];
            if (requests == undefined) {
                requests = {};
            }
            memUsage += $scope.getMemUsage(requests.memory);
            console.log(memUsage);            
        });
        console.log(memUsage);
        return (100 * memUsage / $scope.total_mem) + "%";
    };

    var pods = $http.get('/api/v1/pods').then(function(data){
        angular.forEach(data.data.items, function(item){
            if (item.status.phase !== "Running") {
                return;
            }
            if (item.metadata.namespace !== "default") {
                return;
            }
            var host = item.status.hostIP;
            if ($scope.nodes[host] === undefined) {
                $scope.nodes[host] = [];
            }
            $scope.nodes[host].push(item);
        });
    });
});
