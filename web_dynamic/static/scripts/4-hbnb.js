$(document).ready(() => {
  const amenity_ids = [];
  const amenity_names = [];

  $('.popover ul input').on('change', (e) => {
    setChecked(e.target.checked, e.target.dataset, amenity_ids, amenity_names);
    $('.amenities h4').text(amenity_names.join(', '));
  });

  const setChecked = (checked, value = {}, idArray = [], namesArray = []) => {
    if (checked) {
      addItem(idArray, namesArray, value);
    } else {
      removeItem(idArray, namesArray, value);
    }
  };

  const removeItem = (idArray = [], namesArray = [], value = {}) => {
    const index = idArray.indexOf(value.id);
    if (index !== -1) {
      idArray.splice(index, 1);
      namesArray.splice(index, 1);
    } else {
      throw new Error('Id not in list');
    }
  };

  const addItem = (idArray = [], namesArray = [], value = {}) => {
    idArray.push(value.id);
    namesArray.push(value.name);
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
      ${
        place?.user?.first_name &&
        `<div class='user'> <b>Owner:</b>${place?.user?.first_name} ${place?.user?.last_name}</div>`
      } 
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

  /* get places according to amenities id */
  $('section.filters button').on('click', () => {
    const obj = { amenities: amenity_ids };
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
