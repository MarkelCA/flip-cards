// JQuery onload
$(function(){
	var DELAY_EMPEZAR_PARTIDA = 2000;
	const DELAY_VOLTEAR_PIEZA= 500;
	var moves = 0;
	$('#modo-juego').val(0); // Establecemos el primero como opción predeterminada
	$('#game-content').css('display', 'none');
	timer();
	$('#modo-juego').change(
		function () { // Función anónima que recoge los valores del modo de juego y manda a construir el tablero
			var cols = $(this).val()[0]; // Recogemos el valor de las filas y las columnas según el formato FxC
			var rows = $(this).val()[2]; // Recogemos el valor de las filas y las columnas según el formato FxC

			$('.cell').removeClass('cell'); // Reseteamos las celdas
			crearTablero(cols, rows);
			registrarEnTabla($(this).val());

			// Mostramos la zona de juego
			if($(this).val() == 0) {
				console.log($(this).val());
				$('#game-content').css('display', 'none');
			}else {
				$('#game-content').css('display', 'block');
			}
	});


	function crearTablero(cols, rows) {
		$('#game-content').css('display', 'block');
		var tablero = $('#tablero');
		tablero.html(''); // Vaciamos la tabla para resetearla
		var cellCount = 1; // Esta variable cuenta el número de celdas que son creadas
		var coupleCount = 1; // Esta cuenta el número de pares que son creados

		for (let i = 0 ; i < rows ; i++) {
			tablero.append('<div class="row"></div>')
			let fila = $('.row').eq(i);

			for (let j = 0 ; j < cols ; j++) {
				fila.append(`<div id="box${cellCount}" class="cell couple${coupleCount}"></div>`)


				if(cellCount%2 == 0) // Si el número de la celda es par crea una nueva pareja, sino, crea otra celda con el id de su pareja
					coupleCount++;
				
				cellCount++;
			}
		}

		seleccionarCasilla();
	}

	function randomizador(col, rows) {
		moves = 0;
		var countCeldas = col*rows/2; 
		var numeros = [...Array(countCeldas).keys()];

		var arrayNumbers = [];

		do{
			var x = Math.floor(Math.random() * countCeldas + 1);

			if(getOccurrence(arrayNumbers, x) < 2) // Si esta menos de dos veces mételo
				arrayNumbers.push(x);

		}while(arrayNumbers.length < numeros.length*2);  


		return arrayNumbers;

	}

	function getOccurrence(array, value) {
	    var count = 0;
	    array.forEach((v) => (v === value && count++));
	    return count;
	}

	$('#jugar_otra_partida').click(function() {
		$('#partida-terminada').css('display', 'none');
		$('#desordenar').click();
	});
	$('#volver_atras').click(function() {
		$('#partida-terminada').css('display', 'none');
	});
	$('#desordenar').click(function () { // Funcion para desordenar las fichas
		$('#gamemode-value').text($('#modo-juego').val());
		$('#partida-terminada').css('display', 'none');
		console.log($('.cell'));
		var cols = $('#modo-juego').val()[0]; // Recogemos el valor de las filas y las columnas según el formato FxC
		var rows = $('#modo-juego').val()[2]; // Recogemos el valor de las filas y las columnas según el formato FxC
		var randomIds = randomizador(cols, rows)
		var celdas = $('.cell');

		var i = 0; // Para indicar la posicion del array randomIds
		for(x of celdas) {
			x.className = 'cell couple'+randomIds[i];

			i++;
		}

		console.log('desordenando piezas')
		setTimeout(function() {
			$('.cell').addClass('misteryCell');
		}, DELAY_EMPEZAR_PARTIDA);
	});


	function seleccionarCasilla(){ // Esta función es cargada posteriormente al spawn de la tabla, de otra forma el evento click hace referencia a una celada que no existe
	 	var casillasSeleccionadas = [];
		$('.cell').click(function() {
			moves++;
			$('#moves-number').text(moves);
			if(casillasSeleccionadas.length > 0){
				if($(this).attr('id') == casillasSeleccionadas[0].attr('id')){
					console.log(casillasSeleccionadas)
					console.log('misma ficha')
					return;
				}
			}
			var clicked_visible_cell = ($(this).attr('class').search('misteryCell')) === -1;
				if(clicked_visible_cell){
					console.log('no puedes seleccionar una pieza que ya has descubierto');
					return;
				}
			 
			$(this).addClass('selected');
			$(this).removeClass('misteryCell');
			casillasSeleccionadas.push($(this));



			if(casillasSeleccionadas.length == 2) {

				dosCasillas(casillasSeleccionadas);
				casillasSeleccionadas = [];


			}
			var countCell = $('.cell').length;
			var countDiscovered = $('.discovered').length;
			if(countCell === countDiscovered){
				partidaTerminada();
			}
		});
	}

	function dosCasillas(fichas) {
		var class1 = fichas[0].attr('class');
		var class2 = fichas[1].attr('class');

		var cell1_discovered = fichas[0].attr('class').search('discovered') !== -1;
		
		if(cell1_discovered){
			return;
		}

		if(class1 === class2){
			var class1 = fichas[0].addClass('discovered rainbow-box');
			var class2 = fichas[1].addClass('discovered rainbow-box');
		}
		else {

			limpiarCasillas(fichas);
		}
	}

	function limpiarCasillas(fichas) {
			setTimeout(function(){
				fichas[0].addClass('misteryCell');
				fichas[1].addClass('misteryCell');
			}, DELAY_VOLTEAR_PIEZA);

	}

	function partidaTerminada() {
		console.log('partida terminada')
		var tiempo = $('#time-number').html();
		$('#tiempo_final').html("¡Has terminado en "+tiempo+"!");
		clearInterval(intervalo_tiempo);
		$('#partida-terminada').css('display', 'block');
		var guardar = confirm('¡Buen trabajo!, ¿Quieres guardar tu partida para la tabla de puntuaciones?');

		if(guardar){
			do{
				var nombre = prompt('Introduzca su nombre por favor.');
				if (nombre == null) {
					nombre = '...'
					break;
				}
				else {
					var valid = nombre.match(/\w+/g);
					console.log(nombre)
					console.log(valid)
					if(!valid){
						alert('Ese nombre no es válido, no se permiten los caráceteres especiales.')
						continue;
					}
				}
			}while(!valid);

			console.log(`felicidades ${nombre}`);
			$('#player-name').text(nombre);
			storeInLocal(nombre);
			registrarEnTabla($('#modo-juego').val());
		}
	}

	function storeInLocal(nombre) {
		var time = $('#time-number').html();
		var finalmoves = moves;
		var datosPartida = {nombre, time, moves};
		var gamemode = $('#modo-juego').val();

		// Recogo la tabla de puntuaciones del localStorage

		var getLeaderBoard = JSON.parse(localStorage.getItem('leaderboard'));
		console.log(getLeaderBoard);
		// Si esta vacia creo un objeto vacio y le defino longitud 0
		if(getLeaderBoard == null) {
			getLeaderBoard = {};
			var countGames = 0;
		}
		// Si esta llena le defino la longitud contando sus atributos
		else{
			countGames = Object.keys(getLeaderBoard).length
		} 
		 console.log(getLeaderBoard);
		// Utilizo su longitud para ponersela como numero de esa partida
		if(getLeaderBoard[gamemode] == null) {
			getLeaderBoard[gamemode] = [{}];
			var countGames = 0;
		}
		else{
			countGames = Object.keys(getLeaderBoard[gamemode]).length
		} 
		getLeaderBoard[gamemode][countGames] = datosPartida;
		// lo ordeno antes de meterlo
		sortObject(getLeaderBoard,'moves', 'time');
		var cont = 0;
		getLeaderBoard[gamemode].forEach(function(x) {
			console.log(getLeaderBoard[gamemode]);
			if(cont >= 9) {
				//console.log('nah')
				getLeaderBoard[gamemode].pop();
			}
			cont++;
		});
		// Lo guardo al localStorage en formato String
		localStorage.setItem('leaderboard', JSON.stringify(getLeaderBoard));
		// Lo saco del storage para comprobar que se ha guardado
		var finalLeaderBoard = JSON.parse(localStorage.getItem('leaderboard'));
	}

	$('#vaciar-tabla').click(function() {
		if(confirm('¿Está seguro/a que desea vaciar la tabla de puntuaciones?')){
			var getLeaderBoard = JSON.parse(localStorage.getItem('leaderboard'));

			alert('borrando');
			getLeaderBoard[$('#modo-juego').val()]=null;
			console.log(getLeaderBoard);

			localStorage.setItem('leaderboard', JSON.stringify(getLeaderBoard));
			//localStorage.removeItem('leaderboard');

			registrarEnTabla($('#modo-juego').val());
			console.log('Historial vaciado');
		}
	});

	function registrarEnTabla(modo_juego) {

		console.log('registrar en tabla');

		var leaderboard = JSON.parse(localStorage.getItem('leaderboard'));


var cabecera = '<tr><th>Posición</th><th>Nombre</th><th>Movimientos</th><th>Tiempo</th></tr>'; // Vaciamos la tabla a excepcion de la cabecera para resetearla y que no se repitan
		
		$('#leaderboard table').html(`<caption>${modo_juego}</caption>${cabecera}`);

		for(i in leaderboard){ // leemos el localStorage y almacenamos los datos en la tabla
			if(modo_juego == i) { 
				for(j in leaderboard[i]){
					console.log(leaderboard[i])
					let nombre = leaderboard[i][j].nombre;
					let moves = leaderboard[i][j].moves;
					let time = leaderboard[i][j].time;

					$('#leaderboard table').append(`<tr><td>${parseInt(j)+1}</td><td>${nombre}</td><td>${moves}</td><td>${time}</td></tr>`);
				}
			}
		}

	}
	function sortObject(object, first_field, second_field){
		var leaderboard = object;
		var gamemode = $('#modo-juego').val();
		console.log(leaderboard[gamemode]);

	leaderboard[gamemode].sort(function(a, b) {
		    return a["moves"] - b["moves"] || a["time"] - b["time"];
		});
		console.log(leaderboard[gamemode])
	}
	function timer() {
		$('#desordenar').click(function(){
			setTimeout(function() {
				tiempo_inicial = new Date(), 
				// Al elemento de id time le asocia el siguiente contenido. Fecha nueva (actual) menos la fecha inicial y lo divide entre 1000 para sacar los milisegundos
				intervalo_tiempo = setInterval(`time.innerHTML='Tiempo: <span id="time-number">'+(new Date()-tiempo_inicial)/1000+"</span>"`) ;
			}, DELAY_EMPEZAR_PARTIDA);
		});

	}
});
