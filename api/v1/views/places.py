#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Places """
from models.state import State
from models.city import City
from models.place import Place
from models.user import User
from models.amenity import Amenity
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/cities/<city_id>/places', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/place/get_places.yml', methods=['GET'])
def get_places(city_id):
    """
    Retrieves the list of all Place objects of a City
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    places = [place.to_dict() for place in city.places]

    return jsonify(places)


@app_views.route('/places/<place_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/place/get_place.yml', methods=['GET'])
def get_place(place_id):
    """
    Retrieves a Place object
    """
    place = storage.get(Place, place_id)
    if not place:
        abort(404)

    return jsonify(place.to_dict())


@app_views.route('/places/<place_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/place/delete_place.yml', methods=['DELETE'])
def delete_place(place_id):
    """
    Deletes a Place Object
    """

    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    storage.delete(place)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/cities/<city_id>/places', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/place/post_place.yml', methods=['POST'])
def post_place(city_id):
    """
    Creates a Place
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    if 'user_id' not in request.get_json():
        abort(400, description="Missing user_id")

    data = request.get_json()
    user = storage.get(User, data['user_id'])

    if not user:
        abort(404)

    if 'name' not in request.get_json():
        abort(400, description="Missing name")

    data["city_id"] = city_id
    instance = Place(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/places/<place_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/place/put_place.yml', methods=['PUT'])
def put_place(place_id):
    """
    Updates a Place
    """
    place = storage.get(Place, place_id)

    if not place:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")

    ignore = ['id', 'user_id', 'city_id', 'created_at', 'updated_at']

    for key, value in data.items():
        if key not in ignore:
            setattr(place, key, value)
    storage.save()
    return make_response(jsonify(place.to_dict()), 200)


@app_views.route('/places_search', methods=['POST'], strict_slashes=False)
@swag_from('documentation/place/post_search.yml', methods=['POST'])
def places_search():
    """
    Retrieves all Place objects depending of the JSON in the body
    of the request
    """

    all_places = storage.all(Place).values()

    req = request.get_json(silent=True)
    if req is None:
        abort(400, description="Not a JSON")

    if len(req) == 0:
        return jsonify([place.to_dict() for place in all_places])

    state_ids = req.get("states", None)
    city_ids = req.get("cities", None)
    amenity_ids = req.get("amenities", None)
    places_in_state = []
    places_in_cities = []

    if isinstance(state_ids, list):
        states = [storage.get(State, id) for id in state_ids]
        cities = [[city for city in state.cities] for state in states if state]
        for inner_city in cities:
            for city in inner_city:
                if city:
                    places_in_state.extend([place for place in city.places
                                            if place not in places_in_state])
    if isinstance(city_ids, list):
        cities = [storage.get(City, id) for id in city_ids]
        for city in cities:
            if city:
                places_in_cities.extend([place for place in city.places
                                         if place not in places_in_cities])

    places_in_cities.extend(places_in_state)
    places_filtered = set(places_in_cities)

    if not amenity_ids:
        return jsonify([place.to_dict() for place in places_filtered])

    if len(places_filtered) == 0 and not state_ids and not city_ids:
        new_places = filter_places_by_amenity(all_places, amenity_ids)
        return jsonify([place.to_dict() for place in new_places])

    new_places = filter_places_by_amenity(places_filtered, amenity_ids)
    return jsonify([place.to_dict() for place in new_places])


def filter_places_by_amenity(places, amenity_ids):
    new_places = []
    for place in places:
        if all(map(lambda amenity_id: 1 if amenity_id in
                   [amenity.id for amenity in place.amenities]
                   else 0, amenity_ids)):
            del place.amenities
            new_places.append(place)
    return new_places
