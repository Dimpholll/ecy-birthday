from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/wishes')
def wishes():
    return render_template('tree.html')

if __name__ == '__main__':
    app.run(debug=True)