var myApp = angular.module("myApp", ["ngRoute", "ngResource", "myApp.services"]);

var services = angular.module("myApp.services", ["ngResource"])
services
.factory('Beer', function($resource) {
    return $resource('http://localhost:5000/api/v1/beers/:id', {id: '@id'}, {
        get: { method: 'GET' },
        delete: { method: 'DELETE' }
    });
})
.factory('Beers', function($resource) {
    return $resource('http://localhost:5000/api/v1/beers', {}, {
        query: { method: 'GET', isArray: true },
        create: { method: 'POST', }
    });
})
.factory('Styles', function($resource) {
    return $resource('http://localhost:5000/api/v1/styles/:id', {id: '@id'}, {
        get: { method: 'GET' }
    });
})
.factory('Style', function($resource) {
    return $resource('http://localhost:5000/api/v1/styles', {}, {
        query: { method: 'GET', isArray: true}
    });
})
.factory('Search', function($resource) {
    return $resource('http://localhost:5000/api/v1/search', {q: '@q'}, {
        query: { method: 'GET', isArray: true}
    });
});

myApp.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'pages/main.html',
        controller: 'mainController'
    })
    .when('/newBeer', {
        templateUrl: 'pages/beer_new.html',
        controller: 'newBeerController'
    })
    .when('/beers', {
        templateUrl: 'pages/beers.html',
        controller: 'beerListController'
    })
    .when('/beers/:id', {
        templateUrl: 'pages/beer_details.html',
        controller: 'beerDetailsController'
    })
});

myApp.filter('filterStyles', function() {
  return function(input) {
    var output = new Array();
    for (i=0; i<input.length; i++) {
        if (input[i].checked == true) {
            output.push(input[i].name);
        }
    }
    return output;
  }
});

myApp.controller(
    'mainController',
    function ($scope, Search) {
        $scope.search = function() {
            q = $scope.searchString;
            if (q.length > 1) {
                $scope.results = Search.query({q: q});    
            }
        };
    }
);

myApp.controller(
    'newBeerController',
    function ($scope, Styles, Beers, $location, $timeout, $filter) {
        $scope.styles = Styles.query();
        $scope.insertBeer = function () {
            $scope.beer.styles = $filter('filterStyles')($scope.styles);
            Beers.create($scope.beer);
            $timeout(function (){
                $location.path('/beers').search({'created': $scope.beer.name});    
            }, 500);
        };
        $scope.cancel = function() {
            $location.path('/beers');
        };
    }
    
);

myApp.controller(
    'beerListController',
    function ($scope, Beers, Beer, $location, $timeout) {
        if ($location.search().hasOwnProperty('created')) {
            $scope.created = $location.search()['created'];
        }
        if ($location.search().hasOwnProperty('deleted')) {
            $scope.deleted = $location.search()['deleted'];
        }
        $scope.deleteBeer = function(beer_id) {
            var deleted = Beer.delete({id: beer_id});
            $timeout(function(){
                $location.path('/beers').search({'deleted': 1})
            }, 500);
            //$scope.beers = Beers.query();
        };
        $scope.beers = Beers.query();
    }
);

myApp.controller(
    'beerDetailsController', ['$scope', 'Beer', '$routeParams',
    function ($scope, Beer, $routeParams) {
        $scope.beer = Beer.get({id: $routeParams.id});
    }
]);


