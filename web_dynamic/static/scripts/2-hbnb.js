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
    $.get('http://0.0.0.0:5001/api/v1/status/', (data, status) => {
      if (data) {
        data.status === 'OK' && $('header #api_status').addClass('available');
      }
    });
  } catch (err) {
    console.log(err);
  }
});
