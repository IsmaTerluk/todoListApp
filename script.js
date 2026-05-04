document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const pendingCount = document.getElementById('pending-count');
    const clearAllBtn = document.getElementById('clear-all');
    const dateDisplay = document.getElementById('date-display');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Mostrar fecha actual
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('es-ES', options);

    // Inicializar app
    function init() {
        renderTodos();
        updateStats();
    }

    // Guardar en LocalStorage
    function saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // Agregar tarea
    function addTodo() {
        const text = todoInput.value.trim();
        if (text === '') return;

        const newTodo = {
            id: Date.now(),
            text: text,
            completed: false
        };

        todos.push(newTodo);
        todoInput.value = '';
        saveToLocalStorage();
        renderTodos();
        updateStats();
        
        // Animación de entrada para el nuevo elemento
        const lastItem = todoList.lastElementChild;
        if (lastItem) {
            lastItem.style.animation = 'none';
            lastItem.offsetHeight; // trigger reflow
            lastItem.style.animation = 'slideIn 0.3s ease-out forwards';
        }
    }

    // Alternar estado de completado
    function toggleTodo(id) {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveToLocalStorage();
        renderTodos();
        updateStats();
    }

    // Eliminar tarea
    function deleteTodo(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        element.style.transform = 'translateX(20px)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveToLocalStorage();
            renderTodos();
            updateStats();
        }, 300);
    }

    // Renderizar lista
    function renderTodos() {
        todoList.innerHTML = '';
        
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'pending') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `<div class="empty-msg">No hay tareas ${currentFilter !== 'all' ? currentFilter : ''}</div>`;
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);
            
            li.innerHTML = `
                <div class="checkbox" onclick="event.stopPropagation()"></div>
                <span>${todo.text}</span>
                <button class="delete-btn">
                    <i class="fas fa-trash-can"></i>
                </button>
            `;

            // Eventos
            li.addEventListener('click', () => toggleTodo(todo.id));
            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
            });

            todoList.appendChild(li);
        });
    }

    // Actualizar contador
    function updateStats() {
        const pending = todos.filter(todo => !todo.completed).length;
        pendingCount.innerText = `${pending} tarea${pending !== 1 ? 's' : ''} pendiente${pending !== 1 ? 's' : ''}`;
    }

    // Event Listeners
    addBtn.addEventListener('click', addTodo);
    
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres eliminar todas las tareas?')) {
            todos = [];
            saveToLocalStorage();
            renderTodos();
            updateStats();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTodos();
        });
    });

    init();
});
