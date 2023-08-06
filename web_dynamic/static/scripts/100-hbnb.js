$(document).ready(() => {
  const amenities = {};
  const states = {};
  const cities = {};

  $('.amenities .popover ul input').on('change', (e) => {
    setChecked(e.target.checked, e.target.dataset, amenities);
    $('.amenities h4').text(Object.keys(amenities).join(', '));
  });

  $('.locations .popover ul input.state').on('change', (e) => {
    setChecked(e.target.checked, e.target.dataset, states);
    $('.locations h4').text(concatStates(states, cities));
  });

  $('.locations .popover ul input.city').on('change', (e) => {
    setChecked(e.target.checked, e.target.dataset, cities);
    $('.locations h4').text(concatStates(states, cities));
  });
  const setChecked = (checked, value = {}, amenityArray = {}) => {
    if (checked) {
      addItem(amenityArray, value);
    } else {
      removeItem(amenityArray, value);
    }
  };

  const removeItem = (amenityArray = {}, value = {}) => {
    if (amenityArray[value.name]) {
      delete amenityArray[value.name];
    } else {
      throw new Error('Id not in list');
    }
  };

  const addItem = (amenityArray = {}, value = {}) => {
    amenityArray[value.name] = value.id;
  };

  const concatStates = (states = {}, cities = {}) => {
    const allData = Object.keys(states).concat(Object.keys(cities));
    return allData.join(', ');
  };

  /* get api status */
  try {
    $.get('http://0.0.0.0:5001/api/v1/status/', (data) => {
      if (data) {
        data.status === 'OK' && $('header #api_status').addClass('available');
      }
    });
  } catch (err) {
    console.log(err);
  }

  const placeXMLcallBack = (data) => {
    $('section.places').html(
      data.map((place) => {
        return ` 
    <article>
      <div class="title_box">
        <h2>${place?.name}</h2>
        <div class="price_by_night">${place.price_by_night}</div>
      </div>
      <div class="information">
        <div class="max_guest">
          ${place?.max_guest} ${place.max_guest > 1 ? 'Guests' : 'Guest'}
        </div>
        <div class="number_rooms">
          ${place?.number_rooms} ${
          place?.number_rooms > 1 ? 'Bedrooms' : 'Bedroom'
        }
        </div>
        <div class="number_bathrooms">
          ${place?.number_bathrooms} ${
          place?.number_bathrooms > 1 ? 'Bathrooms' : 'Bathroom'
        }
        </div>
      </div>
      <div class="description">${place.description}</div>
    </article>
    `;
      })
    );
  };

  /* get all places */
  $.ajax({
    url: 'http://0.0.0.0:5001/api/v1/places_search/',
    type: 'POST',
    data: '{}',
    contentType: 'application/json',
    dataType: 'json',
    success: placeXMLcallBack,
  });

  const setQueryObj = (obj = {}) => {
    if (Object.values(amenities).length) {
      obj['amenities'] = Object.values(amenities);
    }
    if (Object.values(cities).length) {
      obj['cities'] = Object.values(cities);
    }
    if (Object.values(states).length) {
      obj['states'] = Object.values(states);
    }
  };
  /* get places according to amenities id */
  $('section.filters button').on('click', () => {
    const obj = {};
    setQueryObj(obj);
    $.ajax({
      url: 'http://0.0.0.0:5001/api/v1/places_search/',
      type: 'POST',
      data: JSON.stringify(obj),
      contentType: 'application/json',
      dataType: 'json',
      success: placeXMLcallBack,
    });
  });
});
