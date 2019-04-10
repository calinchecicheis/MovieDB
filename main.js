var API_URL = 'https://api.themoviedb.org/3';
var API_KEY = '8aa3913299aa0b0b22b59118aac91b8e';
var page = 1;



function getGenres() {
    $.ajax({
        url: API_URL + '/genre/movie/list',
        data: {
            api_key: API_KEY
        },
        success: function(data) {
          addGenres(data.genres);
        }
    });
}

function addGenres(genres) {
  var genresContainer = $('#genres');
  genresContainer.empty();
  genresContainer.html('<option value="">All</option>');
  genres.forEach(function(item) {
    genresContainer.append('<option value="' + item.id + '">' + item.name + '</option>');
  });
  genresContainer.change(updateMovies);
}

function addSorts() {
  var sortContainer = $('#sort');

  sortContainer.change(updateMovies);
}

function updateMovies() {
  getMovies(page);
}

function getMovieCredits(id, container) {
  $.ajax({
    url: API_URL + '/movie/' + id + '/credits',
    data: {
      api_key: API_KEY,
    },
    success: function(item) {
      console.log('Gottt', item);
      var itemContainer = $('<div><b>Actors:</b></div>')
      item.cast.slice(0, 5).forEach(function(cast) {
        itemContainer.append('<div>- <i>' + cast.name + '</i> plays <i>' + cast.character + '</i></div>');
      });
      container.append(itemContainer);
    },
  });
}
function getMovieDetails(id, container) {
  $.ajax({
    url: API_URL + '/movie/' + id,
    data: {
      api_key: API_KEY,
    },
    success: function(item) {
      console.log('Got', item);
      var itemContainer = $('<div></div>')
          .append('<h2>' + item.title + '</h2>')
          .append('<img src="http://image.tmdb.org/t/p/w780' + item.backdrop_path + '" />')
          .append('<div><b>Genres:</b> ' + item.genres.map(function(genre) { return genre.name; }).join(', ') + '</div>')
          .append('<div><b>Release date:</b> ' + item.release_date + '</div>')
          .append('<div><b>Run time:</b> ' + item.runtime + ' minutes</div>')
          .append('<div><b>Revenue:</b> $' + item.revenue + '</div>');
      container.empty();
      container.append(itemContainer);
      getMovieCredits(id, container);
    },
  });
}

function receivedMovies(data) {
  var results = data.results;
    console.log(data);
    var resultsContainer = $('#results');
  resultsContainer.empty();
  results.forEach(function(item) {
    var itemContainer = $('<div  class="card"></div>')
        .append('<h2>' + item.title + '</h2>')
        .append($('<div class="cardAlignment"></div>')
        .append('<img src="http://image.tmdb.org/t/p/w92' + item.poster_path + '" />')
        .append($('<div class="cardContainer"></div>')
        .append('<div><b>Year:</b> ' + item.release_date.substr(0, 4) + '</div>')
        .append('<div><b>Rating:</b> ' + item.vote_average + ' of ' + item.vote_count + ' votes</div>')
        .append('<div><b>Overview:</b> ' + item.overview + '</div>')
    ));

    itemContainer.click(function(){
      var container = $('#dialog');
      container.html('Loading...');
      getMovieDetails(item.id, container);
      container.dialog('open');
    });

    resultsContainer.append(itemContainer);
    $('#pageCount').html("Total pages: "+data.total_pages);
    var pagingContainer = $('#paging');
    page = data.page;
    pagingContainer.empty();
    if (page > 1) {
      pagingContainer.append('<a href="javascript:getMovies(' + (page - 1) + ')">&lt;</a>');
    }
      pagingContainer.append('<span> ' + data.page + ' </span>');
    if (data.total_pages > page) {
      pagingContainer.append('<a href="javascript:getMovies(' + (page + 1) + ')">&gt;</a>');
    }
  });
}

function getMovies(page) {
  $.ajax({
    url: API_URL + '/discover/movie',
    data: {
      api_key: API_KEY,
      sort_by: $('#sort').val(),
      page: page,
      with_genres: $('#genres').val(),
      'primary_release_date.lte': $('#yearMax').val(),
      'primary_release_date.gte': $('#yearMin').val(),
      'vote_average.lte': $('#ratingMax').val(),
      'vote_average.gte': $('#ratingMin').val()
    },
    success: receivedMovies
  });
}

function searchMovies() {
  $.ajax({
    url: API_URL + '/search/movie',
    data: {
      api_key: API_KEY,
      query: $('#keyword').val(),
    },
    success: receivedMovies
  });
}


$(document).ready(function() {
  getGenres();
  addSorts();
  $('#yearMin').change(updateMovies);
  $('#yearMax').change(updateMovies);
  $('#ratingMin').change(updateMovies);
  $('#ratingMax').change(updateMovies);
  updateMovies();

  $('#dialog').dialog({
    autoOpen: false,
    modal: true,
    width: 800,
    position: { my: "center", at: "center top", of: window },
  });
});
