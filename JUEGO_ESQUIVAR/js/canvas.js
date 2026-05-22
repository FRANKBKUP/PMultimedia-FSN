// Obtener canvas y contexto (PREPARANDO NUESTRO LIENZO)
var canvas = document.querySelector("#lienzo");
var ctx = canvas.getContext("2d");

// Variables del juego
var juegoActivo = false;
var puntuacion = 0;

/*=============================================
OBJETO JUGADOR (POO - Parte 1)
=============================================*/

var Jugador = function(x, y, ancho, alto, color) {
    this.x = x;
    this.y = y;
    this.ancho = ancho;
    this.alto = alto;
    this.color = color;
    this.velocidad = 5;
    this.teclaIzquierda = false;
    this.teclaDerecha = false;
};

Jugador.prototype.dibujar = function() {
    // Dibujar figura geométrica (rectángulo)
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.ancho, this.alto);
    
    // Efecto visual
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.ancho, this.alto);
};

Jugador.prototype.mover = function() {
    if (this.teclaIzquierda && this.x > 0) {
        this.x -= this.velocidad;
    }
    if (this.teclaDerecha && this.x < canvas.width - this.ancho) {
        this.x += this.velocidad;
    }
};

Jugador.prototype.detectarColision = function(obstaculo) {
    // AABB Collision Detection (Axis-Aligned Bounding Box)
    return this.x < obstaculo.x + obstaculo.radio * 2 &&
           this.x + this.ancho > obstaculo.x &&
           this.y < obstaculo.y + obstaculo.radio * 2 &&
           this.y + this.alto > obstaculo.y;
};

/*=============================================
OBJETO OBSTÁCULO (POO - Parte 1)
=============================================*/

var Obstaculo = function(x, y, radio, color) {
    this.x = x;
    this.y = y;
    this.radio = radio;
    this.color = color;
    this.velocidad = 2 + Math.random() * 2; // Velocidad aleatoria
};

Obstaculo.prototype.dibujar = function() {
    // Dibujar figura geométrica (círculo)
    ctx.beginPath();
    ctx.arc(this.x + this.radio, this.y + this.radio, this.radio, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Contorno
    ctx.strokeStyle = "#D32F2F";
    ctx.lineWidth = 2;
    ctx.stroke();
};

Obstaculo.prototype.mover = function() {
    this.y += this.velocidad;
};

Obstaculo.prototype.estaFueera = function() {
    return this.y > canvas.height;
};

/*=============================================
OBJETO PARTÍCULA (EFECTO VISUAL)
=============================================*/

var Particula = function(x, y, vx, vy, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.vida = 100;
};

Particula.prototype.dibujar = function() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.vida / 100;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalAlpha = 1;
};

Particula.prototype.mover = function() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // gravedad
    this.vida -= 2;
};

/*=============================================
ARRAYS Y VARIABLES GLOBALES
=============================================*/

var jugador = new Jugador(
    canvas.width / 2 - 20,
    canvas.height - 60,
    40,
    40,
    "#4CAF50"
);

var obstaculos = [];
var particulas = [];
var contadorOstaculos = 0;

/*=============================================
FUNCIÓN DIBUJAR (ANIMACIÓN)
=============================================*/

function dibujar() {
    if (!juegoActivo) {
        dibujarMenuInicio();
        return;
    }

    // Limpiar canvas
    ctx.fillStyle = "#e0f2f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Actualizar puntuación
    var puntuacionElement = document.querySelector("#puntuacion");
    puntuacionElement.textContent = puntuacion;

    // Dibujar jugador
    jugador.dibujar();
    jugador.mover();

    // Crear obstáculos
    contadorOstaculos++;
    if (contadorOstaculos > 30) {
        var x = Math.random() * (canvas.width - 40);
        var obstaculo = new Obstaculo(x, -40, 15, "#F44336");
        obstaculos.push(obstaculo);
        contadorOstaculos = 0;
    }

    // Mover y dibujar obstáculos
    for (var i = 0; i < obstaculos.length; i++) {
        obstaculos[i].mover();
        obstaculos[i].dibujar();

        // Detectar colisión
        if (jugador.detectarColision(obstaculos[i])) {
            juegoActivo = false;
            document.querySelector("#estado").textContent = "¡GAME OVER! Puntuación: " + puntuacion;
            crearExplosion(jugador.x + 20, jugador.y + 20);
        }

        // Eliminar obstáculos fuera de pantalla
        if (obstaculos[i].estaFueera()) {
            obstaculos.splice(i, 1);
            puntuacion += 10; // Sumar puntos por evitar
        }
    }

    // Dibujar y actualizar partículas
    for (var i = 0; i < particulas.length; i++) {
        particulas[i].mover();
        particulas[i].dibujar();

        if (particulas[i].vida <= 0) {
            particulas.splice(i, 1);
        }
    }

    // Aumentar dificultad
    if (puntuacion > 0 && puntuacion % 100 === 0) {
        jugador.velocidad = 5 + (puntuacion / 100) * 0.5;
    }
}

/*=============================================
FUNCIÓN MENÚ INICIO
=============================================*/

function dibujarMenuInicio() {
    // Fondo
    ctx.fillStyle = "#667eea";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Título
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("ESQUIVAR OBSTÁCULOS", canvas.width / 2, 150);

    // Instrucciones
    ctx.font = "20px Arial";
    ctx.fillText("Presiona ESPACIO para comenzar", canvas.width / 2, 350);

    // Última puntuación
    if (puntuacion > 0) {
        ctx.fillStyle = "#FFD700";
        ctx.font = "24px Arial";
        ctx.fillText("Última puntuación: " + puntuacion, canvas.width / 2, 420);
    }
}

/*=============================================
FUNCIÓN CREAR EXPLOSIÓN (PARTÍCULAS)
=============================================*/

function crearExplosion(x, y) {
    for (var i = 0; i < 20; i++) {
        var vx = (Math.random() - 0.5) * 8;
        var vy = (Math.random() - 0.5) * 8;
        var particula = new Particula(x, y, vx, vy, "#FF5722");
        particulas.push(particula);
    }
}

/*=============================================
EVENTOS DE TECLADO (PARTE 2 - POO)
=============================================*/

document.addEventListener("keydown", function(evento) {
    if (evento.key === "ArrowLeft") {
        jugador.teclaIzquierda = true;
    }
    if (evento.key === "ArrowRight") {
        jugador.teclaDerecha = true;
    }
    if (evento.key === " ") {
        evento.preventDefault();
        if (!juegoActivo) {
            juegoActivo = true;
            puntuacion = 0;
            obstaculos = [];
            particulas = [];
            contadorOstaculos = 0;
            jugador.velocidad = 5;
            document.querySelector("#estado").textContent = "¡Jugando!";
        }
    }
});

document.addEventListener("keyup", function(evento) {
    if (evento.key === "ArrowLeft") {
        jugador.teclaIzquierda = false;
    }
    if (evento.key === "ArrowRight") {
        jugador.teclaDerecha = false;
    }
});

/*=============================================
LOOP DE ANIMACIÓN
=============================================*/

function loop() {
    dibujar();
    requestAnimationFrame(loop);
}

// Iniciar juego
loop();
