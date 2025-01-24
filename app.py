from sqlalchemy import create_engine, Boolean, Integer, String, Column, ForeignKey, DateTime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from flask import Flask, render_template, request, jsonify
from datetime import datetime
from flask_cors import CORS


app=Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://127.0.0.1:5500", "http://localhost:5500"]
    }
})


#set up the db create_engine
engine=create_engine('sqlite:///todo.db', echo=True)
#base class for orm models
base=declarative_base()

class Todo(base):
    __tablename__ = 'todo'
    id=Column(Integer, primary_key=True)
    task=Column(String(200), nullable=False)
    completed=Column(Boolean,default=False)
    created_at=Column(DateTime, default=datetime.utcnow())
    due_date=Column(DateTime, nullable=True)
    priority=Column(String(200), default='medium')

    def to_dict(self):
        return {
            'id': self.id,
            'task': self.task,
            'completed': self.task,
            'created_at': self.created_at.strftime('%y-%m-%d:%H:%M:%S'),
            'due_date': self.due_date.strftime('%Y-%m-%d') if self.due_date else None,
            'priority': self.priority
        }

base.metadata.create_all(engine)

#set up session
Session=sessionmaker(bind=engine)
session=Session()

@app.route('/')
def home():
    return render_template('index.html')

#retrieve data
@app.route('/api/todos', methods=['GET'])
def get_todos():
    todos = session.query(Todo).all()
    return jsonify([todo.to_dict() for todo in todos])

@app.route('/api/todos', methods=['POST'])
def createtodo():
    data=request.get_json()
    todo=Todo(
        task=data.get('task'),
        priority=data.get('priority','medium')
    )
    if data.get('due_date'):
        todo.due_date=datetime.strptime(data['due_date'], '%Y-%m-%d')
    session.add(todo)
    session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>/toggle', methods=['POST'])
def toggle(todo_id):
    todo=session.query(Todo).get(todo_id)
    if not todo:
        return jsonify('{error: Todo not found}'), 403
    todo.completed= not todo.completed
    session.commit()
    return jsonify(todo.to_dict())

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    todo=session.query(Todo).get(todo_id)
    session.delete(todo_id)
    session.commit()
    return jsonify({'message': 'Todo deleted'})

if __name__ == "__main__":
    app.run(debug=True)