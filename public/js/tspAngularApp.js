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
    .when("/cart/", {
      templateUrl : "./views/cart/form.html",
      controller : "cartCtrl",
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

  $scope.addToCart = function (id) {
    console.log(id);
    var cartJSON = $cookies.get("cart");
    if(cartJSON==undefined){
      cart=[];
    } else {
      cart=JSON.parse(cartJSON);
    }
    var existente=0;
    for(var i=0;i<cart.length;i++){
      if(cart[i].id==id){
        existente=1;
        cart[i].cant=cart[i].cant+1;
      }
    }
    if(existente==0) cart.push({id: id, cant:1});
    $cookies.put("cart", JSON.stringify(cart));
    console.log(cart);
    window.alert("Elemento agregado al carrito.");
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

app.controller("cartCtrl", function ($scope,$http, $routeParams, $location, $cookies) {
  document.getElementById('header').style.display = "block";
  var logged = $cookies.get("logged");
  console.log(logged);
  if(logged=="false"){
    $location.path("/login/");
    return;
  }

  var cartJSON = $cookies.get("cart");
  if(cartJSON==undefined){
    cart=[];
  } else {
    cart=JSON.parse(cartJSON);
  }
  console.log(cart);
  var stringIds="0";
  for(var i=0;i<cart.length;i++){
    stringIds+=",";
    stringIds+=cart[i].id;
  }
  console.log(stringIds);

  $http.get(_URL_ + "/cart/" + stringIds)
    .then(function (response) {
      for(var i=0;i<response.data.length;i++){
        for(var j=0;j<cart.length;j++){
          if(response.data[i].id==cart[j].id) response.data[i].cant=cart[j].cant;
        }
      }
      console.log(response.data);
      $scope.results = response.data;
    });

});
