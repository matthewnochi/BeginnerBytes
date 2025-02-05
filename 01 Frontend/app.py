from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

@app.route('/search', methods=['POST'])
def search():
    query = request.json.get('query') 
    results = program(query)
    
    return jsonify(results) 

if __name__ == '__main__':
    app.run(debug=True)


def program(query):
    return query + query
