#importação
from app import create_app

app = create_app() # cria um app importando da classe __init__

if __name__ == "__main__":
    app.run(debug=True) #roda o servidor