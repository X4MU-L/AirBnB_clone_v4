$(window).on('load', () => {
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
