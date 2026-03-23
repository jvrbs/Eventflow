from flask import Flask

def create_app():
    #define app como objeto Flask
    app = Flask(__name__)
    return app