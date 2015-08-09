from flask import Flask
from flask_restful import reqparse, Resource, Api
from flask.ext.cors import CORS
import requests
from . import config
import json

app = Flask(__name__)
CORS(app)
api = Api(app)

parser = reqparse.RequestParser()

class BeerList(Resource):

    def get(self):
        print("Call for: GET /beers")
        url = config.es_base_url['beers']+'/_search'
        query = {
            "query": {
                "match_all": {}
            },
            "size": 100
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        beers = []
        for hit in data['hits']['hits']:
            beer = hit['_source']
            beer['id'] = hit['_id']
            beers.append(beer)
        return beers

    def post(self):
        print("Call for: POST /beers")
        parser.add_argument('name')
        parser.add_argument('producer')
        parser.add_argument('abv')
        parser.add_argument('description')
        parser.add_argument('styles', action='append')
        beer = parser.parse_args()
        print(beer)
        url = config.es_base_url['beers']
        resp = requests.post(url, data=json.dumps(beer))
        data = resp.json()
        return data

class Beer(Resource):

    def get(self, beer_id):
        print("Call for: GET /beers/%s" % beer_id)
        url = config.es_base_url['beers']+'/'+beer_id
        resp = requests.get(url)
        data = resp.json()
        beer = data['_source']
        return beer

    def put(self, beer_id):
        """TODO: update functionality not implemented yet."""
        pass

    def delete(self, beer_id):
        print("Call for: DELETE /beers/%s" % beer_id)
        url = config.es_base_url['beers']+'/'+beer_id
        resp = requests.delete(url)
        data = resp.json()
        return data

class Style(Resource):
    pass

class StyleList(Resource):

    def get(self):
        print("Call for /styles")
        url = config.es_base_url['styles']+'/_search'
        query = {
            "query": {
                "match_all": {}
            },
            "size": 100
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        styles = []
        for hit in data['hits']['hits']:
            style = hit['_source']
            style['id'] = hit['_id']
            styles.append(style)
        return styles

class Search(Resource):

    def get(self):
        print("Call for GET /search")
        parser.add_argument('q')
        query_string = parser.parse_args()
        url = config.es_base_url['beers']+'/_search'
        query = {
            "query": {
                "multi_match": {
                    "fields": ["name", "producer", "description", "styles"],
                    "query": query_string['q'],
                    "type": "cross_fields",
                    "use_dis_max": False
                }
            },
            "size": 100
        }
        resp = requests.post(url, data=json.dumps(query))
        data = resp.json()
        beers = []
        for hit in data['hits']['hits']:
            beer = hit['_source']
            beer['id'] = hit['_id']
            beers.append(beer)
        return beers

api.add_resource(Beer, config.api_base_url+'/beers/<beer_id>')
api.add_resource(BeerList, config.api_base_url+'/beers')
api.add_resource(StyleList, config.api_base_url+'/styles')
api.add_resource(Search, config.api_base_url+'/search')


