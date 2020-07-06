var app = angular.module("tspAngularApp", ["ngRoute","ngCookies"]);

const _URL_="http://localhost:3100";

app.config(function($httpProvider,$routeProvider,$cookiesProvider) {
  var $cookies;

  angular.injector(['ngCookies']).invoke(['$cookies', function(_$cookies_) {
    $cookies = _$cookies_;
  }]);

  if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
  }
  // extra
  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

  //$httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.post["Content-Type"] = "text/plain";

  $routeProvider
    .when("/", {
      templateUrl : "./views/categories/list.html",
      controller : "categoriesCtrl"
    })
    .when("/login/", {
      templateUrl : "./views/login/form.html",
      controller : "loginCtrl",
      controllerAs: 'vm'
    })
    .when("/register/", {
      templateUrl : "./views/register/form.html",
      controller : "registerCtrl",
      controllerAs: 'vm'
    })
    .when("/:idCat/", {
      templateUrl : "./views/products/list.html",
      controller : "productsCtrl"
    })
    .when('/search/:searchString', {
      templateUrl : "views/products/list.html",
      controller : "productsCtrl"
    })
    .when("/products/:id/", {
      templateUrl : "./views/products/details.html",
      controller : "productsCtrl"
    });
});
app.controller("loginCtrl", function ($scope,$http, $routeParams, $location, $cookies) {
  document.getElementById('header').style.display = "none";
  console.log("loginCtrl");
  var vm = this;

  $cookies.put("logged", "false");

  vm.dataLoading = false;

  $scope.login = function () {
    vm.dataLoading = true;
    console.log(vm.user);

    $http.post(_URL_ + "/login/",vm.user)
      .then(function (response) {
        console.log(response.data);
        if(response.data.error!=undefined){
          window.alert(response.data.error);
        }
        else{
          console.log("Redireccionando...");
          $cookies.put("logged", "true");
          var value = $cookies.get("logged");
          console.log(value);
          $location.path("/");
        }
        vm.dataLoading = false;
      });
  }
});
app.controller("registerCtrl", function ($scope,$http, $routeParams, $location, $cookies) {
  document.getElementById('header').style.display = "none";
  console.log("registerCtrl");
  var vm = this;
  vm.dataLoading = false;

  $scope.register = function () {
    vm.dataLoading = true;
    console.log(vm.user);

    $http.post(_URL_ + "/register/",vm.user)
      .then(function (response) {
        console.log(response.data);
        if(response.data.error!=undefined){
          window.alert(response.data.error);
        }
        else{
          console.log("Redireccionando...");
          $cookies.put("logged", "true");
          var value = $cookies.get("logged");
          console.log(value);
          $location.path("/");
        }
        vm.dataLoading = false;
      });
  }
});
app.controller("categoriesCtrl", function ($scope,$http, $routeParams, $location, $cookies) {
  document.getElementById('header').style.display = "block";
  var logged = $cookies.get("logged");
  console.log(logged);
  if(logged=="false"){
    $location.path("/login/");
    return;
  }
  var url="/categories/";
  console.log(url);
  $http.get(_URL_ + url)
    .then(function (response) {
      console.log(response.data);
      $scope.results = response.data;
  });
});
app.controller("productsCtrl", function ($scope,$http, $routeParams, $location, $cookies) {
  document.getElementById('header').style.display = "block";
  var logged = $cookies.get("logged");
  console.log(logged);
  if(logged=="false"){
    $location.path("/login/");
    return;
  }
  if($routeParams.searchString!=undefined){
    console.log("Búsqueda...");
    $http.get(_URL_ + "/products/search/" + $routeParams.searchString + "/")
      .then(function (response) {
        console.log(response.data);
        $scope.results = response.data;
      });
  }
  else if($routeParams.idCat!=undefined){
    console.log("Productos de la categoría...");
    $http.get(_URL_ + "/categories/" + $routeParams.idCat + "/")
      .then(function (response) {
        console.log(response.data);
        $scope.results = response.data;
      });
  }
  else if($routeParams.id!=undefined){
    console.log("Traer detalles...");
    $http.get(_URL_ + "/products/" + $routeParams.id + "/")
      .then(function (response) {
        console.log(response.data);
        $scope.data = response.data[0];
      });
  }
});
