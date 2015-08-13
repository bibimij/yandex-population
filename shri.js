/**
 * Реализация API, не изменяйте ее
 * @param {string} url
 * @param {function} callback
 */
function getData(url, callback) {
    var RESPONSES = {
        '/countries': [
            {name: 'Cameroon', continent: 'Africa'},
            {name: 'Fiji Islands', continent: 'Oceania'},
            {name: 'Guatemala', continent: 'North America'},
            {name: 'Japan', continent: 'Asia'},
            {name: 'Yugoslavia', continent: 'Europe'},
            {name: 'Tanzania', continent: 'Africa'}
        ],
        '/cities': [
            {name: 'Bamenda', country: 'Cameroon'},
            {name: 'Suva', country: 'Fiji Islands'},
            {name: 'Quetzaltenango', country: 'Guatemala'},
            {name: 'Osaka', country: 'Japan'},
            {name: 'Subotica', country: 'Yugoslavia'},
            {name: 'Zanzibar', country: 'Tanzania'},
        ],
        '/populations': [
            {count: 138000, name: 'Bamenda'},
            {count: 77366, name: 'Suva'},
            {count: 90801, name: 'Quetzaltenango'},
            {count: 2595674, name: 'Osaka'},
            {count: 100386, name: 'Subotica'},
            {count: 157634, name: 'Zanzibar'}
        ]
    };

    setTimeout(function () {
        var result = RESPONSES[url];
        if (!result) {
            return callback('Unknown url');
        }

        callback(null, result);
    }, Math.round(Math.random * 1000));
}

/*
Проблема 1. Переменные i, j и K, используемые в циклах, являются глобальными.

Проблема 2. Переменная l инициализируется при каждом вызове callback-функции.
Соответственно, количество элементов в l всегда будет равным единице,
и условие l.length == 3 никогда не выполнится.

Проблема 3. Ещё одно проблемное место в функции callback — строка
responses[request] = result;
В функции getData с помощью setTimeout эмулирован асинхронный
AJAX-запрос к серверу. Чаще всего получается так, что до прихода первого
«ответа» от сервера успевают выполниться три «запроса», а значение request
получается однаковым во всех трёх случаях.
Чтобы этого избежать, нужно написать инициализатор callback-функции:

var getCallback = function(request) {
  return function(error, result) {
    …
  };
}

Теперь вызов getData будет выглядеть так:

getData(request, getCallback(request));

В этом случае, будет создано 3 callback-функции для каждого запроса и разными
значениями переменной request.
*/

function RequestData(doneCallback){
  var _this = this;
  var requests = ['/countries', '/cities', '/populations'];
  var requestsCount = requests.length;
  var responses = {};
  var responsesCount = 0;

  var callback = function(request){
    return function(error, result){
      responses[request] = result;

      responsesCount++;

      if (responsesCount == requestsCount){
        _this.done(responses);
      }
    };
  };

  this.send = function(){
    for (var i = 0; i < requestsCount; i++){
      var request = requests[i];

      getData(request, callback(request));
    };
  };

  this.done = doneCallback;
}


function Population(query, doneCallback){
  var _this = this;
  var _responses = {};

  var countPopulation = function(responses){
    _responses = responses;

    var population = getCityPopulation(query);

    if (population === null) {
      population = getCountryPopulation(query);
    }

    _this.done(population);
  };

  var getCityPopulation = function(cityName){
    var cities = _responses['/populations'];

    cityName = cityName.toLowerCase();

    for (var i = cities.length - 1; i >= 0; i--) {
      var city = cities[i];

      if (city.name.toLowerCase() == cityName) {
        return city.count;
      }
    };

    return null;
  };

  var getCountryPopulation = function(countryName){
    var countries = _responses['/cities'];
    var population = null;

    countryName = countryName.toLowerCase();

    for (var i = countries.length - 1; i >= 0; i--) {
      var city = countries[i];

      if (city.country.toLowerCase() == countryName) {
        population += getCityPopulation(city.name)
      }
    };

    return population;
  };

  this.load = function(){
    var dataRequest = new RequestData(countPopulation);

    dataRequest.send();
  }

  this.done = doneCallback;
}

function countPopulationOfLocation(){
  var location = prompt('Введите город или страну');

  var output = function(count){
    var out = document.getElementById('output');
    var result = count === null ? 'город или страна не найдены' : count;

    out.innerHTML = location + ': ' + result;
  };

  var population = new Population(location, output);

  population.load();
}
