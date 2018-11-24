var app = angular.module("k8s", []);

app.controller("podview", function($scope, $http) {
    $scope.nodes = {};
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
